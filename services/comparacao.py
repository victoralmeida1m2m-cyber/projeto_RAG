
import difflib
import re


def normalizar_linhas(texto: str) -> list[str]:
    """
    Prepara linhas de texto para comparação.

    Remove linhas vazias e normaliza espaços.
    Preserva a grafia original das palavras.
    """

    linhas = []

    for linha in texto.splitlines():
        linha_limpa = re.sub(r"\s+", " ", linha).strip()

        if linha_limpa:
            linhas.append(linha_limpa)

    return linhas


def comparar_textos(
    texto_original: str,
    texto_atualizado: str
) -> list[dict]:
    """
    Compara dois textos usando difflib.

    Retorna trechos adicionados, removidos
    ou substituídos.
    """

    linhas_original = normalizar_linhas(texto_original)
    linhas_atualizado = normalizar_linhas(texto_atualizado)

    comparador = difflib.SequenceMatcher(
        None,
        linhas_original,
        linhas_atualizado,
        autojunk=False
    )

    alteracoes = []

    for tipo, i1, i2, j1, j2 in comparador.get_opcodes():

        if tipo == "equal":
            continue

        anterior = "\n".join(linhas_original[i1:i2])
        novo = "\n".join(linhas_atualizado[j1:j2])

        tipos = {
            "replace": "substituido",
            "delete": "removido",
            "insert": "adicionado"
        }

        alteracoes.append({
            "tipo": tipos[tipo],
            "texto_original": anterior,
            "texto_atualizado": novo,
            "linha_original": i1 + 1 if i1 < i2 else None,
            "linha_atualizada": j1 + 1 if j1 < j2 else None
        })

    return alteracoes
