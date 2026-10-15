
import html

import streamlit as st


def aplicar_estilos():
    """Aplica o tema editorial futurista em todas as páginas."""

    st.markdown(
        """
        <style>
        :root {
            --ef-bg: #0c0e0b;
            --ef-panel: #171a15;
            --ef-panel-hover: #20251c;
            --ef-text: #f2f4ec;
            --ef-muted: #a2aa9c;
            --ef-line: #373d32;
            --ef-accent: #d5ff65;
        }

        .stApp {
            background:
                radial-gradient(
                    ellipse at 85% 5%,
                    rgba(213, 255, 101, 0.065),
                    transparent 30%
                ),
                #0c0e0b;
            color: var(--ef-text);
        }

        .block-container {
            max-width: 1180px;
            padding-top: 2rem;
            padding-bottom: 5rem;
        }

        /* Entrada suave do conteúdo */
        .block-container > div {
            animation: ef-enter 650ms ease-out both;
        }

        @keyframes ef-enter {
            from {
                opacity: 0;
                transform: translateY(15px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .ef-masthead {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 1rem;
            border-bottom: 1px solid var(--ef-line);
            padding: 0.5rem 0 1.5rem;
            margin-bottom: 2.5rem;
        }

        .ef-brand {
            font-size: 1.35rem;
            font-weight: 850;
            letter-spacing: -0.07em;
            color: var(--ef-text);
        }

        .ef-brand span {
            color: var(--ef-accent);
        }

        .ef-masthead-note {
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            color: var(--ef-muted);
            text-align: right;
        }

        .ef-hero {
            position: relative;
            overflow: hidden;
            padding: 2.5rem 0 3.5rem;
        }

        .ef-hero::before {
            content: "";
            position: absolute;
            width: 300px;
            height: 300px;
            right: -110px;
            top: 0;
            border: 1px solid rgba(213,255,101,.18);
            border-radius: 50%;
            box-shadow:
                0 0 0 38px rgba(213,255,101,.025),
                0 0 0 83px rgba(213,255,101,.018);
            pointer-events: none;
            animation: ef-orbit 9s ease-in-out infinite;
        }

        @keyframes ef-orbit {
            0%, 100% {
                transform: translateY(0) scale(1);
            }
            50% {
                transform: translateY(-16px) scale(1.04);
            }
        }

        .ef-eyebrow {
            color: var(--ef-accent);
            font-size: 0.7rem;
            font-weight: 750;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            margin-bottom: 1.5rem;
        }

        .ef-headline {
            position: relative;
            z-index: 1;
            color: var(--ef-text);
            font-size: clamp(3.3rem, 8vw, 7.1rem);
            font-weight: 850;
            letter-spacing: -0.09em;
            line-height: 0.92;
            max-width: 990px;
            margin: 0;
        }

        .ef-headline em {
            color: var(--ef-accent);
            font-style: normal;
        }

        .ef-description {
            max-width: 600px;
            margin: 2rem 0 0;
            color: var(--ef-muted);
            line-height: 1.75;
            font-size: 1.02rem;
        }

        .ef-rule {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
            padding: 1.15rem 0;
            border-top: 1px solid var(--ef-line);
            border-bottom: 1px solid var(--ef-line);
            color: var(--ef-muted);
            font-size: 0.7rem;
            font-weight: 650;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            margin-bottom: 3rem;
        }

        .ef-heading {
            color: var(--ef-text);
            font-size: clamp(1.5rem, 3.5vw, 2.4rem);
            line-height: 1.1;
            font-weight: 800;
            letter-spacing: -0.06em;
            margin: 0 0 0.75rem;
        }

        .ef-section-lead {
            color: var(--ef-muted);
            font-size: 0.95rem;
            line-height: 1.65;
            margin: 0 0 1.5rem;
        }

        .ef-step {
            background: var(--ef-panel);
            border: 1px solid var(--ef-line);
            border-radius: 16px;
            min-height: 125px;
            padding: 1.2rem;
            transition:
                background 250ms ease,
                border-color 250ms ease,
                transform 250ms ease;
        }

        .ef-step:hover {
            background: var(--ef-panel-hover);
            border-color: rgba(213,255,101,.55);
            transform: translateY(-4px);
        }

        .ef-step-number {
            color: var(--ef-accent);
            font: 700 0.72rem ui-monospace, monospace;
            margin-bottom: 1.25rem;
        }

        .ef-step-title {
            color: var(--ef-text);
            font-size: 1.05rem;
            font-weight: 750;
            letter-spacing: -0.03em;
            margin-bottom: 0.3rem;
        }

        .ef-step-text {
            color: var(--ef-muted);
            font-size: 0.83rem;
            line-height: 1.5;
        }

        /* Botões nativos: funcionalidade permanece no Streamlit */
        div.stButton > button {
            min-height: 3rem;
            border-radius: 999px;
            border: 1px solid var(--ef-line);
            background: var(--ef-panel);
            color: var(--ef-text);
            font-weight: 700;
            transition:
                transform 200ms ease,
                background 200ms ease,
                border-color 200ms ease,
                box-shadow 200ms ease;
        }

        div.stButton > button:hover:not(:disabled) {
            transform: translateY(-2px);
            border-color: var(--ef-accent);
            background: var(--ef-panel-hover);
            color: var(--ef-text);
        }

        div.stButton > button[kind="primary"] {
            background: var(--ef-accent);
            border-color: var(--ef-accent);
            color: #0c0e0b;
            font-weight: 800;
        }

        div.stButton > button[kind="primary"]:hover:not(:disabled) {
            background: #e4ff9e;
            color: #0c0e0b;
            box-shadow: 0 8px 25px rgba(213,255,101,.15);
        }

        div.stButton > button:focus-visible {
            outline: 2px solid var(--ef-accent);
            outline-offset: 3px;
        }

        div.stButton > button:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

        /* Inputs, upload e indicadores */
        div[data-testid="stFileUploader"] {
            border-radius: 16px;
        }

        div[data-testid="stMetric"] {
            background: var(--ef-panel);
            border: 1px solid var(--ef-line);
            border-radius: 16px;
            padding: 1rem;
        }

        div[data-testid="stMetric"] label {
            color: var(--ef-muted);
        }

        div[data-testid="stMetricValue"] {
            color: var(--ef-accent);
        }

        div[data-testid="stExpander"] {
            border-color: var(--ef-line);
            border-radius: 14px;
        }

        div[data-testid="stSidebar"] {
            background: #11140f;
            border-right: 1px solid var(--ef-line);
        }

        .ef-footer {
            border-top: 1px solid var(--ef-line);
            padding-top: 1.5rem;
            margin-top: 3rem;
            color: var(--ef-muted);
            font-size: 0.75rem;
            letter-spacing: 0.04em;
        }

        @media (max-width: 700px) {
            .ef-hero {
                padding: 1rem 0 2.5rem;
            }

            .ef-hero::before {
                width: 180px;
                height: 180px;
                right: -90px;
            }

            .ef-masthead-note {
                font-size: 0.57rem;
            }

            .ef-description {
                font-size: 0.95rem;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def cabecalho():
    st.markdown(
        """
        <header class="ef-masthead">
            <div class="ef-brand">edital<span>.fácil</span></div>
            <div class="ef-masthead-note">
                INTELLIGENT DOCUMENT EXPERIENCE / 2026
            </div>
        </header>
        """,
        unsafe_allow_html=True,
    )


def hero_inicial():
    st.markdown(
        """
        <section class="ef-hero">
            <div class="ef-eyebrow">
                01 / INTELIGÊNCIA DOCUMENTAL
            </div>
            <h1 class="ef-headline">
                MENOS<br>
                BUROCRACIA.<br>
                <em>MAIS CLAREZA.</em>
            </h1>
            <p class="ef-description">
                Um novo jeito de explorar editais.
                Processe documentos, converse com a
                inteligência artificial e encontre
                informações com referências ao PDF.
            </p>
        </section>
        <div class="ef-rule">
            <span>PDF / MONGODB / RAG / GEMINI</span>
            <span>EXPLORE O DOCUMENTO ↓</span>
        </div>
        """,
        unsafe_allow_html=True,
    )


def titulo_secao(titulo, descricao=""):
    titulo = html.escape(str(titulo))
    descricao = html.escape(str(descricao))

    st.markdown(
        f"""
        <h2 class="ef-heading">{titulo}</h2>
        <p class="ef-section-lead">{descricao}</p>
        """,
        unsafe_allow_html=True,
    )


def etapa(numero, titulo, descricao):
    numero = html.escape(str(numero))
    titulo = html.escape(str(titulo))
    descricao = html.escape(str(descricao))

    st.markdown(
        f"""
        <div class="ef-step">
            <div class="ef-step-number">{numero}</div>
            <div class="ef-step-title">{titulo}</div>
            <div class="ef-step-text">{descricao}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def rodape():
    st.markdown(
        """
        <footer class="ef-footer">
            EDITAL FÁCIL — PYTHON · MONGODB ATLAS · RAG · GEMINI
            <p>As informações devem ser conferidas nos editais oficiais.</p>
        </footer>
        """,
        unsafe_allow_html=True,
    )
