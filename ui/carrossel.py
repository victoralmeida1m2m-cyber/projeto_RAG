"""Ponte entre o componente JS original e o Streamlit."""
from pathlib import Path
import streamlit.components.v1 as components

_FRONTEND = Path(__file__).resolve().parent / "carrossel_frontend"
_carrossel = components.declare_component(
    "edital_facil_carrossel", path=str(_FRONTEND)
)


def exibir_carrossel(items: list[dict], key: str = "biblioteca") -> dict | None:
    """Retorna {'id': ..., 'event_token': ...} após clicar em Consultar edital."""
    return _carrossel(items=items, key=key, default=None)
