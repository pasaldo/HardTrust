from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.core.exceptions import ValidationError
from apps.listings.models import Listing
from apps.ml_orchestration.models import ListingRiskEvaluation
from apps.ml_orchestration.services import evaluate_listing
from apps.ml_orchestration.market_analyzer import compute_marketplace_prices
from apps.ml_orchestration.scam_analyzer import analyze_listing


def _listing_to_payload(listing: Listing) -> dict:
    user = getattr(listing, "seller", None)
    reputation = float(getattr(user, "reputation", 0) or 0)
    images = getattr(listing, "images", []) or []
    return {
        "title": getattr(listing, "title", "") or "",
        "description": getattr(listing, "description", "") or "",
        "price": float(getattr(listing, "price", 0) or 0),
        "seller_reputation": reputation,
        "images_count": len(images),
    }


@api_view(["GET"])
@permission_classes([AllowAny])
def listing_risk(request, pk: int):
    evaluation = ListingRiskEvaluation.objects.filter(listing_id=pk).select_related(
        "listing"
    ).first()
    if not evaluation:
        return Response(
            {"detail": "No ListingRiskEvaluation matches the given query."},
            status=404,
        )
    return Response(
        {
            "listing_id": evaluation.listing_id,
            "listing_title": evaluation.listing.title,
            "risk_level": evaluation.get_risk_level_display(),
            "ml_summary": evaluation.ml_summary,
            "evaluated_at": evaluation.evaluated_at.isoformat(),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def predict_risk(request):
    listing_id = request.data.get("listing_id")
    if listing_id:
        try:
            listing = Listing.objects.get(pk=int(listing_id))
        except Listing.DoesNotExist:
            return Response(
                {"detail": "Listing not found."},
                status=404,
            )
        payload = _listing_to_payload(listing)
        payload["category"] = getattr(listing.category, "slug", None) if listing.category else None
        payload["hardware_type"] = getattr(listing, "hardware_type", None)
    else:
        listing = None
        payload = {
            "title": str(request.data.get("title", "")),
            "description": str(request.data.get("description", "")),
            "price": float(request.data.get("price", 0) or 0),
            "seller_reputation": float(request.data.get("seller_reputation", 0) or 0),
            "images_count": int(request.data.get("images_count", 0) or 0),
            "category": request.data.get("category"),
            "hardware_type": request.data.get("hardware_type"),
        }

    marketplace_prices = compute_marketplace_prices()
    payload["marketplace_prices"] = marketplace_prices
    risk_level, ml_summary = evaluate_listing(payload)

    sections = []
    analysis_sections = []
    if listing:
        _, _, analysis_sections = analyze_listing(**payload)

    response_payload = {
        "listing_id": int(listing_id) if listing_id else None,
        "risk_level": risk_level,
        "ml_summary": ml_summary,
        "analysis_sections": analysis_sections,
    }
    return Response(response_payload, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def evaluate_listing_endpoint(request, pk: int):
    try:
        listing = Listing.objects.get(pk=pk)
    except Listing.DoesNotExist:
        return Response({"detail": "Listing not found."}, status=404)

    payload = _listing_to_payload(listing)
    payload["category"] = getattr(listing.category, "slug", None) if listing.category else None
    payload["hardware_type"] = getattr(listing, "hardware_type", None)
    risk_level, ml_summary = evaluate_listing(payload)
    _, _, analysis_sections = analyze_listing(**payload)

    evaluation, _ = ListingRiskEvaluation.objects.update_or_create(
        listing=listing,
        defaults={
            "risk_level": risk_level,
            "ml_summary": ml_summary,
        },
    )
    listing.risk_level = risk_level
    listing.ml_summary = ml_summary
    listing.analysis_message = ml_summary
    listing.analysis_sections = analysis_sections
    if risk_level == "Alto":
        listing.status = "REJECTED_BY_ML"
    else:
        listing.status = "APPROVED_BY_ML"
    listing.save(
        update_fields=[
            "status",
            "risk_level",
            "ml_summary",
            "analysis_message",
            "analysis_sections",
            "updated_at",
        ]
    )

    return Response(
        {
            "listing_id": listing.pk,
            "risk_level": evaluation.get_risk_level_display(),
            "ml_summary": evaluation.ml_summary,
            "analysis_sections": analysis_sections,
            "status": listing.get_status_display(),
            "evaluated_at": evaluation.evaluated_at.isoformat(),
        },
        status=200,
    )
