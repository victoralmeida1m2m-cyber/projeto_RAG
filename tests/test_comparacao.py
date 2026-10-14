
import unittest

from services.comparacao import comparar_textos


class TestComparacao(unittest.TestCase):

    def test_identifica_substituicao(self):

        original = (
            "A prova será realizada em 15 de junho."
        )

        atualizado = (
            "A prova será realizada em 22 de junho."
        )

        resultado = comparar_textos(
            original,
            atualizado
        )

        self.assertEqual(len(resultado), 1)
        self.assertEqual(
            resultado[0]["tipo"],
            "substituido"
        )

        self.assertIn(
            "15 de junho",
            resultado[0]["texto_original"]
        )

        self.assertIn(
            "22 de junho",
            resultado[0]["texto_atualizado"]
        )

    def test_documentos_iguais(self):

        texto = "Ensino superior completo."

        resultado = comparar_textos(
            texto,
            texto
        )

        self.assertEqual(resultado, [])

    def test_identifica_adicao(self):

        original = "Inscrição gratuita."

        atualizado = (
            "Inscrição gratuita.\n"
            "É obrigatório apresentar documento oficial."
        )

        resultado = comparar_textos(
            original,
            atualizado
        )

        self.assertEqual(len(resultado), 1)
        self.assertEqual(
            resultado[0]["tipo"],
            "adicionado"
        )


if __name__ == "__main__":
    unittest.main()
