from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="HardTrust ML Service")


class PredictRequest(BaseModel):
    title: str
    description: str
    price: float
    seller_reputation: float
    images_count: int


class PredictResponse(BaseModel):
    risk_level: str
    ml_summary: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict_risk(payload: PredictRequest):
    risk = _evaluate(
        title=payload.title,
        description=payload.description,
        price=payload.price,
        seller_reputation=payload.seller_reputation,
        images_count=payload.images_count,
    )
    return PredictResponse(**risk)


def _evaluate(*, title, description, price, seller_reputation, images_count):
    if price < 0 or seller_reputation < 0 or images_count < 0:
        return {"risk_level": "Alto", "ml_summary": "Datos inválidos en la publicación."}
    if seller_reputation >= 4.0 and images_count >= 2:
        risk = "Bajo"
    elif seller_reputation >= 2.0:
        risk = "Medio"
    else:
        risk = "Alto"
    return {
        "risk_level": risk,
        "ml_summary": f"Evaluación preliminar del listado: riesgo {risk}.",
    }
