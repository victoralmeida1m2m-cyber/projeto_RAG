
def criar_chunks(
    paginas: list[dict],
    documento_id: str,
    concurso: str,
    cargo: str,
    tamanho: int = 180,
    sobreposicao: int = 35,
) -> list[dict]:
    """
    Divide o texto das páginas em trechos menores.

    tamanho: máximo de palavras por trecho.
    sobreposicao: palavras repetidas entre trechos.
    """

    if tamanho <= 0:
        raise ValueError("O tamanho precisa ser positivo.")

    if not 0 <= sobreposicao < tamanho:
        raise ValueError(
            "A sobreposição deve ser menor que o tamanho."
        )

    chunks = []
    sequencia = 0
    passo = tamanho - sobreposicao

    for pagina in paginas:
        numero_pagina = pagina["pagina"]
        texto = pagina["texto"]

        # Ignora páginas sem texto
        if not texto.strip():
            continue

        palavras = texto.split()

        for inicio in range(0, len(palavras), passo):
            fim = min(inicio + tamanho, len(palavras))

            trecho = " ".join(palavras[inicio:fim])

            sequencia += 1

            chunk = {
                "chunk_id": f"{documento_id}:{sequencia}",
                "documento_id": documento_id,
                "concurso": concurso,
                "cargo": cargo,
                "pagina_pdf": numero_pagina,
                "texto": trecho,
                "ordem": sequencia,
            }

            chunks.append(chunk)

            # Evita criar um último trecho redundante
            if fim == len(palavras):
                break

    return chunks
