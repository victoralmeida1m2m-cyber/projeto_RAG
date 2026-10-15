
import hashlib

import pymupdf
import streamlit as st

from services.chunking import criar_chunks
from services.database import (
    conectar_mongodb,
    salvar_edital,
    listar_editais,
)
from ui.styles import (
    aplicar_estilos,
    cabecalho,
    hero_inicial,
    titulo_secao,
    etapa,
    rodape,
)


# ==========================================
# CONFIGURAÇÃO
# ==========================================

st.set_page_config(
    page_title="Edital Fácil | Inteligência Documental",
    page_icon="📚",
    layout="wide",
)

aplicar_estilos()
cabecalho()
hero_inicial()


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

except Exception:
    banco = None


with st.sidebar:
    st.markdown("### EDITAL.FÁCIL")
    st.caption("INTELLIGENT DOCUMENT EXPERIENCE")
    st.divider()

    if banco is not None:
        st.success("MongoDB conectado")
    else:
        st.error("MongoDB indisponível")

    st.caption(
        "Utilize o menu de páginas para acessar "
        "a biblioteca, o chat, o comparador "
        "e a análise de retificações."
    )


# ==========================================
# INTRODUÇÃO AO FLUXO
# ==========================================

titulo_secao(
    "Um processo. Novas possibilidades.",
    "Do PDF original à informação estruturada, em três etapas.",
)

col1, col2, col3 = st.columns(3, gap="medium")

with col1:
    etapa(
        "01 / UPLOAD",
        "Envie seu edital",
        "Carregue o documento original em formato PDF.",
    )

with col2:
    etapa(
        "02 / PROCESSAMENTO",
        "Estruture o conteúdo",
        "Extraímos páginas e organizamos o texto em chunks.",
    )

with col3:
    etapa(
        "03 / INTELIGÊNCIA",
        "Explore informações",
        "Salve os trechos para posterior indexação e consulta no RAG.",
    )


# ==========================================
# FORMULÁRIO DO EDITAL
# ==========================================

st.write("")
st.write("")

titulo_secao(
    "Comece por aqui.",
    "Identifique o concurso e envie o PDF para processamento.",
)

col1, col2 = st.columns(2, gap="medium")

with col1:
    concurso = st.text_input(
        "Nome do concurso",
        placeholder="Ex.: Prefeitura Municipal",
    )

with col2:
    cargo = st.text_input(
        "Cargo",
        placeholder="Ex.: Analista de Tecnologia da Informação",
    )

arquivo = st.file_uploader(
    "Selecione o edital em PDF",
    type=["pdf"],
    help="Envie um PDF com texto selecionável.",
)

if arquivo is None:
    st.info(
        "Aguardando documento. Selecione um PDF para visualizar "
        "as páginas e os trechos extraídos."
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

        with st.spinner("Processando e estruturando o PDF..."):

            with pymupdf.open(
                stream=dados_pdf,
                filetype="pdf",
            ) as documento:

                total_paginas = len(documento)

                for numero, pagina in enumerate(
                    documento,
                    start=1,
                ):

                    texto = pagina.get_text(
                        "text",
                        sort=True,
                    )

                    paginas.append({
                        "pagina": numero,
                        "texto": texto.strip(),
                    })

            documento_id = hashlib.sha256(
                dados_pdf
            ).hexdigest()

            chunks = criar_chunks(
                paginas=paginas,
                documento_id=documento_id,
                concurso=concurso.strip(),
                cargo=cargo.strip(),
            )

        st.success("PDF processado com sucesso!")

        # ==========================================
        # INDICADORES
        # ==========================================

        st.write("")

        titulo_secao(
            "Documento decodificado.",
            "Confira os indicadores da extração antes de salvar.",
        )

        paginas_com_texto = sum(
            1 for pagina in paginas
            if pagina["texto"]
        )

        m1, m2, m3 = st.columns(3, gap="medium")

        with m1:
            st.metric(
                "Páginas",
                total_paginas,
            )

        with m2:
            st.metric(
                "Chunks gerados",
                len(chunks),
            )

        with m3:
            st.metric(
                "Páginas com texto",
                paginas_com_texto,
            )

        # ==========================================
        # SALVAMENTO
        # ==========================================

        st.write("")
        st.divider()

        titulo_secao(
            "Persistência documental.",
            "Armazene os trechos no MongoDB Atlas para uso no Edital Fácil.",
        )

        pode_salvar = (
            banco is not None
            and bool(concurso.strip())
            and bool(cargo.strip())
            and bool(chunks)
        )

        if not concurso.strip() or not cargo.strip():
            st.info(
                "Preencha o nome do concurso e o cargo "
                "para habilitar o salvamento."
            )

        if not chunks:
            st.warning(
                "Não foram gerados chunks. Verifique se o PDF "
                "contém texto selecionável."
            )

        if st.button(
            "SALVAR EDITAL NO MONGODB ↗",
            type="primary",
            disabled=not pode_salvar,
            use_container_width=True,
        ):

            try:
                with st.spinner("Salvando documento no MongoDB..."):

                    resultado = salvar_edital(
                        banco=banco,
                        documento_id=documento_id,
                        nome_arquivo=arquivo.name,
                        concurso=concurso,
                        cargo=cargo,
                        total_paginas=total_paginas,
                        chunks=chunks,
                    )

                if resultado["novo"]:
                    st.success(
                        "Edital salvo com sucesso! "
                        f"{resultado['total_chunks']} "
                        "chunks armazenados."
                    )

                else:
                    st.info(
                        "Este PDF já está cadastrado no banco."
                    )

            except Exception:
                st.error(
                    "Não foi possível salvar o edital. "
                    "Verifique a conexão e tente novamente."
                )

        # ==========================================
        # EXPLORAÇÃO DOS CHUNKS
        # ==========================================

        st.write("")
        st.divider()

        titulo_secao(
            "Por dentro do documento.",
            "Explore os trechos gerados e o texto original de cada página.",
        )

        tab_chunks, tab_paginas = st.tabs([
            "TRECHOS ESTRUTURADOS",
            "TEXTO POR PÁGINA",
        ])

        with tab_chunks:

            if chunks:

                indice = st.selectbox(
                    "Selecione um trecho",
                    options=list(range(len(chunks))),
                    format_func=lambda i: (
                        f"Trecho {i + 1} · "
                        f"Página {chunks[i]['pagina_pdf']}"
                    ),
                )

                st.text_area(
                    "Conteúdo extraído",
                    value=chunks[indice]["texto"],
                    height=280,
                )

                with st.expander("Metadados do trecho"):
                    st.json(chunks[indice])

            else:
                st.info("Nenhum trecho disponível.")

        with tab_paginas:

            pagina_escolhida = st.selectbox(
                "Escolha uma página do PDF",
                options=list(range(1, total_paginas + 1)),
            )

            texto_pagina = paginas[
                pagina_escolhida - 1
            ]["texto"]

            if texto_pagina:

                st.text_area(
                    "Texto original extraído",
                    value=texto_pagina,
                    height=320,
                )

            else:

                st.warning(
                    "Nenhum texto extraído desta página. "
                    "Pode ser necessário OCR."
                )

    except Exception:
        st.error(
            "Ocorreu um erro ao processar o PDF. "
            "Verifique o arquivo enviado."
        )


# ==========================================
# DOCUMENTOS ARMAZENADOS
# ==========================================

st.write("")
st.divider()

titulo_secao(
    "Seu acervo.",
    "Consulte os editais já registrados na base documental.",
)

if banco is not None:

    if st.button(
        "CONSULTAR DOCUMENTOS SALVOS ↗",
        use_container_width=True,
    ):

        try:
            documentos = listar_editais(banco)

            if not documentos:
                st.info("Nenhum edital cadastrado.")

            for documento in documentos:

                nome = documento.get(
                    "nome_arquivo",
                    "Documento sem nome",
                )

                with st.expander(nome):

                    c1, c2 = st.columns(2)

                    with c1:
                        st.write(
                            "**Concurso:**",
                            documento.get("concurso"),
                        )

                        st.write(
                            "**Cargo:**",
                            documento.get("cargo"),
                        )

                        st.write(
                            "**Páginas:**",
                            documento.get("total_paginas"),
                        )

                    with c2:
                        st.write(
                            "**Chunks:**",
                            documento.get("total_chunks"),
                        )

                        st.write(
                            "**Status:**",
                            documento.get("status"),
                        )

        except Exception:
            st.error(
                "Não foi possível consultar os documentos. "
                "Tente novamente."
            )

else:

    st.warning(
        "Conecte o MongoDB para consultar "
        "os editais armazenados."
    )


# ==========================================
# RODAPÉ
# ==========================================

rodape()
