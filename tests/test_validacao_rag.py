
import unittest

from services.rag import verificar_resposta


class TestValidacaoRAG(unittest.TestCase):

    def setUp(self):
        self.fontes = [
            {
                "texto": "Ensino superior completo.",
                "pagina_pdf": 5
            },
            {
                "texto": "Prova objetiva.",
                "pagina_pdf": 8
            }
        ]

    def test_referencia_valida(self):
        resultado = verificar_resposta(
            "Exige ensino superior [1].",
            self.fontes
        )

        self.assertEqual(
            resultado["status"],
            "citacoes_numeradas"
        )

    def test_referencia_invalida(self):
        resultado = verificar_resposta(
            "Exige ensino superior [9].",
            self.fontes
        )

        self.assertEqual(
            resultado["status"],
            "citacao_invalida"
        )

        self.assertNotIn(
            "[9]",
            resultado["resposta"]
        )

    def test_sem_referencias(self):
        resultado = verificar_resposta(
            "Exige ensino superior completo.",
            self.fontes
        )

        self.assertEqual(
            resultado["status"],
            "sem_citacoes"
        )

    def test_sem_fontes(self):
        resultado = verificar_resposta(
            "Resposta qualquer.",
            []
        )

        self.assertEqual(
            resultado["status"],
            "sem_evidencia"
        )


if __name__ == "__main__":
    unittest.main()
