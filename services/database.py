
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING, UpdateOne


load_dotenv()


def conectar_mongodb():
    """Conecta ao MongoDB Atlas."""

    uri = os.getenv("MONGO_URI")
    nome_banco = os.getenv("MONGO_DB", "edital_facil")

    if not uri:
        raise ValueError("MONGO_URI não configurada no .env")

    cliente = MongoClient(
        uri,
        serverSelectionTimeoutMS=10000
    )

    try:
        cliente.admin.command("ping")
    except Exception:
        cliente.close()
        raise

    return cliente, cliente[nome_banco]


def criar_indices(banco):
    """Cria índices para evitar registros duplicados."""

    banco.documentos.create_index(
        [("documento_id", ASCENDING)],
        unique=True
    )

    banco.chunks.create_index(
        [("chunk_id", ASCENDING)],
        unique=True
    )

    banco.chunks.create_index(
        [("documento_id", ASCENDING)]
    )


def salvar_edital(
    banco,
    documento_id,
    nome_arquivo,
    concurso,
    cargo,
    total_paginas,
    chunks
):
    """Salva o edital e seus chunks no MongoDB."""

    if not concurso.strip() or not cargo.strip():
        raise ValueError("Informe o concurso e o cargo.")

    if not chunks:
        raise ValueError("Não existem chunks para salvar.")

    criar_indices(banco)

    # Evita mudar metadados de um PDF já cadastrado
    existente = banco.documentos.find_one({
        "documento_id": documento_id
    })

    if existente and existente.get("status") == "concluido":
        return {
            "sucesso": True,
            "novo": False,
            "total_chunks": existente.get("total_chunks", 0)
        }

    agora = datetime.now(timezone.utc)

    registro = {
        "documento_id": documento_id,
        "nome_arquivo": nome_arquivo,
        "concurso": concurso.strip(),
        "cargo": cargo.strip(),
        "total_paginas": total_paginas,
        "total_chunks": len(chunks),
        "status": "processando",
        "atualizado_em": agora
    }

    banco.documentos.update_one(
        {"documento_id": documento_id},
        {
            "$set": registro,
            "$setOnInsert": {"criado_em": agora}
        },
        upsert=True
    )

    try:
        operacoes = []

        for chunk in chunks:
            operacoes.append(
                UpdateOne(
                    {"chunk_id": chunk["chunk_id"]},
                    {"$set": chunk},
                    upsert=True
                )
            )

        banco.chunks.bulk_write(operacoes)

        banco.documentos.update_one(
            {"documento_id": documento_id},
            {"$set": {"status": "concluido"}}
        )

        return {
            "sucesso": True,
            "novo": True,
            "total_chunks": len(chunks)
        }

    except Exception:
        banco.documentos.update_one(
            {"documento_id": documento_id},
            {"$set": {"status": "erro"}}
        )
        raise


def listar_editais(banco):
    """Lista os editais armazenados."""

    return list(
        banco.documentos.find(
            {},
            {"_id": 0}
        ).sort("criado_em", -1)
    )
