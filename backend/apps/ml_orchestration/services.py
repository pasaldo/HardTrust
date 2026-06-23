import os
from typing import Dict, Tuple

import requests

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001")
ML_PREDICT_PATH = os.getenv("ML_PREDICT_PATH", "/predict")
ML_REQUEST_TIMEOUT = float(os.getenv("ML_REQUEST_TIMEOUT", "2.0"))


def _call_ml_service(payload: Dict) -> Tuple[str, str]:
    url = f"{ML_SERVICE_URL}{ML_PREDICT_PATH}"
    try:
        response = requests.post(url, json=payload, timeout=ML_REQUEST_TIMEOUT)
        response.raise_for_status()
        result = response.json()
    except Exception as exc:  # pragma: no cover - defensive fallback
        return _fallback_rule_based(payload)

    risk_level = result.get("risk_level", "Alto")
    ml_summary = result.get("ml_summary") or f"Evaluación preliminar: riesgo {risk_level}."
    return str(risk_level), str(ml_summary)


def _fallback_rule_based(payload: Dict) -> Tuple[str, str]:
    price = float(payload.get("price", 0))
    reputation = float(payload.get("seller_reputation", 0))
    images_count = int(payload.get("images_count", 0))

    if price < 0 or reputation < 0 or images_count < 0:
        return "Alto", "Datos inválidos en la publicación."

    if reputation >= 4.0 and images_count >= 2:
        risk = "Bajo"
    elif reputation >= 2.0:
        risk = "Medio"
    else:
        risk = "Alto"

    return risk, f"Evaluación preliminar del listado: riesgo {risk}."


def evaluate_listing(payload: Dict) -> Tuple[str, str]:
    return _call_ml_service(payload)
