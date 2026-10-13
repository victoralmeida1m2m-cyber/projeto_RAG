
import unittest

from services.rag import montar_contexto


class TestRAG(unittest.TestCase):

    def test_contexto_com_fontes(self):
        trechos = [
            {
                "pagina_pdf": 5,
                "texto": "Ensino superior completo."
            },
            {
                "pagina_pdf": 8,
                "texto": "Prova objetiva."
            }
        ]

        contexto = montar_contexto(trechos)

        self.assertIn("Fonte 1", contexto)
        self.assertIn("Página PDF 5", contexto)
        self.assertIn("Ensino superior completo.", contexto)

        self.assertIn("Fonte 2", contexto)
        self.assertIn("Página PDF 8", contexto)

    def test_contexto_vazio(self):
        resultado = montar_contexto([])
        self.assertEqual(resultado, "")


if __name__ == "__main__":
    unittest.main()
