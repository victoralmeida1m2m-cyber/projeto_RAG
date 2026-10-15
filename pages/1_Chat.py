
import html

import streamlit as st

from services.database import conectar_mongodb
from services.rag import responder_pergunta
from ui.styles import aplicar_estilos


# ==========================================
# CONFIGURAÇÃO
# ==========================================

st.set_page_config(
    page_title="Chat | Edital Fácil",
    page_icon="✦",
    layout="wide",
)

aplicar_estilos()


# ==========================================
# ESTILOS EXCLUSIVOS DO CHAT
# ==========================================

st.markdown(
    """
    <style>
    .chat-brand {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 12px 0 22px;
        border-bottom: 1px solid #373d32;
        margin-bottom: 55px;
    }

    .chat-brand-name {
        color: #f2f4ec;
        font-size: 22px;
        font-weight: 850;
        letter-spacing: -0.07em;
    }

    .chat-brand-name span {
        color: #d5ff65;
    }

    .chat-brand-note {
        color: #a2aa9c;
        font: 600 10px ui-monospace, monospace;
        letter-spacing: 0.15em;
        text-align: right;
    }

    .chat-hero {
        position: relative;
        padding: 5px 0 55px;
        overflow: hidden;
    }

    .chat-kicker {
        color: #d5ff65;
        font: 700 11px ui-monospace, monospace;
        letter-spacing: 0.2em;
        margin-bottom: 25px;
    }

    .chat-title {
        position: relative;
        z-index: 1;
        color: #f2f4ec;
        font-size: clamp(3.5rem, 8vw, 7rem);
        font-weight: 850;
        letter-spacing: -0.085em;
        line-height: 0.92;
        margin: 0;
    }

    .chat-title em {
        color: #d5ff65;
        font-style: normal;
    }

    .chat-description {
        color: #a2aa9c;
        font-size: clamp(1rem, 2vw, 1.2rem);
        line-height: 1.65;
        max-width: 630px;
        margin-top: 28px;
    }

    .chat-orbit {
        position: absolute;
        right: 50px;
        top: 45px;
        width: 175px;
        height: 175px;
        border: 1px solid rgba(213,255,101,0.27);
        border-radius: 50%;
        box-shadow:
            0 0 0 25px rgba(213,255,101,0.025),
            0 0 0 60px rgba(213,255,101,0.018);
        pointer-events: none;
        animation: chat-float 7s ease-in-out infinite;
    }

    .chat-orbit::before {
        content: "";
        position: absolute;
        inset: 32px;
        border: 1px dashed rgba(213,255,101,0.48);
        border-radius: 50%;
        animation: chat-spin 28s linear infinite;
    }

    .chat-orbit::after {
        content: "✳";
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #d5ff65;
        font-size: 54px;
    }

    .chat-section {
        border-top: 1px solid #373d32;
        padding-top: 28px;
        margin-top: 12px;
        margin-bottom: 22px;
    }

    .chat-section-index {
        color: #d5ff65;
        font: 700 11px ui-monospace, monospace;
        letter-spacing: 0.16em;
        margin-bottom: 12px;
    }

    .chat-section-title {
        color: #f2f4ec;
        font-size: clamp(1.6rem, 4vw, 2.6rem);
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.06em;
        margin: 0 0 14px;
    }

    .chat-section-text {
        color: #a2aa9c;
        font-size: 0.95rem;
        line-height: 1.65;
    }

    .chat-document {
        border: 1px solid #373d32;
        border-left: 3px solid #d5ff65;
        border-radius: 14px;
        padding: 20px 22px;
        background: #171a15;
        margin: 22px 0 30px;
    }

    .chat-document-label {
        color: #d5ff65;
        font: 700 11px ui-monospace, monospace;
        letter-spacing: 0.14em;
        margin-bottom: 12px;
    }

    .chat-document-title {
        color: #f2f4ec;
        font-weight: 750;
        font-size: 1.15rem;
        line-height: 1.4;
        overflow-wrap: anywhere;
    }

    .chat-document-subtitle {
        color: #a2aa9c;
        margin-top: 8px;
        font-size: 0.85rem;
        overflow-wrap: anywhere;
    }

    .chat-empty {
        padding: 42px 24px;
        border: 1px dashed #48513e;
        border-radius: 20px;
        text-align: center;
        margin: 16px 0 24px;
    }

    .chat-empty-symbol {
        color: #d5ff65;
        font-size: 46px;
        margin-bottom: 12px;
    }

    .chat-empty-heading {
        color: #f2f4ec;
        font-size: 1.5rem;
        font-weight: 750;
        letter-spacing: -0.04em;
    }

    .chat-empty-text {
        color: #a2aa9c;
        font-size: 0.9rem;
        margin-top: 10px;
        line-height: 1.6;
    }

    div[data-testid="stChatMessage"] {
        border: 1px solid #373d32;
        background: #171a15;
        border-radius: 18px;
        padding: 18px;
        margin-bottom: 14px;
    }

    div[data-testid="stChatMessage"]:has(
        [data-testid="chatAvatarIcon-user"]
    ) {
        background: #20261a;
        border-color: #48533a;
    }

    div[data-testid="stChatMessage"]:has(
        [data-testid="chatAvatarIcon-assistant"]
    ) {
        background: #141713;
    }

    div[data-testid="stChatInput"] {
        border-radius: 18px;
    }

    div[data-testid="stChatInput"] textarea {
        color: #f2f4ec;
    }

    div[data-testid="stExpander"] {
        border: 1px solid #373d32;
        border-radius: 14px;
        margin-top: 12px;
    }

    .chat-footer {
        padding: 26px 0;
        margin-top: 35px;
        border-top: 1px solid #373d32;
        color: #a2aa9c;
        font: 600 10px ui-monospace, monospace;
        letter-spacing: 0.1em;
        line-height: 1.8;
    }

    @keyframes chat-float {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-18px);
        }
    }

    @keyframes chat-spin {
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes chat-reveal {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (prefers-reduced-motion: no-preference) {
        .chat-hero {
            animation: chat-reveal 700ms ease-out both;
        }

        .chat-section {
            animation: chat-reveal 700ms 120ms ease-out both;
        }
    }

    @media (max-width: 760px) {
        .chat-brand {
            margin-bottom: 36px;
        }

        .chat-hero {
            padding-bottom: 38px;
        }

        .chat-orbit {
            width: 100px;
            height: 100px;
            right: -40px;
            top: 5px;
            opacity: 0.35;
        }

        .chat-document {
            padding: 16px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .chat-orbit,
        .chat-orbit::before {
            animation: none !important;
        }
    }
    </style>

    <header class="chat-brand">
        <div class="chat-brand-name">
            edital<span>.fácil</span>
        </div>
        <div class="chat-brand-note">
            AI DOCUMENT ASSISTANT<br>
            RETRIEVAL AUGMENTED GENERATION
        </div>
    </header>

    <section class="chat-hero">
        <div class="chat-kicker">
            03 / INTELIGÊNCIA CONVERSACIONAL
        </div>

        <h1 class="chat-title">
            PERGUNTE.<br>
            <em>DESCUBRA.</em><br>
            ENTENDA.
        </h1>

        <p class="chat-description">
            Transforme páginas extensas em respostas
            fundamentadas. Converse com seu edital,
            explore os requisitos e confira as fontes
            que sustentam cada informação.
        </p>

        <div class="chat-orbit" aria-hidden="true"></div>
    </section>
    """,
    unsafe_allow_html=True,
)


# ==========================================
# FUNÇÕES DE INTERFACE
# ==========================================

def titulo_secao(numero, titulo, descricao):
    st.markdown(
        f"""
        <section class="chat-section">
            <div class="chat-section-index">
                {html.escape(numero)}
            </div>
            <h2 class="chat-section-title">
                {html.escape(titulo)}
            </h2>
            <div class="chat-section-text">
                {html.escape(descricao)}
            </div>
        </section>
        """,
        unsafe_allow_html=True,
    )


def mostrar_fontes(fontes):
    """Mostra trechos com referência à página do PDF."""

    if not fontes:
        return

    with st.expander(
        f"FONTES CONSULTADAS · {len(fontes)} TRECHOS"
    ):
        for numero, fonte in enumerate(fontes, start=1):
            pagina = fonte.get("pagina_pdf", "?")
            texto = fonte.get("texto", "")

            st.markdown(
                f"**FONTE [{numero}] — PÁGINA PDF {pagina}**"
            )

            st.write(texto)

            if numero < len(fontes):
                st.divider()


def mostrar_status(status):
    """Informa situações de validação do RAG."""

    if status == "sem_evidencia":
        st.info(
            "Os trechos recuperados não ofereceram "
            "evidências suficientes para esta resposta."
        )

    elif status in ("citacao_invalida", "sem_citacoes"):
        st.warning(
            "A resposta foi limitada porque suas "
            "referências não puderam ser validadas."
        )


# ==========================================
# CONEXÃO MONGODB
# ==========================================

@st.cache_resource
def obter_banco():
    return conectar_mongodb()


try:
    cliente, banco = obter_banco()
    cliente.admin.command("ping")

except Exception:
    st.error(
        "Não foi possível conectar ao MongoDB Atlas."
    )
    st.stop()


# ==========================================
# DOCUMENTOS DISPONÍVEIS
# ==========================================

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

if not documentos:
    st.warning(
        "Nenhum edital processado foi encontrado. "
        "Envie um PDF na página principal."
    )

    if st.button("IR PARA A PÁGINA INICIAL ↗"):
        st.switch_page("app.py")

    st.stop()


# ==========================================
# SELEÇÃO DO EDITAL
# ==========================================

titulo_secao(
    "01 / CONTEXTO",
    "Escolha seu documento.",
    "O assistente utilizará o edital selecionado como base.",
)

opcoes = {
    documento["documento_id"]: documento
    for documento in documentos
}

ids = list(opcoes)

selecionado = st.session_state.get(
    "edital_selecionado"
)

indice_inicial = (
    ids.index(selecionado)
    if selecionado in opcoes
    else 0
)

documento_id = st.selectbox(
    "Edital para consulta",
    options=ids,
    index=indice_inicial,
    format_func=lambda doc_id: (
        f"{opcoes[doc_id].get('concurso') or 'Concurso'} — "
        f"{opcoes[doc_id].get('cargo') or 'Cargo'} — "
        f"{opcoes[doc_id].get('nome_arquivo') or 'PDF'}"
    ),
)

st.session_state[
    "edital_selecionado"
] = documento_id

documento_atual = opcoes[documento_id]

nome_concurso = html.escape(
    str(
        documento_atual.get("concurso")
        or "Concurso não informado"
    )
)

nome_cargo = html.escape(
    str(
        documento_atual.get("cargo")
        or "Cargo não informado"
    )
)

st.markdown(
    f"""
    <div class="chat-document">
        <div class="chat-document-label">
            ● DOCUMENTO ATIVO
        </div>
        <div class="chat-document-title">
            {nome_concurso}
        </div>
        <div class="chat-document-subtitle">
            {nome_cargo}
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)


# ==========================================
# HISTÓRICO
# ==========================================

if "historico_chat" not in st.session_state:
    st.session_state.historico_chat = []

if st.session_state.get("documento_chat") != documento_id:
    st.session_state.historico_chat = []
    st.session_state.documento_chat = documento_id


# ==========================================
# NAVEGAÇÃO E SUGESTÕES
# ==========================================

col_biblioteca, col_limpar = st.columns(2)

with col_biblioteca:
    if st.button(
        "← VOLTAR À BIBLIOTECA",
        use_container_width=True,
    ):
        st.switch_page("pages/4_Biblioteca.py")

with col_limpar:
    if st.button(
        "LIMPAR CONVERSA",
        use_container_width=True,
        disabled=not bool(st.session_state.historico_chat),
    ):
        st.session_state.historico_chat = []
        st.rerun()


titulo_secao(
    "02 / DIÁLOGO",
    "Converse com o edital.",
    "Faça perguntas e confira os trechos usados na resposta.",
)

with st.expander("EXEMPLOS DE PERGUNTAS"):
    st.markdown(
        """
        - Quais são os requisitos de escolaridade?
        - Qual é a carga horária do cargo?
        - Quais disciplinas são cobradas?
        - Quais são as etapas do concurso?
        - Qual é a remuneração prevista?
        """
    )


# ==========================================
# ÁREA INICIAL SEM MENSAGENS
# ==========================================

if not st.session_state.historico_chat:
    st.markdown(
        """
        <div class="chat-empty">
            <div class="chat-empty-symbol">✳</div>
            <div class="chat-empty-heading">
                Sua próxima pergunta começa aqui.
            </div>
            <div class="chat-empty-text">
                Escolha um assunto e envie uma pergunta.
                O Edital Fácil buscará informações
                no documento selecionado.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ==========================================
# EXIBIR CONVERSAS
# ==========================================

for mensagem in st.session_state.historico_chat:

    with st.chat_message(mensagem["papel"]):

        st.markdown(mensagem["conteudo"])

        if mensagem["papel"] == "assistant":
            mostrar_status(mensagem.get("status"))
            mostrar_fontes(mensagem.get("fontes", []))


# ==========================================
# NOVA PERGUNTA
# ==========================================

pergunta = st.chat_input(
    "Pergunte algo sobre o edital..."
)

if pergunta:

    st.session_state.historico_chat.append(
        {
            "papel": "user",
            "conteudo": pergunta,
        }
    )

    with st.chat_message("user"):
        st.markdown(pergunta)

    with st.chat_message("assistant"):

        try:
            with st.status(
                "Analisando o edital...",
                expanded=False,
            ) as indicador:

                resultado = responder_pergunta(
                    banco=banco,
                    pergunta=pergunta,
                    documento_id=documento_id,
                )

                indicador.update(
                    label="Análise concluída",
                    state="complete",
                )

        except Exception as erro:
            st.error(
                "Não foi possível gerar a resposta. "
                "Tente novamente."
            )
            st.caption(
                f"Tipo do erro: {type(erro).__name__}"
            )
            st.stop()

        resposta = resultado.get("resposta", "")
        fontes = resultado.get("fontes", [])
        status = resultado.get("status")

        st.markdown(resposta)
        mostrar_status(status)
        mostrar_fontes(fontes)

    st.session_state.historico_chat.append(
        {
            "papel": "assistant",
            "conteudo": resposta,
            "fontes": fontes,
            "status": status,
        }
    )


# ==========================================
# RODAPÉ
# ==========================================

st.markdown(
    """
    <footer class="chat-footer">
        <div>EDITAL FÁCIL / INTELIGÊNCIA CONVERSACIONAL</div>
        <div>
            RESPOSTAS GERADAS POR IA · CONSULTE SEMPRE
            OS DOCUMENTOS OFICIAIS
        </div>
    </footer>
    """,
    unsafe_allow_html=True,
)
