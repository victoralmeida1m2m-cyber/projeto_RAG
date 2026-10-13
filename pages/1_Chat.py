
import streamlit as st

from services.database import conectar_mongodb
from services.rag import responder_pergunta


# ==========================================
# CONFIGURAÇÃO
# ==========================================

st.set_page_config(
    page_title="Chat | Edital Fácil",
    page_icon="💬",
    layout="wide"
)

st.title("💬 Chat com o Edital")
st.caption(
    "Faça perguntas e consulte as fontes originais."
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

except Exception:
    st.error(
        "Não foi possível conectar ao MongoDB Atlas."
    )
    st.stop()


# ==========================================
# SELECIONAR EDITAL
# ==========================================

documentos = list(
    banco.documentos.find(
        {"status": "concluido"},
        {
            "_id": 0,
            "documento_id": 1,
            "nome_arquivo": 1,
            "concurso": 1,
            "cargo": 1
        }
    ).sort("criado_em", -1)
)

if not documentos:
    st.warning(
        "Nenhum edital processado foi encontrado. "
        "Envie um PDF na página principal."
    )
    st.stop()


opcoes = {
    documento["documento_id"]: documento
    for documento in documentos
}

documento_id = st.selectbox(
    "Escolha o edital para consultar",
    options=list(opcoes.keys()),
    format_func=lambda id: (
        f"{opcoes[id].get('concurso', 'Concurso')} — "
        f"{opcoes[id].get('cargo', 'Cargo')} — "
        f"{opcoes[id].get('nome_arquivo', 'PDF')}"
    )
)


# ==========================================
# HISTÓRICO DA CONVERSA
# ==========================================

if "historico_chat" not in st.session_state:
    st.session_state.historico_chat = []

if "documento_chat" not in st.session_state:
    st.session_state.documento_chat = documento_id

# Limpa a conversa ao mudar de edital
if st.session_state.documento_chat != documento_id:
    st.session_state.historico_chat = []
    st.session_state.documento_chat = documento_id


for mensagem in st.session_state.historico_chat:

    with st.chat_message(mensagem["papel"]):

        st.markdown(mensagem["conteudo"])

        if mensagem.get("fontes"):

            with st.expander("📖 Fontes consultadas"):

                for numero, fonte in enumerate(
                    mensagem["fontes"],
                    start=1
                ):

                    st.markdown(
                        f"**Fonte [{numero}] — "
                        f"Página PDF {fonte['pagina_pdf']}**"
                    )

                    st.write(fonte["texto"])

                    st.divider()


# ==========================================
# ENVIAR UMA PERGUNTA
# ==========================================

pergunta = st.chat_input(
    "Ex.: Quais são os requisitos do cargo?"
)

if pergunta:

    st.session_state.historico_chat.append({
        "papel": "user",
        "conteudo": pergunta
    })

    with st.chat_message("user"):
        st.markdown(pergunta)

    with st.chat_message("assistant"):

        with st.spinner(
            "Consultando o edital e gerando resposta..."
        ):

            try:
                resultado = responder_pergunta(
                    banco=banco,
                    pergunta=pergunta,
                    documento_id=documento_id
                )

            except Exception as erro:
                st.error("Erro ao gerar resposta.")
                st.write("Tipo:", type(erro).__name__)
                st.write("Detalhes:", str(erro))
                st.stop()
                

        st.markdown(resultado["resposta"])

        if resultado["fontes"]:

            with st.expander("📖 Fontes consultadas"):

                for numero, fonte in enumerate(
                    resultado["fontes"],
                    start=1
                ):

                    st.markdown(
                        f"**Fonte [{numero}] — "
                        f"Página PDF {fonte['pagina_pdf']}**"
                    )

                    st.write(fonte["texto"])

                    st.divider()

    st.session_state.historico_chat.append({
        "papel": "assistant",
        "conteudo": resultado["resposta"],
        "fontes": resultado["fontes"]
    })
