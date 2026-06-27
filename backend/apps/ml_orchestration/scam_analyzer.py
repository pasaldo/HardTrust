import json
import math
from typing import Dict, Tuple


def _mean(values):
    if not values:
        return 0.0
    return sum(values) / len(values)


def _std(values):
    if len(values) < 2:
        return 0.0
    mean = _mean(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return math.sqrt(variance)


def analyze_listing(
    *,
    price: float,
    category: str,
    hardware_type: str,
    seller_reputation: float,
    images_count: int,
    marketplace_prices: Dict[str, list],
) -> Tuple[str, str]:
    """
    Analiza un listing y determina si es potencialmente una estafa.
    marketplace_prices: diccionario con clave category/hardware_type -> lista de precios.
    """
    price = max(price, 0.0)
    reputation = max(seller_reputation, 0.0)
    images_count = max(images_count, 0)

    # Estadísticas de referencia
    key = (category or "").strip().lower() or (hardware_type or "").strip().lower()
    ref_prices = marketplace_prices.get(key, [])
    ref_mean = _mean(ref_prices) if ref_prices else price
    ref_std = _std(ref_prices) if ref_prices else 0.0

    messages = []
    signals = []

    # 1) Análisis de precio
    if ref_prices and price > 0:
        deviation = ref_std if ref_std > 0 else max(ref_mean * 0.15, 1.0)
        diff = price - ref_mean
        ratio = diff / deviation if deviation > 0 else 0.0
        if ratio > 2.0:
            pct = round((diff / ref_mean) * 100)
            messages.append(
                f"El precio es un {pct}% superior al promedio del mercado para {key}."
            )
            signals.append("precio_elevado")
        elif ratio < -1.5:
            pct = round(abs(diff / ref_mean) * 100)
            messages.append(
                f"El precio es un {pct}% inferior al promedio del mercado para {key}."
            )
            signals.append("precio_bajo_atipico")
        else:
            messages.append("El precio está dentro del rango de mercado.")
    else:
        messages.append("Sin datos de mercado suficientes para comparar el precio.")

    # 2) Análisis de reputación
    if reputation >= 4.5:
        messages.append("La reputación del vendedor es muy alta.")
        signals.append("reputacion_muy_alta")
    elif reputation <= 0.5:
        messages.append("La reputación del vendedor es muy baja.")
        signals.append("reputacion_muy_baja")
    else:
        messages.append("La reputación del vendedor es moderada.")

    # 3) Análisis de imágenes
    if images_count == 0:
        messages.append("No hay imágenes del producto.")
        signals.append("sin_imagenes")
    elif images_count == 1:
        messages.append("Solo hay una imagen del producto.")
        signals.append("imagen_insuficiente")
    else:
        messages.append("Cantidad de imágenes adecuada.")

    # 4) Clasificación final
    scam_signals = sum(
        1
        for s in signals
        if s in {"precio_elevado", "reputacion_muy_baja", "sin_imagenes", "imagen_insuficiente"}
    )
    if scam_signals >= 2:
        risk = "Alto"
    elif scam_signals == 1:
        risk = "Medio"
    else:
        risk = "Bajo"

    recommendation = (
        "Posibles indicios de estafa. Se recomienda extremar precauciones."
        if risk == "Alto"
        else (
            "Existen factores de riesgo. Proceder con cautela."
            if risk == "Medio"
            else "La publicación parece legítima."
        )
    )

    sections = [
        {
            "title": "Precio",
            "items": [m for m in messages if "precio" in m.lower() or "mercado" in m.lower()],
        },
        {
            "title": "Reputación",
            "items": [m for m in messages if "reputación" in m.lower() or "reputacion" in m.lower()],
        },
        {
            "title": "Imágenes",
            "items": [m for m in messages if "imágen" in m.lower() or "imagen" in m.lower() or "Cantidad de imágenes" in m],
        },
        {
            "title": "Recomendaciones",
            "items": [recommendation],
        },
    ]
    # Avoid empty sections; fallback to raw messages
    if any(len(sec.get("items", [])) == 0 for sec in sections):
        summary = "Análisis de seguridad: " + ". ".join(messages)
    else:
        summary = "Análisis de seguridad: " + ". ".join(
            item for sec in sections for item in sec.get("items", [])
        )

    sections_payload = [
        {"title": sec["title"], "content": ". ".join(sec["items"])}
        for sec in sections
        if sec.get("items")
    ]
    return risk, summary, sections_payload
