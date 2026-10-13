
from datetime import datetime, timezone

from services.embeddings import (
    NOME_MODELO,
    gerar_embeddings
)


def indexar_chunks(banco, tamanho_lote=16):
    """
    Gera e salva embeddings dos chunks ainda não indexados.
    """

    colecao = banco["chunks"]

    filtro = {
        "texto": {"$type": "string", "$ne": ""},
        "$or": [
            {"embedding": {"$exists": False}},
            {"modelo_embedding": {"$ne": NOME_MODELO}}
        ]
    }

    total = colecao.count_documents(filtro)

    print(f"Chunks pendentes: {total}")

    if total == 0:
        return 0

    processados = 0

    while True:
        documentos = list(
            colecao.find(
                filtro,
                {"_id": 1, "texto": 1}
            ).limit(tamanho_lote)
        )

        if not documentos:
            break

        textos = [doc["texto"] for doc in documentos]

        vetores = gerar_embeddings(textos)

        for documento, vetor in zip(
            documentos,
            vetores
        ):
            if len(vetor) != 384:
                raise ValueError(
                    "O embedding não possui 384 dimensões."
                )

            colecao.update_one(
                {"_id": documento["_id"]},
                {
                    "$set": {
                        "embedding": vetor,
                        "modelo_embedding": NOME_MODELO,
                        "indexado_em": datetime.now(
                            timezone.utc
                        )
                    }
                }
            )

            processados += 1

        print(f"Processados: {processados}/{total}")

    return processados
