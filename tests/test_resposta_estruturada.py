
import json
import unittest

from services.rag import processar_resposta_ia


class TestRespostaEstruturada(unittest.TestCase):

    def setUp(self):
        self.fontes = [
            {
                "texto": "Ensino superior completo.",
                "pagina_pdf": 5
            }
        ]

    def test_resposta_fundamentada(self):
        dados = {
            "tem_evidencia": True,
            "resposta": "Exige ensino superior [1]."
        }

        resultado = processar_resposta_ia(
            json.dumps(dados),
            self.fontes
        )

        self.assertEqual(
            resultado["status"],
            "citacoes_numeradas"
        )

    def test_sem_evidencia(self):
        dados = {
            "tem_evidencia": False,
            "resposta": "Não encontrei essa informação."
        }

        resultado = processar_resposta_ia(
            json.dumps(dados),
            self.fontes
        )

        self.assertEqual(
            resultado["status"],
            "sem_evidencia"
        )

    def test_citacao_inexistente(self):
        dados = {
            "tem_evidencia": True,
            "resposta": "Requisito encontrado [9]."
        }

        resultado = processar_resposta_ia(
            json.dumps(dados),
            self.fontes
        )

        self.assertEqual(
            resultado["status"],
            "citacao_invalida"
        )

    def test_json_invalido(self):
        with self.assertRaises(ValueError):
            processar_resposta_ia(
                "texto que não é JSON",
                self.fontes
            )

    def test_booleano_invalido(self):
        dados = {
            "tem_evidencia": "false",
            "resposta": "Texto"
        }

        with self.assertRaises(ValueError):
            processar_resposta_ia(
                json.dumps(dados),
                self.fontes
            )


if __name__ == "__main__":
    unittest.main()
