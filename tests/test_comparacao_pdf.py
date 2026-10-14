
import unittest

import pymupdf

from services.comparacao_pdf import (
    extrair_paginas_pdf,
    comparar_paginas
)


def criar_pdf(texto):
    """Cria um PDF simples para testes."""

    documento = pymupdf.open()

    pagina = documento.new_page()
    pagina.insert_text((50, 50), texto)

    dados = documento.tobytes()
    documento.close()

    return dados


class TestComparacaoPDF(unittest.TestCase):

    def test_extracao_com_pagina(self):
        dados = criar_pdf("Inscricao gratuita.")

        paginas = extrair_paginas_pdf(dados)

        self.assertEqual(len(paginas), 1)
        self.assertEqual(paginas[0]["pagina"], 1)
        self.assertIn(
            "Inscricao gratuita.",
            paginas[0]["texto"]
        )

    def test_alteracao_com_paginas(self):
        original = [
            {
                "pagina": 3,
                "texto": "Prova em 15 de junho."
            }
        ]

        atualizado = [
            {
                "pagina": 5,
                "texto": "Prova em 22 de junho."
            }
        ]

        alteracoes = comparar_paginas(
            original,
            atualizado
        )

        self.assertEqual(len(alteracoes), 1)

        alteracao = alteracoes[0]

        self.assertEqual(
            alteracao["tipo"],
            "substituido"
        )

        self.assertEqual(
            alteracao["paginas_originais"],
            [3]
        )

        self.assertEqual(
            alteracao["paginas_atualizadas"],
            [5]
        )

    def test_documentos_identicos(self):
        paginas = [
            {
                "pagina": 1,
                "texto": "Ensino medio completo."
            }
        ]

        alteracoes = comparar_paginas(
            paginas,
            paginas
        )

        self.assertEqual(alteracoes, [])


if __name__ == "__main__":
    unittest.main()
