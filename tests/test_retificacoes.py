
import unittest

from services.retificacoes import (
    extrair_alteracoes,
    analisar_retificacao
)


class TestRetificacoes(unittest.TestCase):

    def test_extrair_par(self):
        paginas = [{
            "pagina": 2,
            "texto": (
                "ONDE SE LÊ:\n"
                "Prova em 15 de junho.\n"
                "LEIA-SE:\n"
                "Prova em 22 de junho."
            )
        }]

        resultado = extrair_alteracoes(paginas)

        self.assertEqual(len(resultado), 1)
        self.assertEqual(
            resultado[0]["texto_original"],
            "Prova em 15 de junho."
        )
        self.assertEqual(
            resultado[0]["texto_atualizado"],
            "Prova em 22 de junho."
        )

    def test_localizacao_no_original(self):
        original = [{
            "pagina": 5,
            "texto": "Prova em 15 de junho."
        }]

        retificacao = [{
            "pagina": 1,
            "texto": (
                "Onde se lê: Prova em 15 de junho.\n"
                "Leia-se: Prova em 22 de junho."
            )
        }]

        resultado = analisar_retificacao(
            original,
            retificacao
        )

        self.assertEqual(
            resultado[0]["status"],
            "localizado"
        )
        self.assertEqual(
            resultado[0]["paginas_originais"],
            [5]
        )

    def test_texto_nao_localizado(self):
        original = [{
            "pagina": 1,
            "texto": "Inscrições abertas."
        }]

        retificacao = [{
            "pagina": 2,
            "texto": (
                "Onde se lê: Prova em maio.\n"
                "Leia-se: Prova em junho."
            )
        }]

        resultado = analisar_retificacao(
            original,
            retificacao
        )

        self.assertEqual(
            resultado[0]["status"],
            "nao_localizado"
        )

    def test_multiplas_alteracoes(self):
        retificacao = [{
            "pagina": 1,
            "texto": (
                "Onde se lê: Data A\n"
                "Leia-se: Data B\n"
                "Onde se lê: Cargo A\n"
                "Leia-se: Cargo B"
            )
        }]

        resultado = extrair_alteracoes(retificacao)

        self.assertEqual(len(resultado), 2)

    def test_par_incompleto(self):
        retificacao = [{
            "pagina": 1,
            "texto": "Onde se lê: Texto antigo."
        }]

        resultado = extrair_alteracoes(retificacao)

        self.assertEqual(resultado, [])


if __name__ == "__main__":
    unittest.main()
