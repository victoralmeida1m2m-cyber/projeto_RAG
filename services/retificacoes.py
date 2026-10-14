
import re

from services.comparacao_pdf import extrair_paginas_pdf


PADRAO_ANTIGO = re.compile(
    r"^\s*onde\s+se\s+l[eê]\s*[:\-–]?\s*(.*)$",
    re.IGNORECASE
)

PADRAO_NOVO = re.compile(
    r"^\s*leia[\s-]*se\s*[:\-–]?\s*(.*)$",
    re.IGNORECASE
)


def normalizar(texto: str) -> str:
    """Normaliza espaços e diferenças de maiúsculas."""
    return " ".join(texto.split()).casefold()


def extrair_alteracoes(paginas: list[dict]) -> list[dict]:
    """
    Identifica pares 'Onde se lê' e 'Leia-se'.

    Cada par deve estar na mesma página da retificação.
    """
    alteracoes = []

    for pagina in paginas:
        linhas = pagina["texto"].splitlines()

        estado = None
        texto_antigo = []
        texto_novo = []

        def guardar_alteracao():
            antigo = " ".join(texto_antigo).strip()
            novo = " ".join(texto_novo).strip()

            if antigo and novo:
                alteracoes.append({
                    "texto_original": antigo,
                    "texto_atualizado": novo,
                    "pagina_retificacao": pagina["pagina"]
                })

        for linha in linhas:
            linha = linha.strip()

            if not linha:
                continue

            inicio_antigo = PADRAO_ANTIGO.match(linha)
            inicio_novo = PADRAO_NOVO.match(linha)

            if inicio_antigo:
                if estado == "novo":
                    guardar_alteracao()

                estado = "antigo"
                texto_antigo = []
                texto_novo = []

                if inicio_antigo.group(1):
                    texto_antigo.append(
                        inicio_antigo.group(1)
                    )

            elif inicio_novo:
                if estado == "antigo":
                    estado = "novo"

                    if inicio_novo.group(1):
                        texto_novo.append(
                            inicio_novo.group(1)
                        )

            elif estado == "antigo":
                texto_antigo.append(linha)

            elif estado == "novo":
                texto_novo.append(linha)

        if estado == "novo":
            guardar_alteracao()

    return alteracoes


def localizar_no_original(
    texto_procurado: str,
    paginas_originais: list[dict]
) -> list[int]:
    """
    Procura o texto antigo em cada página do edital original.

    Retorna páginas em que existe uma correspondência textual.
    """
    alvo = normalizar(texto_procurado)
    encontradas = []

    if not alvo:
        return encontradas

    for pagina in paginas_originais:
        texto_pagina = normalizar(pagina["texto"])

        if alvo in texto_pagina:
            encontradas.append(pagina["pagina"])

    return encontradas


def analisar_retificacao(
    paginas_originais: list[dict],
    paginas_retificacao: list[dict]
) -> list[dict]:
    """Extrai alterações e procura evidências no original."""

    alteracoes = extrair_alteracoes(
        paginas_retificacao
    )

    resultados = []

    for alteracao in alteracoes:
        paginas = localizar_no_original(
            alteracao["texto_original"],
            paginas_originais
        )

        if len(paginas) == 1:
            status = "localizado"
        elif len(paginas) > 1:
            status = "ambiguo"
        else:
            status = "nao_localizado"

        resultados.append({
            **alteracao,
            "paginas_originais": paginas,
            "status": status
        })

    return resultados


def analisar_pdfs(
    pdf_original: bytes,
    pdf_retificacao: bytes
) -> list[dict]:
    """Executa a análise a partir dos arquivos PDF."""

    paginas_originais = extrair_paginas_pdf(
        pdf_original
    )

    paginas_retificacao = extrair_paginas_pdf(
        pdf_retificacao
    )

    return analisar_retificacao(
        paginas_originais,
        paginas_retificacao
    )
