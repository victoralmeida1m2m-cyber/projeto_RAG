
import unittest

from services.chunking import criar_chunks


class TestChunking(unittest.TestCase):

    def test_divisao_e_metadados(self):
        paginas = [
            {
                "pagina": 7,
                "texto": "um dois tres quatro cinco seis sete"
            }
        ]

        resultado = criar_chunks(
            paginas=paginas,
            documento_id="teste123",
            concurso="Concurso Exemplo",
            cargo="Analista",
            tamanho=4,
            sobreposicao=2
        )

        self.assertEqual(len(resultado), 3)

        self.assertEqual(
            resultado[0]["texto"],
            "um dois tres quatro"
        )

        self.assertEqual(
            resultado[1]["texto"],
            "tres quatro cinco seis"
        )

        self.assertEqual(
            resultado[2]["texto"],
            "cinco seis sete"
        )

        self.assertTrue(
            all(chunk["pagina_pdf"] == 7 for chunk in resultado)
        )

        self.assertTrue(
            all(
                chunk["documento_id"] == "teste123"
                for chunk in resultado
            )
        )

    def test_pagina_vazia(self):
        resultado = criar_chunks(
            paginas=[{"pagina": 1, "texto": "   "}],
            documento_id="teste",
            concurso="Exemplo",
            cargo="Analista"
        )

        self.assertEqual(resultado, [])

    def test_sobreposicao_invalida(self):
        with self.assertRaises(ValueError):
            criar_chunks(
                paginas=[],
                documento_id="teste",
                concurso="Exemplo",
                cargo="Analista",
                tamanho=10,
                sobreposicao=10
            )


if __name__ == "__main__":
    unittest.main()
