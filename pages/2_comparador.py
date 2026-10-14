
import streamlit as st

from services.comparacao_pdf import (
    extrair_paginas_pdf,
    comparar_paginas
)


st.set_page_config(
    page_title="Comparador | Edital Fácil",
    page_icon="📑",
    layout="wide"
)

st.title("📑 Comparador de Editais")

st.write(
    "Compare duas versões completas de um edital "
    "e identifique alterações textuais com páginas."
)

st.info(
    "Esta versão compara dois PDFs completos. "
    "Retificações parciais serão tratadas "
    "em uma etapa específica."
)

col1, col2 = st.columns(2)

with col1:
    arquivo_original = st.file_uploader(
        "1. Edital original",
        type=["pdf"],
        key="pdf_original"
    )

with col2:
    arquivo_atualizado = st.file_uploader(
        "2. Edital atualizado",
        type=["pdf"],
        key="pdf_atualizado"
    )


def formatar_paginas(paginas):
    if not paginas:
        return "Não se aplica"

    return ", ".join(str(p) for p in paginas)


def mostrar_alteracao(alteracao, numero):
    tipo = alteracao["tipo"]

    st.markdown(f"#### Alteração {numero} — {tipo.title()}")

    col_antigo, col_novo = st.columns(2)

    with col_antigo:
        st.caption(
            "Original — Página(s) PDF: "
            + formatar_paginas(
                alteracao["paginas_originais"]
            )
        )

        if alteracao["texto_original"]:
            st.code(
                alteracao["texto_original"],
                language=None
            )
        else:
            st.write("Sem texto anterior.")

    with col_novo:
        st.caption(
            "Atualizado — Página(s) PDF: "
            + formatar_paginas(
                alteracao["paginas_atualizadas"]
            )
        )

        if alteracao["texto_atualizado"]:
            st.code(
                alteracao["texto_atualizado"],
                language=None
            )
        else:
            st.write("Sem texto novo.")

    st.divider()


pronto = (
    arquivo_original is not None
    and arquivo_atualizado is not None
)

if st.button(
    "Comparar documentos",
    type="primary",
    disabled=not pronto
):
    try:
        with st.spinner("Analisando os PDFs..."):

            paginas_a = extrair_paginas_pdf(
                arquivo_original.getvalue()
            )

            paginas_b = extrair_paginas_pdf(
                arquivo_atualizado.getvalue()
            )

            # Esta versão exige conteúdo textual extraível.
            if not any(p["texto"].strip() for p in paginas_a):
                st.error(
                    "O PDF original não possui texto extraível."
                )
                st.stop()

            if not any(p["texto"].strip() for p in paginas_b):
                st.error(
                    "O PDF atualizado não possui texto extraível."
                )
                st.stop()

            alteracoes = comparar_paginas(
                paginas_a,
                paginas_b
            )

        st.success("Comparação concluída!")

        substituidas = sum(
            a["tipo"] == "substituido" for a in alteracoes
        )

        adicionadas = sum(
            a["tipo"] == "adicionado" for a in alteracoes
        )

        removidas = sum(
            a["tipo"] == "removido" for a in alteracoes
        )

        c1, c2, c3 = st.columns(3)

        c1.metric("Substituições", substituidas)
        c2.metric("Adições", adicionadas)
        c3.metric("Remoções", removidas)

        if not alteracoes:
            st.success(
                "Nenhuma diferença textual foi identificada."
            )
        else:
            st.caption(
                "Essas diferenças são textuais. "
                "Revise os trechos antes de interpretar "
                "seu efeito sobre as regras do concurso."
            )

            for numero, alteracao in enumerate(
                alteracoes,
                start=1
            ):
                mostrar_alteracao(alteracao, numero)

    except Exception as erro:
        st.error(
            "Não foi possível comparar os documentos."
        )
        st.caption(type(erro).__name__)
