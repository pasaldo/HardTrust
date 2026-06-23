from fastapi import APIRouter
from pydantic import BaseModel
from ..model.risk_model import RiskModel


router = APIRouter()
model = RiskModel()


class PredictRequest(BaseModel):
    title: str
    description: str
    price: float
    seller_reputation: float
    images_count: int


class PredictResponse(BaseModel):
    risk_level: str
    ml_summary: str


@router.post("/", response_model=PredictResponse)
def predict_risk(payload: PredictRequest):
    result = model.predict(
        title=payload.title,
        description=payload.description,
        price=payload.price,
        seller_reputation=payload.seller_reputation,
        images_count=payload.images_count,
    )
    return PredictResponse(**result)
