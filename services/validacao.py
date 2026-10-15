
import re


def extrair_citacoes(resposta: str) -> list[int]:
    """
    Extrai referências numéricas, como [1], [2] e [3].
    """

    referencias = re.findall(r"\[(\d+)\]", resposta)

    return [int(numero) for numero in referencias]


def validar_citacoes(
    resposta: str,
    fontes: list[dict]
) -> dict:
    """
    Verifica se os números citados correspondem
    às fontes recuperadas.
    """

    citacoes = extrair_citacoes(resposta)

    validas = sorted({
        numero
        for numero in citacoes
        if 1 <= numero <= len(fontes)
    })

    invalidas = sorted({
        numero
        for numero in citacoes
        if numero < 1 or numero > len(fontes)
    })

    return {
        "citacoes_validas": validas,
        "citacoes_invalidas": invalidas,
        "possui_citacoes": bool(citacoes),
        "numeracao_valida": len(invalidas) == 0
    }
