
from functools import lru_cache

from sentence_transformers import SentenceTransformer


# Modelo de embeddings multilíngue
NOME_MODELO = (
    "sentence-transformers/"
    "paraphrase-multilingual-MiniLM-L12-v2"
)


@lru_cache(maxsize=1)
def carregar_modelo():
    """
    Carrega o modelo apenas uma vez por processo.
    """
    return SentenceTransformer(
        NOME_MODELO,
        device="cpu"
    )


def gerar_embedding(texto: str) -> list[float]:
    """
    Transforma um texto em um vetor numérico.
    """

    if not texto.strip():
        raise ValueError("O texto não pode estar vazio.")

    modelo = carregar_modelo()

    vetor = modelo.encode(
        texto,
        normalize_embeddings=True
    )

    return vetor.tolist()


def gerar_embeddings(textos: list[str]) -> list[list[float]]:
    """
    Gera embeddings para vários textos.
    """

    if not textos:
        return []

    if any(not texto.strip() for texto in textos):
        raise ValueError("A lista contém um texto vazio.")

    modelo = carregar_modelo()

    vetores = modelo.encode(
        textos,
        batch_size=16,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    return vetores.tolist()
