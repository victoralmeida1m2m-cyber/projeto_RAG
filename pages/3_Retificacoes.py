
import streamlit as st

from services.retificacoes import analisar_pdfs


st.set_page_config(
    page_title="Retificações | Edital Fácil",
    page_icon="📝",
    layout="wide"
)

st.title("📝 Analisador de Retificações")

st.write(
    "Identifique alterações do tipo 'Onde se lê' "
    "e 'Leia-se' em documentos de concursos."
)

st.info(
    "Esta versão identifica pares textuais na mesma "
    "página da retificação. Confira os resultados "
    "com os documentos oficiais."
)

col1, col2 = st.columns(2)

with col1:
    original = st.file_uploader(
        "Edital original",
        type=["pdf"],
        key="original_retificacao"
    )

with col2:
    retificacao = st.file_uploader(
        "Documento de retificação",
        type=["pdf"],
        key="arquivo_retificacao"
    )


pronto = (
    original is not None
    and retificacao is not None
)

if st.button(
    "Analisar retificação",
    type="primary",
    disabled=not pronto
):
    try:
        with st.spinner("Analisando documentos..."):
            resultados = analisar_pdfs(
                original.getvalue(),
                retificacao.getvalue()
            )

        st.subheader("Resultado da análise")

        localizados = sum(
            item["status"] == "localizado"
            for item in resultados
        )

        ambiguos = sum(
            item["status"] == "ambiguo"
            for item in resultados
        )

        nao_localizados = sum(
            item["status"] == "nao_localizado"
            for item in resultados
        )

        c1, c2, c3 = st.columns(3)

        c1.metric("Localizados", localizados)
        c2.metric("Ambíguos", ambiguos)
        c3.metric("Não localizados", nao_localizados)

        if not resultados:
            st.warning(
                "Nenhum par completo 'Onde se lê' / "
                "'Leia-se' foi identificado. "
                "Isso não significa que não existam alterações."
            )

        for numero, item in enumerate(
            resultados,
            start=1
        ):
            with st.expander(
                f"Alteração {numero} — {item['status']}",
                expanded=True
            ):
                st.write(
                    "**Página da retificação:**",
                    item["pagina_retificacao"]
                )

                st.write(
                    "**Páginas encontradas no original:**",
                    item["paginas_originais"]
                    if item["paginas_originais"]
                    else "Nenhuma"
                )

                col_antigo, col_novo = st.columns(2)

                with col_antigo:
                    st.markdown("**Onde se lê:**")
                    st.code(
                        item["texto_original"],
                        language=None
                    )

                with col_novo:
                    st.markdown("**Leia-se:**")
                    st.code(
                        item["texto_atualizado"],
                        language=None
                    )

                if item["status"] == "localizado":
                    st.success(
                        "Texto anterior encontrado em "
                        "uma página do edital original."
                    )

                elif item["status"] == "ambiguo":
                    st.warning(
                        "Texto encontrado em várias páginas. "
                        "É necessária conferência manual."
                    )

                else:
                    st.warning(
                        "Trecho anterior não localizado "
                        "automaticamente no edital original."
                    )

    except Exception as erro:
        st.error(
            "Não foi possível analisar os documentos."
        )
        st.caption(type(erro).__name__)
