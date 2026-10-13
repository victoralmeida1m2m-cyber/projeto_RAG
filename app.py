
import hashlib

import pymupdf
import streamlit as st

from services.chunking import criar_chunks
from services.database import (
    conectar_mongodb,
    salvar_edital,
    listar_editais
)


# ==========================================
# CONFIGURAÇÃO DA PÁGINA
# ==========================================

st.set_page_config(
    page_title="Edital Fácil",
    page_icon="📚",
    layout="wide"
)

st.title("📚 Edital Fácil")
st.write("Seu assistente inteligente para concursos públicos.")

st.divider()


# ==========================================
# CONEXÃO COM MONGODB
# ==========================================

@st.cache_resource
def iniciar_banco():
    return conectar_mongodb()


banco = None

try:
    cliente, banco = iniciar_banco()
    cliente.admin.command("ping")
    st.sidebar.success("✅ MongoDB conectado!")

except Exception as erro:
    banco = None
    st.sidebar.error("MongoDB desconectado")
    st.sidebar.caption(type(erro).__name__)


# ==========================================
# INFORMAÇÕES DO CONCURSO
# ==========================================

st.subheader("📋 Informações do concurso")

col1, col2 = st.columns(2)

with col1:
    concurso = st.text_input(
        "Nome do concurso",
        placeholder="Ex.: Prefeitura Municipal"
    )

with col2:
    cargo = st.text_input(
        "Cargo",
        placeholder="Ex.: Assistente Administrativo"
    )


# ==========================================
# UPLOAD DO PDF
# ==========================================

st.subheader("📄 Enviar edital")

arquivo = st.file_uploader(
    "Selecione um edital em PDF",
    type=["pdf"]
)


# ==========================================
# PROCESSAMENTO DO PDF
# ==========================================

if arquivo is not None:

    dados_pdf = arquivo.getvalue()

    if not dados_pdf.startswith(b"%PDF-"):
        st.error("Arquivo PDF inválido.")
        st.stop()

    try:
        paginas = []

        with pymupdf.open(
            stream=dados_pdf,
            filetype="pdf"
        ) as documento:

            total_paginas = len(documento)

            for numero, pagina in enumerate(
                documento,
                start=1
            ):

                texto = pagina.get_text(
                    "text",
                    sort=True
                )

                paginas.append({
                    "pagina": numero,
                    "texto": texto.strip()
                })

        documento_id = hashlib.sha256(
            dados_pdf
        ).hexdigest()

        chunks = criar_chunks(
            paginas=paginas,
            documento_id=documento_id,
            concurso=concurso.strip(),
            cargo=cargo.strip()
        )

        st.success("✅ PDF processado com sucesso!")

        # ==========================================
        # ESTATÍSTICAS
        # ==========================================

        st.subheader("📊 Resultado do processamento")

        paginas_com_texto = sum(
            1 for pagina in paginas
            if pagina["texto"]
        )

        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric(
                "Páginas",
                total_paginas
            )

        with col2:
            st.metric(
                "Chunks gerados",
                len(chunks)
            )

        with col3:
            st.metric(
                "Páginas com texto",
                paginas_com_texto
            )

        # ==========================================
        # SALVAR NO MONGODB
        # ==========================================

        st.divider()
        st.subheader("💾 Armazenamento")

        pode_salvar = (
            banco is not None
            and bool(concurso.strip())
            and bool(cargo.strip())
            and bool(chunks)
        )

        if not concurso.strip() or not cargo.strip():
            st.info(
                "Preencha o nome do concurso e o cargo."
            )

        if st.button(
            "Salvar edital no MongoDB",
            type="primary",
            disabled=not pode_salvar
        ):

            try:
                resultado = salvar_edital(
                    banco=banco,
                    documento_id=documento_id,
                    nome_arquivo=arquivo.name,
                    concurso=concurso,
                    cargo=cargo,
                    total_paginas=total_paginas,
                    chunks=chunks
                )

                if resultado["novo"]:
                    st.success(
                        "Edital salvo com sucesso! "
                        f"{resultado['total_chunks']} chunks armazenados."
                    )
                else:
                    st.info(
                        "Este PDF já está cadastrado no banco."
                    )

            except Exception as erro:
                st.error("Erro ao salvar o edital.")
                st.exception(erro)

        # ==========================================
        # VISUALIZAR CHUNKS
        # ==========================================

        st.divider()
        st.subheader("🧩 Trechos extraídos")

        if chunks:

            indice = st.selectbox(
                "Selecione um trecho",
                options=list(range(len(chunks))),
                format_func=lambda i: (
                    f"Trecho {i + 1} - "
                    f"Página {chunks[i]['pagina_pdf']}"
                )
            )

            st.text_area(
                "Texto do trecho",
                value=chunks[indice]["texto"],
                height=250
            )

            with st.expander("Visualizar metadados"):
                st.json(chunks[indice])

        # ==========================================
        # VISUALIZAR TEXTO POR PÁGINA
        # ==========================================

        st.divider()
        st.subheader("📖 Texto original por página")

        pagina_escolhida = st.selectbox(
            "Escolha uma página",
            options=list(range(1, total_paginas + 1))
        )

        texto_pagina = paginas[
            pagina_escolhida - 1
        ]["texto"]

        if texto_pagina:
            st.text_area(
                "Texto extraído",
                value=texto_pagina,
                height=300
            )
        else:
            st.warning(
                "Nenhum texto extraído desta página. "
                "Pode ser necessário OCR."
            )

    except Exception as erro:
        st.error("Erro ao processar o PDF.")
        st.exception(erro)


# ==========================================
# CONSULTAR EDITAIS SALVOS
# ==========================================

st.divider()
st.subheader("🗂️ Editais armazenados")

if banco is not None:

    if st.button("Consultar editais salvos"):

        try:
            documentos = listar_editais(banco)

            if not documentos:
                st.info("Nenhum edital cadastrado.")

            for documento in documentos:

                nome = documento.get(
                    "nome_arquivo",
                    "Documento sem nome"
                )

                with st.expander(nome):

                    st.write(
                        "**Concurso:**",
                        documento.get("concurso")
                    )

                    st.write(
                        "**Cargo:**",
                        documento.get("cargo")
                    )

                    st.write(
                        "**Páginas:**",
                        documento.get("total_paginas")
                    )

                    st.write(
                        "**Chunks:**",
                        documento.get("total_chunks")
                    )

                    st.write(
                        "**Status:**",
                        documento.get("status")
                    )

        except Exception as erro:
            st.error("Erro ao consultar os editais.")
            st.exception(erro)


# ==========================================
# RODAPÉ
# ==========================================

st.divider()

st.caption(
    "Edital Fácil | Python + MongoDB + RAG"
)
