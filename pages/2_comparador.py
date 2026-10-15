
import hashlib
import html

import streamlit as st

from services.comparacao_pdf import (
    extrair_paginas_pdf,
    comparar_paginas,
)
from ui.styles import aplicar_estilos


# ==========================================
# CONFIGURAÇÃO
# ==========================================

st.set_page_config(
    page_title="Comparador | Edital Fácil",
    page_icon="📑",
    layout="wide",
)

aplicar_estilos()


# ==========================================
# IDENTIDADE VISUAL
# ==========================================

st.markdown(
    """
    <style>
    .cmp-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 12px 0 22px;
        border-bottom: 1px solid #373d32;
        margin-bottom: 55px;
    }

    .cmp-brand {
        color: #f2f4ec;
        font-size: 22px;
        font-weight: 850;
        letter-spacing: -0.07em;
    }

    .cmp-brand span {
        color: #d5ff65;
    }

    .cmp-topnote {
        color: #a2aa9c;
        font: 600 10px ui-monospace, monospace;
        letter-spacing: 0.15em;
        text-align: right;
    }

    .cmp-hero {
        position: relative;
        overflow: hidden;
        padding: 0 0 55px;
    }

    .cmp-kicker {
        color: #d5ff65;
        font: 700 11px ui-monospace, monospace;
        letter-spacing: 0.2em;
        margin-bottom: 25px;
    }

    .cmp-title {
        position: relative;
        z-index: 1;
        color: #f2f4ec;
        font-size: clamp(3.2rem, 8vw, 7rem);
        font-weight: 850;
        letter-spacing: -0.085em;
        line-height: 0.92;
        margin: 0;
    }

    .cmp-title em {
        color: #d5ff65;
        font-style: normal;
    }

    .cmp-description {
        color: #a2aa9c;
        font-size: clamp(1rem, 2vw, 1.2rem);
        line-height: 1.65;
        max-width: 650px;
        margin-top: 28px;
    }

    .cmp-orbit {
        position: absolute;
        top: 35px;
        right: 65px;
        width: 170px;
        height: 170px;
        border: 1px solid rgba(213, 255, 101, 0.3);
        border-radius: 50%;
        box-shadow:
            0 0 0 25px rgba(213, 255, 101, 0.025),
            0 0 0 60px rgba(213, 255, 101, 0.018);
        animation: cmp-float 7s ease-in-out infinite;
        pointer-events: none;
    }

    .cmp-orbit::before {
        content: "";
        position: absolute;
        inset: 28px;
        border: 1px dashed rgba(213, 255, 101, 0.45);
        border-radius: 50%;
        animation: cmp-spin 28s linear infinite;
    }

    .cmp-orbit::after {
        content: "↔";
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #d5ff65;
        font-size: 58px;
    }

    .cmp-section {
        border-top: 1px solid #373d32;
        padding: 28px 0 20px;
        margin-top: 16px;
    }

    .cmp-section-index {
        color: #d5ff65;
        font: 700 11px ui-monospace, monospace;
        letter-spacing: 0.16em;
        margin-bottom: 12px;
    }

    .cmp-section-title {
        color: #f2f4ec;
        font-size: clamp(1.6rem, 4vw, 2.6rem);
        font-weight: 800;
        letter-spacing: -0.06em;
        line-height: 1.1;
        margin: 0 0 12px;
    }

    .cmp-section-text {
        color: #a2aa9c;
        font-size: 0.95rem;
        line-height: 1.65;
    }

    .cmp-notice {
        border-left: 3px solid #d5ff65;
        background: #171a15;
        border-radius: 0 14px 14px 0;
        padding: 18px 22px;
        color: #b8c1b1;
        font-size: 0.9rem;
        line-height: 1.65;
        margin: 12px 0 28px;
    }

    .cmp-file-label {
        color: #d5ff65;
        font: 700 11px ui-monospace, monospace;
        letter-spacing: 0.12em;
        margin: 14px 0;
    }

    .cmp-old-label {
        color: #ffada6;
        font-weight: 750;
        letter-spacing: 0.06em;
    }

    .cmp-new-label {
        color: #d5ff65;
        font-weight: 750;
        letter-spacing: 0.06em;
    }

    .cmp-footer {
        padding: 26px 0;
        margin-top: 45px;
        border-top: 1px solid #373d32;
        color: #a2aa9c;
        font: 600 10px ui-monospace, monospace;
        letter-spacing: 0.1em;
        line-height: 1.8;
    }

    @keyframes cmp-float {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-16px);
        }
    }

    @keyframes cmp-spin {
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes cmp-reveal {
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
        .cmp-hero {
            animation: cmp-reveal 700ms ease-out both;
        }

        .cmp-section {
            animation: cmp-reveal 700ms 120ms ease-out both;
        }
    }

    @media (max-width: 760px) {
        .cmp-topbar {
            margin-bottom: 36px;
        }

        .cmp-hero {
            padding-bottom: 35px;
        }

        .cmp-orbit {
            width: 100px;
            height: 100px;
            right: -45px;
            top: 10px;
            opacity: 0.3;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .cmp-orbit,
        .cmp-orbit::before {
            animation: none !important;
        }
    }
    </style>

    <header class="cmp-topbar">
        <div class="cmp-brand">
            edital<span>.fácil</span>
        </div>
        <div class="cmp-topnote">
            DOCUMENT COMPARISON<br>
            INTELLIGENCE / 2026
        </div>
    </header>

    <section class="cmp-hero">
        <div class="cmp-kicker">
            04 / ANÁLISE DE VERSÕES
        </div>

        <h1 class="cmp-title">
            CADA<br>
            VERSÃO.<br>
            <em>CADA MUDANÇA.</em>
        </h1>

        <p class="cmp-description">
            Compare duas versões de um edital.
            Descubra substituições, adições e remoções,
            com referências às páginas dos documentos.
        </p>

        <div class="cmp-orbit" aria-hidden="true"></div>
    </section>
    """,
    unsafe_allow_html=True,
)


# ==========================================
# FUNÇÕES VISUAIS
# ==========================================

def titulo_secao(numero, titulo, descricao):
    st.markdown(
        f"""
        <section class="cmp-section">
            <div class="cmp-section-index">
                {html.escape(numero)}
            </div>
            <h2 class="cmp-section-title">
                {html.escape(titulo)}
            </h2>
            <div class="cmp-section-text">
                {html.escape(descricao)}
            </div>
        </section>
        """,
        unsafe_allow_html=True,
    )


def formatar_paginas(paginas):
    if not paginas:
        return "Não se aplica"

    return ", ".join(str(pagina) for pagina in paginas)


def mostrar_alteracao(alteracao, numero):
    tipo = alteracao["tipo"]

    nomes = {
        "substituido": "Substituição",
        "adicionado": "Adição",
        "removido": "Remoção",
    }

    nome = nomes.get(tipo, tipo.title())

    with st.expander(
        f"{numero:02d} / {nome}",
        expanded=(numero == 1),
    ):
        col_antigo, col_novo = st.columns(
            2,
            gap="medium",
        )

        with col_antigo:
            st.markdown(
                '<span class="cmp-old-label">'
                '− VERSÃO ORIGINAL'
                '</span>',
                unsafe_allow_html=True,
            )

            st.caption(
                "Página(s) PDF: "
                + formatar_paginas(
                    alteracao["paginas_originais"]
                )
            )

            if alteracao["texto_original"]:
                st.code(
                    alteracao["texto_original"],
                    language=None,
                )
            else:
                st.caption(
                    "Nenhum texto na versão original."
                )

        with col_novo:
            st.markdown(
                '<span class="cmp-new-label">'
                '+ VERSÃO ATUALIZADA'
                '</span>',
                unsafe_allow_html=True,
            )

            st.caption(
                "Página(s) PDF: "
                + formatar_paginas(
                    alteracao["paginas_atualizadas"]
                )
            )

            if alteracao["texto_atualizado"]:
                st.code(
                    alteracao["texto_atualizado"],
                    language=None,
                )
            else:
                st.caption(
                    "Nenhum texto na versão atualizada."
                )


# ==========================================
# UPLOAD DOS DOCUMENTOS
# ==========================================

titulo_secao(
    "01 / DOCUMENTOS",
    "Selecione as versões.",
    "Envie o edital original e sua versão atualizada.",
)

st.markdown(
    """
    <div class="cmp-notice">
        Este módulo compara duas versões completas
        de um edital. Para documentos parciais com
        “Onde se lê / Leia-se”, utilize a página
        de Retificações.
    </div>
    """,
    unsafe_allow_html=True,
)

col1, col2 = st.columns(
    2,
    gap="medium",
)

with col1:
    st.markdown(
        '<div class="cmp-file-label">'
        '01 — DOCUMENTO ORIGINAL'
        '</div>',
        unsafe_allow_html=True,
    )

    arquivo_original = st.file_uploader(
        "Edital original",
        type=["pdf"],
        key="pdf_original",
    )

with col2:
    st.markdown(
        '<div class="cmp-file-label">'
        '02 — DOCUMENTO ATUALIZADO'
        '</div>',
        unsafe_allow_html=True,
    )

    arquivo_atualizado = st.file_uploader(
        "Edital atualizado",
        type=["pdf"],
        key="pdf_atualizado",
    )


# ==========================================
# CONTROLE DA COMPARAÇÃO
# ==========================================

pronto = (
    arquivo_original is not None
    and arquivo_atualizado is not None
)

# Identifica os PDFs sem armazená-los na sessão.
if pronto:
    assinatura_atual = (
        hashlib.sha256(
            arquivo_original.getvalue()
        ).hexdigest(),
        hashlib.sha256(
            arquivo_atualizado.getvalue()
        ).hexdigest(),
    )
else:
    assinatura_atual = None

# Limpa resultados se os documentos mudarem.
if st.session_state.get(
    "comparador_assinatura"
) != assinatura_atual:

    st.session_state.pop(
        "comparador_resultado",
        None,
    )

    st.session_state[
        "comparador_assinatura"
    ] = assinatura_atual


if st.button(
    "COMPARAR DOCUMENTOS ↗",
    type="primary",
    disabled=not pronto,
    use_container_width=True,
):

    try:
        with st.status(
            "Analisando as diferenças...",
            expanded=False,
        ) as indicador:

            paginas_a = extrair_paginas_pdf(
                arquivo_original.getvalue()
            )

            paginas_b = extrair_paginas_pdf(
                arquivo_atualizado.getvalue()
            )

            # Exige texto extraível nos PDFs.
            if not any(
                pagina["texto"].strip()
                for pagina in paginas_a
            ):
                st.error(
                    "O PDF original não possui texto extraível."
                )
                st.stop()

            if not any(
                pagina["texto"].strip()
                for pagina in paginas_b
            ):
                st.error(
                    "O PDF atualizado não possui texto extraível."
                )
                st.stop()

            alteracoes = comparar_paginas(
                paginas_a,
                paginas_b,
            )

            st.session_state[
                "comparador_resultado"
            ] = alteracoes

            indicador.update(
                label="Comparação concluída",
                state="complete",
            )

    except Exception as erro:
        st.session_state.pop(
            "comparador_resultado",
            None,
        )

        st.error(
            "Não foi possível comparar os documentos."
        )

        st.caption(
            f"Tipo do erro: {type(erro).__name__}"
        )


# ==========================================
# RESULTADOS
# ==========================================

alteracoes = st.session_state.get(
    "comparador_resultado"
)

if alteracoes is not None:

    titulo_secao(
        "02 / RESULTADOS",
        "O que mudou?",
        "Explore cada diferença e confira as páginas.",
    )

    substituidas = sum(
        alteracao["tipo"] == "substituido"
        for alteracao in alteracoes
    )

    adicionadas = sum(
        alteracao["tipo"] == "adicionado"
        for alteracao in alteracoes
    )

    removidas = sum(
        alteracao["tipo"] == "removido"
        for alteracao in alteracoes
    )

    m1, m2, m3 = st.columns(
        3,
        gap="medium",
    )

    m1.metric(
        "Substituições",
        substituidas,
    )

    m2.metric(
        "Adições",
        adicionadas,
    )

    m3.metric(
        "Remoções",
        removidas,
    )

    if not alteracoes:
        st.success(
            "Nenhuma diferença textual foi identificada."
        )

    else:
        st.info(
            "As diferenças são textuais. "
            "Confira os documentos oficiais "
            "antes de interpretar seus efeitos."
        )

        # Filtro visual sem recalcular os PDFs.
        filtro = st.selectbox(
            "Filtrar alterações",
            options=[
                "Todas",
                "Substituições",
                "Adições",
                "Remoções",
            ],
            key="comparador_filtro",
        )

        tipos = {
            "Substituições": "substituido",
            "Adições": "adicionado",
            "Remoções": "removido",
        }

        filtradas = [
            (numero, alteracao)
            for numero, alteracao in enumerate(
                alteracoes,
                start=1,
            )
            if (
                filtro == "Todas"
                or alteracao["tipo"] == tipos.get(filtro)
            )
        ]

        if not filtradas:
            st.info(
                "Nenhuma alteração nesta categoria."
            )

        for numero, alteracao in filtradas:
            mostrar_alteracao(
                alteracao,
                numero,
            )


# ==========================================
# RODAPÉ
# ==========================================

st.markdown(
    """
    <footer class="cmp-footer">
        EDITAL FÁCIL / COMPARAÇÃO DOCUMENTAL<br>
        DIFERENÇAS TEXTUAIS · REVISÃO HUMANA RECOMENDADA
    </footer>
    """,
    unsafe_allow_html=True,
)
