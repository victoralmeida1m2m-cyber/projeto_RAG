
from services.embeddings import gerar_embedding


def buscar_trechos(
    banco,
    pergunta: str,
    documento_id: str,
    limite: int = 3
) -> list[dict]:
    """
    Busca os trechos semanticamente mais próximos
    de uma pergunta, dentro de um edital específico.
    """

    if not pergunta.strip():
        raise ValueError("A pergunta não pode estar vazia.")

    if not documento_id:
        raise ValueError("Selecione um documento.")

    if limite < 1:
        raise ValueError("O limite deve ser positivo.")

    # 1. Transforma a pergunta em um vetor
    vetor_pergunta = gerar_embedding(pergunta)

    # 2. Monta a busca vetorial do MongoDB
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": vetor_pergunta,
                "numCandidates": max(100, limite * 20),
                "limit": limite,
                "filter": {
                    "documento_id": documento_id
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "texto": 1,
                "pagina_pdf": 1,
                "documento_id": 1,
                "chunk_id": 1,
                "pontuacao": {
                    "$meta": "vectorSearchScore"
                }
            }
        }
    ]

    # 3. Executa a pesquisa
    resultados = list(
        banco["chunks"].aggregate(pipeline)
    )

    return resultados
