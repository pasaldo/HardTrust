from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.core.exceptions import ValidationError
from apps.listings.models import Listing
from apps.ml_orchestration.models import ListingRiskEvaluation
from apps.ml_orchestration.services import evaluate_listing


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
    else:
        payload = {
            "title": str(request.data.get("title", "")),
            "description": str(request.data.get("description", "")),
            "price": float(request.data.get("price", 0) or 0),
            "seller_reputation": float(request.data.get("seller_reputation", 0) or 0),
            "images_count": int(request.data.get("images_count", 0) or 0),
        }

    risk_level, ml_summary = evaluate_listing(payload)

    response_payload = {
        "risk_level": risk_level,
        "ml_summary": ml_summary,
    }
    if listing_id:
        response_payload["listing_id"] = int(listing_id)

    return Response(response_payload, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def evaluate_listing_endpoint(request, pk: int):
    try:
        listing = Listing.objects.get(pk=pk)
    except Listing.DoesNotExist:
        return Response({"detail": "Listing not found."}, status=404)

    payload = _listing_to_payload(listing)
    risk_level, ml_summary = evaluate_listing(payload)

    evaluation, _ = ListingRiskEvaluation.objects.update_or_create(
        listing=listing,
        defaults={
            "risk_level": risk_level,
            "ml_summary": ml_summary,
        },
    )
    listing.risk_level = risk_level
    listing.ml_summary = ml_summary
    if risk_level == "Alto":
        listing.status = "REJECTED_BY_ML"
    else:
        listing.status = "APPROVED_BY_ML"
    listing.save(update_fields=["status", "risk_level", "ml_summary", "updated_at"])

    return Response(
        {
            "listing_id": listing.pk,
            "risk_level": evaluation.get_risk_level_display(),
            "ml_summary": evaluation.ml_summary,
            "status": listing.get_status_display(),
            "evaluated_at": evaluation.evaluated_at.isoformat(),
        },
        status=200,
    )
