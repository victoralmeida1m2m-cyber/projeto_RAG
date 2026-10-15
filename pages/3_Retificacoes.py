
import hashlib
import html

import streamlit as st

from services.retificacoes import analisar_pdfs


# ==========================================
# CONFIGURAÇÃO
# ==========================================

st.set_page_config(
    page_title="Retificações | Edital Fácil",
    page_icon="📄",
    layout="wide",
)


# ==========================================
# IDENTIDADE VISUAL EXCLUSIVA
# ==========================================

st.markdown(
    """
    <style>
    :root {
        --ret-navy: #102B4B;
        --ret-orange: #F47721;
        --ret-bg: #F8FAFD;
        --ret-muted: #60738B;
        --ret-line: #DFE6ED;
    }

    .stApp {
        background:
            radial-gradient(
                ellipse at 90% 8%,
                rgba(244, 119, 33, 0.10),
                transparent 30%
            ),
            radial-gradient(
                ellipse at 3% 40%,
                rgba(16, 43, 75, 0.045),
                transparent 28%
            ),
            var(--ret-bg);
        color: var(--ret-navy);
    }

    .block-container {
        max-width: 1160px;
        padding-top: 2rem;
        padding-bottom: 5rem;
    }

    /* Preserva contraste dos elementos nativos */
    .stApp h1,
    .stApp h2,
    .stApp h3,
    .stApp label,
    .stApp .stMarkdown p {
        color: var(--ret-navy);
    }

    .stApp [data-testid="stWidgetLabel"] p {
        color: var(--ret-navy);
        font-weight: 650;
    }

    .stApp [data-testid="stSidebar"] {
        background: #102B4B;
    }

    .stApp [data-testid="stSidebar"] * {
        color: #F7FAFF;
    }

    .stApp [data-testid="stSidebar"] a:hover {
        color: #FFAC70;
    }

    /* Cabeçalho */
    .ret-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 0 24px;
        border-bottom: 1px solid var(--ret-line);
        margin-bottom: 55px;
    }

    .ret-brand {
        color: var(--ret-navy);
        font-size: 22px;
        font-weight: 850;
        letter-spacing: -0.07em;
    }

    .ret-brand span {
        color: var(--ret-orange);
    }

    .ret-topnote {
        color: var(--ret-muted);
        font: 700 10px ui-monospace, monospace;
        letter-spacing: 0.15em;
        text-align: right;
    }

    /* Hero editorial */
    .ret-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 180px;
        align-items: center;
        gap: 30px;
        padding-bottom: 62px;
    }

    .ret-kicker {
        color: var(--ret-orange);
        font: 800 11px ui-monospace, monospace;
        letter-spacing: 0.19em;
        margin-bottom: 26px;
    }

    .ret-title {
        color: var(--ret-navy);
        font-size: clamp(3.2rem, 8vw, 7.2rem);
        font-weight: 900;
        letter-spacing: -0.085em;
        line-height: 0.93;
        margin: 0;
    }

    .ret-title em {
        color: var(--ret-orange);
        font-style: normal;
    }

    .ret-description {
        color: var(--ret-muted);
        max-width: 650px;
        font-size: clamp(1rem, 2vw, 1.15rem);
        line-height: 1.7;
        margin-top: 28px;
    }

    /* Ilustração em movimento */
    .ret-hero-art {
        position: relative;
        width: 155px;
        height: 195px;
        transform: rotate(10deg);
        animation: ret-float 5s ease-in-out infinite;
    }

    .ret-hero-art::before {
        content: "PDF";
        position: absolute;
        inset: 0;
        background: #FFFFFF;
        border: 2px solid var(--ret-navy);
        border-radius: 13px 35px 13px 13px;
        box-shadow: 15px 16px 0 #FFD5B8;
        display: grid;
        place-items: center;
        color: var(--ret-orange);
        font: 900 43px ui-monospace, monospace;
    }

    .ret-hero-art::after {
        content: "↗";
        position: absolute;
        top: -22px;
        right: -27px;
        width: 55px;
        height: 55px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        color: white;
        background: var(--ret-orange);
        font-size: 31px;
        box-shadow: 0 9px 22px rgba(244,119,33,.22);
    }

    /* Seções */
    .ret-section {
        border-top: 1px solid var(--ret-line);
        padding: 27px 0 22px;
        margin-top: 10px;
    }

    .ret-index {
        color: var(--ret-orange);
        font: 800 11px ui-monospace, monospace;
        letter-spacing: 0.15em;
        margin-bottom: 12px;
    }

    .ret-heading {
        color: var(--ret-navy);
        font-size: clamp(1.7rem, 4vw, 2.8rem);
        font-weight: 850;
        letter-spacing: -0.065em;
        line-height: 1.1;
        margin: 0 0 12px;
    }

    .ret-subheading {
        color: var(--ret-muted);
        font-size: 0.97rem;
        line-height: 1.6;
    }

    /* Uploads em formato de PDF flutuante */
    .ret-upload-label {
        color: var(--ret-navy);
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.13em;
        margin: 14px 0;
    }

    .stApp [data-testid="stFileUploader"] {
        position: relative;
        overflow: hidden;
        padding: 30px 16px 20px;
        min-height: 255px;
        background: #FFFFFF;
        border: 1px solid var(--ret-line);
        border-radius: 24px;
        box-shadow: 0 16px 36px rgba(16,43,75,.055);
        transition:
            transform 260ms ease,
            box-shadow 260ms ease,
            border-color 260ms ease;
    }

    .stApp [data-testid="stFileUploader"]:hover {
        transform: translateY(-5px);
        border-color: var(--ret-orange);
        box-shadow: 0 22px 45px rgba(244,119,33,.12);
    }

    .stApp [data-testid="stFileUploader"]::before {
        content: "PDF";
        pointer-events: none;
        display: grid;
        place-items: center;
        width: 64px;
        height: 78px;
        margin: 0 auto 18px;
        background: #FFF4EC;
        color: var(--ret-orange);
        border: 2px solid var(--ret-orange);
        border-radius: 6px 18px 6px 6px;
        font: 900 20px ui-monospace, monospace;
        box-shadow: 7px 8px 0 rgba(244,119,33,.12);
        transform: rotate(-5deg);
        animation: ret-pdf-float 4s ease-in-out infinite;
    }

    .stApp [data-testid="stFileUploaderDropzone"] {
        background: #F7F9FC;
        border: 1px dashed #BAC9D8;
        border-radius: 14px;
    }

    .stApp [data-testid="stFileUploaderDropzone"] * {
        color: var(--ret-navy);
    }

    .stApp [data-testid="stFileUploaderDropzone"] button {
        background: var(--ret-navy);
        color: #FFFFFF;
        border: none;
        border-radius: 999px;
        font-weight: 700;
        padding: 8px 16px;
    }

    .stApp [data-testid="stFileUploaderDropzone"] button:hover {
        background: #244D78;
        color: #FFFFFF;
    }

    .stApp [data-testid="stFileUploaderFile"] {
        color: var(--ret-navy);
    }

    /* Botão principal */
    .stApp div.stButton > button[kind="primary"] {
        background: var(--ret-orange);
        color: #FFFFFF;
        border: 1px solid var(--ret-orange);
        border-radius: 999px;
        min-height: 3.6rem;
        font-size: 0.95rem;
        font-weight: 850;
        letter-spacing: 0.04em;
        box-shadow: 0 10px 24px rgba(244,119,33,.18);
        transition:
            transform 220ms ease,
            box-shadow 220ms ease,
            background 220ms ease;
    }

    .stApp div.stButton > button[kind="primary"]:hover:not(:disabled) {
        background: #D95E10;
        color: #FFFFFF;
        transform: translateY(-3px);
        box-shadow: 0 16px 32px rgba(244,119,33,.26);
    }

    .stApp div.stButton > button:disabled {
        opacity: 0.5;
    }

    .stApp div.stButton > button:focus-visible {
        outline: 3px solid var(--ret-navy);
        outline-offset: 3px;
    }

    /* Resultados */
    .stApp [data-testid="stMetric"] {
        background: #FFFFFF;
        border: 1px solid var(--ret-line);
        border-radius: 18px;
        padding: 20px;
        box-shadow: 0 8px 25px rgba(16,43,75,.04);
    }

    .stApp [data-testid="stMetricLabel"] * {
        color: var(--ret-muted);
    }

    .stApp [data-testid="stMetricValue"] * {
        color: var(--ret-navy);
    }

    .stApp [data-testid="stExpander"] {
        background: #FFFFFF;
        border: 1px solid var(--ret-line);
        border-radius: 18px;
        margin-bottom: 14px;
        box-shadow: 0 8px 25px rgba(16,43,75,.035);
    }

    .stApp [data-testid="stExpander"] summary,
    .stApp [data-testid="stExpander"] summary * {
        color: var(--ret-navy);
        font-weight: 700;
    }

    .ret-old,
    .ret-new {
        border-radius: 12px;
        padding: 12px 15px;
        font-size: 0.83rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        margin-bottom: 12px;
    }

    .ret-old {
        background: #EAF1F9;
        color: var(--ret-navy);
        border-left: 3px solid var(--ret-navy);
    }

    .ret-new {
        background: #FFF0E4;
        color: #B54F0E;
        border-left: 3px solid var(--ret-orange);
    }

    .ret-guide {
        color: var(--ret-muted);
        line-height: 1.65;
        background: #FFFFFF;
        border-left: 3px solid var(--ret-orange);
        border-radius: 0 12px 12px 0;
        padding: 17px 20px;
        margin: 18px 0 26px;
    }

    .ret-footer {
        border-top: 1px solid var(--ret-line);
        padding: 26px 0;
        margin-top: 55px;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 15px;
        color: var(--ret-muted);
        font: 700 10px ui-monospace, monospace;
        letter-spacing: 0.11em;
    }

    @keyframes ret-float {
        0%,100% {transform:translateY(0) rotate(10deg)}
        50% {transform:translateY(-17px) rotate(7deg)}
    }

    @keyframes ret-pdf-float {
        0%,100% {transform:translateY(0) rotate(-5deg)}
        50% {transform:translateY(-7px) rotate(-2deg)}
    }

    @keyframes ret-reveal {
        from {opacity:0;transform:translateY(20px)}
        to {opacity:1;transform:translateY(0)}
    }

    @media (prefers-reduced-motion:no-preference) {
        .ret-hero {
            animation: ret-reveal 700ms ease-out both;
        }
        .ret-section {
            animation: ret-reveal 700ms 120ms ease-out both;
        }
    }

    @media (max-width:760px) {
        .ret-topbar {margin-bottom:35px}
        .ret-hero {
            grid-template-columns:1fr;
            padding-bottom:30px;
        }
        .ret-hero-art {display:none}
        .ret-footer {flex-direction:column}
    }

    @media (prefers-reduced-motion:reduce) {
        .ret-hero-art,
        .stApp [data-testid="stFileUploader"]::before {
            animation:none !important;
        }
    }
    </style>

    <header class="ret-topbar">
        <div class="ret-brand">edital<span>.fácil</span></div>
        <div class="ret-topnote">
            DOCUMENT REVISION LAB<br>
            ORIGINAL / ALTERAÇÕES
        </div>
    </header>

    <section class="ret-hero">
        <div>
            <div class="ret-kicker">
                05 / LABORATÓRIO DE RETIFICAÇÕES
            </div>
            <h1 class="ret-title">
                ONDE SE LÊ.<br>
                <em>LEIA-SE.</em><br>
                ENTENDA.
            </h1>
            <p class="ret-description">
                Descubra o que mudou no edital.
                Encontre trechos substituídos,
                identifique as páginas de origem
                e acompanhe cada retificação.
            </p>
        </div>
        <div class="ret-hero-art" aria-hidden="true"></div>
    </section>
    """,
    unsafe_allow_html=True,
)


# ==========================================
# COMPONENTES DA INTERFACE
# ==========================================

def titulo_secao(numero, titulo, descricao):
    st.markdown(
        f"""
        <section class="ret-section">
            <div class="ret-index">
                {html.escape(numero)}
            </div>
            <h2 class="ret-heading">
                {html.escape(titulo)}
            </h2>
            <div class="ret-subheading">
                {html.escape(descricao)}
            </div>
        </section>
        """,
        unsafe_allow_html=True,
    )


def mostrar_alteracao(item, numero):
    status = item["status"]

    nomes = {
        "localizado": "Trecho localizado",
        "ambiguo": "Localização ambígua",
        "nao_localizado": "Não localizado",
    }

    nome_status = nomes.get(status, status)

    with st.expander(
        f"ALTERAÇÃO {numero:02d}  /  {nome_status}",
        expanded=(numero == 1),
    ):
        st.caption(
            "Página da retificação: "
            f"{item['pagina_retificacao']}"
        )

        paginas = item["paginas_originais"]

        st.caption(
            "Páginas encontradas no edital original: "
            + (
                ", ".join(map(str, paginas))
                if paginas
                else "Nenhuma"
            )
        )

        col_antigo, col_novo = st.columns(
            2,
            gap="medium",
        )

        with col_antigo:
            st.markdown(
                '<div class="ret-old">− ONDE SE LÊ</div>',
                unsafe_allow_html=True,
            )
            st.code(
                item["texto_original"],
                language=None,
            )

        with col_novo:
            st.markdown(
                '<div class="ret-new">+ LEIA-SE</div>',
                unsafe_allow_html=True,
            )
            st.code(
                item["texto_atualizado"],
                language=None,
            )

        if status == "localizado":
            st.success(
                "Trecho anterior localizado no edital original."
            )
        elif status == "ambiguo":
            st.warning(
                "Trecho encontrado em várias páginas. "
                "Confira manualmente."
            )
        else:
            st.warning(
                "Não foi possível localizar automaticamente "
                "o trecho anterior."
            )


# ==========================================
# UPLOAD DOS DOCUMENTOS
# ==========================================

titulo_secao(
    "01 / ARQUIVOS",
    "Dois documentos. Uma análise.",
    "Envie o edital original e o PDF que contém as retificações.",
)

st.markdown(
    """
    <div class="ret-guide">
        Identificamos pares textuais do tipo
        <strong>Onde se lê / Leia-se</strong> presentes
        na mesma página da retificação.
        Confira sempre os resultados nos documentos oficiais.
    </div>
    """,
    unsafe_allow_html=True,
)

col1, col2 = st.columns(
    2,
    gap="large",
)

with col1:
    st.markdown(
        '<div class="ret-upload-label">'
        '01 / PDF ORIGINAL'
        '</div>',
        unsafe_allow_html=True,
    )

    original = st.file_uploader(
        "Edital original",
        type=["pdf"],
        key="original_retificacao",
    )

with col2:
    st.markdown(
        '<div class="ret-upload-label">'
        '02 / PDF DE RETIFICAÇÃO'
        '</div>',
        unsafe_allow_html=True,
    )

    retificacao = st.file_uploader(
        "Documento de retificação",
        type=["pdf"],
        key="arquivo_retificacao",
    )


# ==========================================
# CONTROLE DOS ARQUIVOS
# ==========================================

pronto = (
    original is not None
    and retificacao is not None
)

if pronto:
    assinatura = (
        hashlib.sha256(original.getvalue()).hexdigest(),
        hashlib.sha256(retificacao.getvalue()).hexdigest(),
    )
else:
    assinatura = None

# Evita mostrar resultados de arquivos anteriores.
if st.session_state.get("ret_assinatura") != assinatura:
    st.session_state.pop("ret_resultados", None)
    st.session_state["ret_assinatura"] = assinatura


# ==========================================
# EXECUTAR ANÁLISE
# ==========================================

st.write("")

if st.button(
    "ANALISAR RETIFICAÇÕES ↗",
    type="primary",
    disabled=not pronto,
    use_container_width=True,
):
    try:
        with st.status(
            "Identificando alterações...",
            expanded=False,
        ) as indicador:

            resultados = analisar_pdfs(
                original.getvalue(),
                retificacao.getvalue(),
            )

            st.session_state["ret_resultados"] = resultados

            indicador.update(
                label="Análise concluída",
                state="complete",
            )

    except Exception as erro:
        st.session_state.pop("ret_resultados", None)
        st.error(
            "Não foi possível analisar os documentos."
        )
        st.caption(
            f"Tipo do erro: {type(erro).__name__}"
        )


# ==========================================
# RESULTADOS
# ==========================================

resultados = st.session_state.get("ret_resultados")

if resultados is not None:
    titulo_secao(
        "02 / RESULTADOS",
        "O que foi alterado?",
        "Explore cada mudança detectada na retificação.",
    )

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

    c1, c2, c3 = st.columns(
        3,
        gap="medium",
    )

    c1.metric("Localizados", localizados)
    c2.metric("Ambíguos", ambiguos)
    c3.metric("Não localizados", nao_localizados)

    if not resultados:
        st.warning(
            "Nenhum par completo 'Onde se lê / Leia-se' "
            "foi identificado. Isso não significa que "
            "o documento não contenha alterações."
        )

    else:
        filtro = st.selectbox(
            "Filtrar alterações",
            options=[
                "Todas",
                "Localizadas",
                "Ambíguas",
                "Não localizadas",
            ],
            key="ret_filtro",
        )

        mapa_filtros = {
            "Localizadas": "localizado",
            "Ambíguas": "ambiguo",
            "Não localizadas": "nao_localizado",
        }

        filtrados = [
            (numero, item)
            for numero, item in enumerate(
                resultados,
                start=1,
            )
            if (
                filtro == "Todas"
                or item["status"] == mapa_filtros.get(filtro)
            )
        ]

        if not filtrados:
            st.info(
                "Nenhuma alteração encontrada nesta categoria."
            )

        for numero, item in filtrados:
            mostrar_alteracao(item, numero)


# ==========================================
# RODAPÉ
# ==========================================

st.markdown(
    """
    <footer class="ret-footer">
        <span>EDITAL FÁCIL / REVISION LAB</span>
        <span>RETIFICAÇÕES TEXTUAIS · CONFERÊNCIA OFICIAL</span>
    </footer>
    """,
    unsafe_allow_html=True,
)
