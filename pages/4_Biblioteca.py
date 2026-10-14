"""Biblioteca editorial com o carrossel original fornecido pelo usuário."""
import streamlit as st
from services.database import conectar_mongodb
from ui.carrossel import exibir_carrossel

st.set_page_config(page_title="Biblioteca | Edital Fácil", page_icon="◈", layout="wide")

st.markdown("""
<style>
.stApp {background:#0b0c10;color:#f4f4ee}
.block-container {max-width:1150px;padding-top:2rem}
.ef-label {color:#c7ff4d;font:600 12px ui-monospace,monospace;letter-spacing:.22em;text-transform:uppercase}
.ef-title {font-size:clamp(3rem,7vw,6.5rem);line-height:.92;letter-spacing:-.065em;font-weight:850;margin:.8rem 0 1.2rem}
.ef-title em {color:#c7ff4d;font-style:normal}
.ef-summary {font-size:1.1rem;color:#a9adb2;max-width:660px;line-height:1.65}
.ef-rule {border-top:1px solid #33373f;margin:2rem 0}
.ef-foot {color:#848993;font-size:.8rem;letter-spacing:.08em;margin:1rem 0 2rem}
@media(prefers-reduced-motion:no-preference) {
  .ef-title {animation:ef-rise .7s cubic-bezier(.2,.9,.25,1) both}
  .ef-summary {animation:ef-rise .9s .1s both}
  @keyframes ef-rise {from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)}}
}
</style>
<div class="ef-label">EDITAL FÁCIL / BIBLIOTECA INTERATIVA</div>
<div class="ef-title">NAVEGUE.<br><em>DESCUBRA.</em><br>PERGUNTE.</div>
<div class="ef-summary">Uma biblioteca de concursos em movimento. Explore os editais e abra uma conversa contextualizada com as fontes oficiais.</div>
<div class="ef-rule"></div>
""", unsafe_allow_html=True)

@st.cache_resource
def obter_banco():
    return conectar_mongodb()

try:
    cliente, banco = obter_banco()
    cliente.admin.command("ping")
    documentos = list(banco.documentos.find(
        {"status": "concluido"},
        {"_id": 0, "documento_id": 1, "nome_arquivo": 1,
         "concurso": 1, "cargo": 1}
    ).sort("criado_em", -1))
except Exception:
    st.error("Não foi possível consultar os editais no MongoDB.")
    st.stop()

itens = []
for indice, doc in enumerate(documentos):
    doc_id = doc.get("documento_id")
    if not isinstance(doc_id, str) or not doc_id:
        continue
    itens.append({
        "id": doc_id,
        "title": str(doc.get("concurso") or doc.get("nome_arquivo") or "Edital"),
        "subtitle": str(doc.get("cargo") or "Consulte os detalhes no chat"),
        "hue": (195 + indice * 38) % 360,
    })

st.markdown(f"**{len(itens)} editais disponíveis para consulta**")
if not itens:
    st.info("Nenhum edital concluído. Cadastre um PDF na página principal primeiro.")
else:
    escolha = exibir_carrossel(itens)
    if isinstance(escolha, dict):
        doc_id = escolha.get("id")
        token = escolha.get("event_token")
        ids_permitidos = {item["id"] for item in itens}
        if (isinstance(token, str) and token
                and token != st.session_state.get("ultimo_evento_carrossel")
                and doc_id in ids_permitidos):
            st.session_state["ultimo_evento_carrossel"] = token
            st.session_state["edital_selecionado"] = doc_id
            st.switch_page("pages/1_Chat.py")

st.markdown('<div class="ef-foot">SELECIONE UM CARTÃO E CLIQUE EM CONSULTAR EDITAL ↗</div>', unsafe_allow_html=True)
