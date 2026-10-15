
import unittest

from services.validacao import (
    extrair_citacoes,
    validar_citacoes
)


class TestValidacao(unittest.TestCase):

    def test_extrair_referencias(self):
        resposta = "Requisito [1] e escolaridade [2]."

        resultado = extrair_citacoes(resposta)

        self.assertEqual(resultado, [1, 2])

    def test_citacoes_validas(self):
        resposta = "Ensino superior completo [1]."

        fontes = [
            {"texto": "Ensino superior completo."},
            {"texto": "Prova objetiva."}
        ]

        resultado = validar_citacoes(
            resposta,
            fontes
        )

        self.assertTrue(resultado["numeracao_valida"])
        self.assertEqual(
            resultado["citacoes_validas"],
            [1]
        )

    def test_citacao_inexistente(self):
        resposta = "Informação encontrada [9]."

        fontes = [
            {"texto": "Conteúdo do edital."}
        ]

        resultado = validar_citacoes(
            resposta,
            fontes
        )

        self.assertFalse(resultado["numeracao_valida"])
        self.assertEqual(
            resultado["citacoes_invalidas"],
            [9]
        )

    def test_sem_citacoes(self):
        resposta = "Não encontrei a informação."

        resultado = validar_citacoes(
            resposta,
            []
        )

        self.assertFalse(resultado["possui_citacoes"])


if __name__ == "__main__":
    unittest.main()
