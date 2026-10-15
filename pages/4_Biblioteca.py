
import html

import streamlit as st

from services.database import conectar_mongodb
from ui.carrossel import exibir_carrossel
from ui.styles import aplicar_estilos


# ==========================================
# CONFIGURAÇÃO
# ==========================================

st.set_page_config(
    page_title="Biblioteca | Edital Fácil",
    page_icon="◈",
    layout="wide",
)

aplicar_estilos()


# ==========================================
# IDENTIDADE VISUAL DA BIBLIOTECA
# ==========================================

st.markdown(
    """
    <style>
    .lib-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 12px 0 22px;
        border-bottom: 1px solid #373d32;
        margin-bottom: 58px;
    }

    .lib-logo {
        color: #f2f4ec;
        font-size: 22px;
        font-weight: 850;
        letter-spacing: -0.07em;
    }

    .lib-logo span {
        color: #d5ff65;
    }

    .lib-topnote {
        color: #a2aa9c;
        font: 600 10px ui-monospace, monospace;
        letter-spacing: 0.16em;
        text-align: right;
    }

    .lib-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 180px;
        gap: 32px;
        align-items: end;
        margin-bottom: 54px;
    }

    .lib-index {
        color: #d5ff65;
        font: 700 11px ui-monospace, monospace;
        letter-spacing: 0.22em;
        margin-bottom: 25px;
    }

    .lib-title {
        color: #f2f4ec;
        font-size: clamp(3.4rem, 8vw, 7.6rem);
        font-weight: 850;
        line-height: 0.91;
        letter-spacing: -0.085em;
        margin: 0;
    }

    .lib-title span {
        color: #d5ff65;
    }

    .lib-side {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 24px;
        padding-bottom: 10px;
    }

    .lib-orbit {
        position: relative;
        width: 112px;
        height: 112px;
        border: 1px solid rgba(213, 255, 101, 0.45);
        border-radius: 50%;
        display: grid;
        place-items: center;
        animation: lib-float 5s ease-in-out infinite;
    }

    .lib-orbit::before {
        content: "";
        position: absolute;
        inset: 14px;
        border: 1px dashed rgba(213,255,101,0.45);
        border-radius: 50%;
        animation: lib-rotate 24s linear infinite;
    }

    .lib-orbit::after {
        content: "✳";
        color: #d5ff65;
        font-size: 42px;
        font-weight: 300;
    }

    .lib-side-caption {
        color: #a2aa9c;
        font: 600 10px ui-monospace, monospace;
        letter-spacing: 0.13em;
        text-align: right;
        line-height: 1.7;
    }

    .lib-intro {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        padding: 25px 0 38px;
        border-top: 1px solid #373d32;
        align-items: start;
    }

    .lib-intro-label {
        color: #d5ff65;
        font: 700 11px ui-monospace, monospace;
        letter-spacing: 0.15em;
    }

    .lib-intro-text {
        color: #b3bbad;
        font-size: clamp(1rem, 2vw, 1.25rem);
        line-height: 1.65;
        max-width: 580px;
        margin: 0;
    }

    .lib-section {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 20px;
        padding: 34px 0 22px;
        border-top: 1px solid #373d32;
        margin-top: 8px;
    }

    .lib-section-index {
        color: #d5ff65;
        font: 700 11px ui-monospace, monospace;
        letter-spacing: 0.15em;
        margin-bottom: 10px;
    }

    .lib-section-title {
        color: #f2f4ec;
        font-size: clamp(1.8rem, 4vw, 3rem);
        font-weight: 800;
        letter-spacing: -0.065em;
        line-height: 1;
        margin: 0;
    }

    .lib-counter {
        color: #d5ff65;
        font: 700 12px ui-monospace, monospace;
        letter-spacing: 0.08em;
        white-space: nowrap;
    }

    .lib-help {
        margin: 25px 0 30px;
        border-top: 1px solid #373d32;
        border-bottom: 1px solid #373d32;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
    }

    .lib-help-item {
        padding: 20px 18px;
        border-right: 1px solid #373d32;
    }

    .lib-help-item:last-child {
        border-right: none;
    }

    .lib-help-number {
        display: block;
        color: #d5ff65;
        font: 700 11px ui-monospace, monospace;
        margin-bottom: 8px;
    }

    .lib-help-title {
        display: block;
        color: #f2f4ec;
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 4px;
    }

    .lib-help-text {
        display: block;
        color: #a2aa9c;
        font-size: 12px;
        line-height: 1.5;
    }

    .lib-footer {
        margin-top: 65px;
        padding: 25px 0;
        border-top: 1px solid #373d32;
        display: flex;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
        color: #a2aa9c;
        font: 600 10px ui-monospace, monospace;
        letter-spacing: 0.12em;
    }

    @keyframes lib-float {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-12px);
        }
    }

    @keyframes lib-rotate {
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes lib-reveal {
        from {
            opacity: 0;
            transform: translateY(24px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (prefers-reduced-motion: no-preference) {
        .lib-topbar {
            animation: lib-reveal 550ms ease-out both;
        }

        .lib-hero {
            animation: lib-reveal 750ms 80ms ease-out both;
        }

        .lib-intro {
            animation: lib-reveal 750ms 160ms ease-out both;
        }

        .lib-section {
            animation: lib-reveal 750ms 240ms ease-out both;
        }
    }

    @media (max-width: 760px) {
        .lib-topbar {
            margin-bottom: 38px;
        }

        .lib-hero {
            grid-template-columns: 1fr;
            gap: 20px;
            margin-bottom: 36px;
        }

        .lib-side {
            display: none;
        }

        .lib-intro {
            grid-template-columns: 1fr;
            gap: 15px;
        }

        .lib-section {
            align-items: flex-start;
            flex-direction: column;
        }

        .lib-help {
            grid-template-columns: 1fr;
        }

        .lib-help-item {
            border-right: none;
            border-bottom: 1px solid #373d32;
        }

        .lib-help-item:last-child {
            border-bottom: none;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .lib-orbit,
        .lib-orbit::before {
            animation: none !important;
        }
    }
    </style>

    <header class="lib-topbar">
        <div class="lib-logo">edital<span>.fácil</span></div>
        <div class="lib-topnote">
            BIBLIOTECA DIGITAL<br>
            DOCUMENT INTELLIGENCE
        </div>
    </header>

    <section class="lib-hero">
        <div>
            <div class="lib-index">
                02 / EXPLORAÇÃO DOCUMENTAL
            </div>
            <h1 class="lib-title">
                NAVEGUE.<br>
                <span>DESCUBRA.</span><br>
                PERGUNTE.
            </h1>
        </div>
        <div class="lib-side">
            <div class="lib-orbit" aria-hidden="true"></div>
            <div class="lib-side-caption">
                SEU ACERVO.<br>
                OUTRA PERSPECTIVA.
            </div>
        </div>
    </section>

    <section class="lib-intro">
        <div class="lib-intro-label">
            [ SOBRE A BIBLIOTECA ]
        </div>
        <p class="lib-intro-text">
            Uma experiência dinâmica para explorar
            concursos públicos. Navegue entre os editais,
            escolha o documento ideal e converse com
            uma inteligência artificial conectada às fontes.
        </p>
    </section>
    """,
    unsafe_allow_html=True,
)


# ==========================================
# CONEXÃO COM MONGODB
# ==========================================

@st.cache_resource
def obter_banco():
    return conectar_mongodb()


try:
    cliente, banco = obter_banco()
    cliente.admin.command("ping")

    documentos = list(
        banco.documentos.find(
            {"status": "concluido"},
            {
                "_id": 0,
                "documento_id": 1,
                "nome_arquivo": 1,
                "concurso": 1,
                "cargo": 1,
            },
        ).sort("criado_em", -1)
    )

except Exception:
    st.error(
        "Não foi possível consultar os editais. "
        "Verifique a conexão com o MongoDB Atlas."
    )
    st.stop()


# ==========================================
# PREPARAÇÃO DOS DADOS DO CARROSSEL
# ==========================================

itens = []

for indice, documento in enumerate(documentos):

    documento_id = documento.get("documento_id")

    if not isinstance(documento_id, str) or not documento_id:
        continue

    titulo = str(
        documento.get("concurso")
        or documento.get("nome_arquivo")
        or "Edital"
    )

    subtitulo = str(
        documento.get("cargo")
        or "Consulte os detalhes no chat"
    )

    itens.append(
        {
            "id": documento_id,
            "title": titulo,
            "subtitle": subtitulo,
            "hue": (195 + indice * 38) % 360,
        }
    )


# ==========================================
# CABEÇALHO DO ACERVO
# ==========================================

quantidade = len(itens)

st.markdown(
    f"""
    <section class="lib-section">
        <div>
            <div class="lib-section-index">
                01 / ACERVO DISPONÍVEL
            </div>
            <h2 class="lib-section-title">
                Encontre seu próximo edital.
            </h2>
        </div>
        <div class="lib-counter">
            {quantidade:02d} DOCUMENTO(S)
        </div>
    </section>
    """,
    unsafe_allow_html=True,
)


# ==========================================
# CARROSSEL ORIGINAL
# ==========================================

if not itens:

    st.info(
        "Nenhum edital concluído foi encontrado. "
        "Cadastre um PDF na página inicial primeiro."
    )

    if st.button(
        "IR PARA A PÁGINA INICIAL ↗",
        type="primary",
        use_container_width=True,
    ):
        st.switch_page("app.py")

else:

    escolha = exibir_carrossel(itens)

    # Mantém a integração que já funciona com o Chat.
    if isinstance(escolha, dict):

        documento_id = escolha.get("id")
        token = escolha.get("event_token")

        ids_permitidos = {
            item["id"]
            for item in itens
        }

        evento_novo = (
            isinstance(token, str)
            and bool(token)
            and token != st.session_state.get(
                "ultimo_evento_carrossel"
            )
        )

        if evento_novo and documento_id in ids_permitidos:

            st.session_state[
                "ultimo_evento_carrossel"
            ] = token

            st.session_state[
                "edital_selecionado"
            ] = documento_id

            st.switch_page(
                "pages/1_Chat.py"
            )


# ==========================================
# ORIENTAÇÕES DE NAVEGAÇÃO
# ==========================================

st.markdown(
    """
    <section class="lib-help">
        <div class="lib-help-item">
            <span class="lib-help-number">01 / EXPLORE</span>
            <span class="lib-help-title">Navegue pelo acervo</span>
            <span class="lib-help-text">
                Arraste os cartões ou utilize as setas.
            </span>
        </div>
        <div class="lib-help-item">
            <span class="lib-help-number">02 / SELECIONE</span>
            <span class="lib-help-title">Escolha o documento</span>
            <span class="lib-help-text">
                Visualize o concurso e o cargo disponível.
            </span>
        </div>
        <div class="lib-help-item">
            <span class="lib-help-number">03 / CONSULTE</span>
            <span class="lib-help-title">Abra o Chat RAG</span>
            <span class="lib-help-text">
                Faça perguntas e confira as fontes.
            </span>
        </div>
    </section>
    """,
    unsafe_allow_html=True,
)


# ==========================================
# NAVEGAÇÃO COMPLEMENTAR
# ==========================================

col1, col2 = st.columns(2)

with col1:

    if st.button(
        "＋ CADASTRAR NOVO EDITAL",
        use_container_width=True,
    ):
        st.switch_page("app.py")

with col2:

    if st.button(
        "↗ ABRIR CHAT COM EDITAIS",
        type="primary",
        use_container_width=True,
    ):
        st.switch_page("pages/1_Chat.py")


# ==========================================
# RODAPÉ
# ==========================================

st.markdown(
    """
    <footer class="lib-footer">
        <span>EDITAL FÁCIL / BIBLIOTECA DIGITAL</span>
        <span>PYTHON · MONGODB · GEMINI · RAG</span>
    </footer>
    """,
    unsafe_allow_html=True,
)
