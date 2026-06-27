from typing import Dict, List


def compute_marketplace_prices() -> Dict[str, List[float]]:
    """
    Calcula precios por categoría/hardware_type a partir de listings existentes.
    Retorna diccionario: clave normalizada -> lista de precios.
    """
    try:
        from apps.listings.models import Listing
    except Exception:
        return {}

    prices: Dict[str, List[float]] = {}
    qs = Listing.objects.all().only("price", "category__slug", "hardware_type")
    for listing in qs.iterator():
        category = ""
        hardware_type = ""
        try:
            category = (listing.category.slug or "").strip().lower()
        except Exception:
            pass
        hardware_type = (listing.hardware_type or "").strip().lower()

        key = category or hardware_type
        if not key:
            continue

        try:
            price = float(listing.price or 0)
        except Exception:
            continue

        prices.setdefault(key, []).append(price)

    return prices
