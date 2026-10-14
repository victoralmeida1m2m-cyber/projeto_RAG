
import difflib

import pymupdf

from services.comparacao import normalizar_linhas


def extrair_paginas_pdf(dados_pdf: bytes) -> list[dict]:
    """
    Extrai texto de um PDF e preserva a página física.
    """

    if not dados_pdf.startswith(b"%PDF-"):
        raise ValueError("O arquivo não parece ser um PDF válido.")

    paginas = []

    with pymupdf.open(
        stream=dados_pdf,
        filetype="pdf"
    ) as documento:

        if documento.needs_pass:
            raise ValueError(
                "PDF protegido por senha não é suportado."
            )

        for numero, pagina in enumerate(documento, start=1):
            texto = pagina.get_text("text", sort=True)

            paginas.append({
                "pagina": numero,
                "texto": texto
            })

    return paginas


def preparar_linhas(paginas: list[dict]) -> list[dict]:
    """
    Converte páginas em linhas com metadados de origem.
    """

    linhas = []

    for pagina in paginas:
        numero = pagina["pagina"]

        for texto in normalizar_linhas(pagina["texto"]):
            linhas.append({
                "texto": texto,
                "pagina": numero
            })

    return linhas


def comparar_paginas(
    paginas_originais: list[dict],
    paginas_atualizadas: list[dict]
) -> list[dict]:
    """
    Compara as linhas de duas versões completas de PDF.

    Preserva as páginas associadas às alterações.
    """

    linhas_a = preparar_linhas(paginas_originais)
    linhas_b = preparar_linhas(paginas_atualizadas)

    textos_a = [linha["texto"] for linha in linhas_a]
    textos_b = [linha["texto"] for linha in linhas_b]

    comparador = difflib.SequenceMatcher(
        None,
        textos_a,
        textos_b,
        autojunk=False
    )

    tipos = {
        "replace": "substituido",
        "insert": "adicionado",
        "delete": "removido"
    }

    alteracoes = []

    for tipo, i1, i2, j1, j2 in comparador.get_opcodes():

        if tipo == "equal":
            continue

        trecho_a = linhas_a[i1:i2]
        trecho_b = linhas_b[j1:j2]

        alteracoes.append({
            "tipo": tipos[tipo],
            "texto_original": "\n".join(
                linha["texto"] for linha in trecho_a
            ),
            "texto_atualizado": "\n".join(
                linha["texto"] for linha in trecho_b
            ),
            "paginas_originais": sorted({
                linha["pagina"] for linha in trecho_a
            }),
            "paginas_atualizadas": sorted({
                linha["pagina"] for linha in trecho_b
            })
        })

    return alteracoes
