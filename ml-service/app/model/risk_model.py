from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


class RiskModel:
    def __init__(self):
        self.pipeline = Pipeline(
            steps=[
                ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
                ("clf", LogisticRegression()),
            ]
        )
        self.classes_ = ["Bajo", "Medio", "Alto"]

    def predict(self, title: str, description: str, price: float, seller_reputation: float, images_count: int):
        text = f"{title} {description}"
        if price < 0 or seller_reputation < 0 or images_count < 0:
            return {"risk_level": "Alto", "ml_summary": "Datos inválidos en la publicación."}
        # Placeholder: el modelo real se reentrena con datos históricos
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
