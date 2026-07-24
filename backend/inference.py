import httpx
from config import settings


def detect_animal(image_path: str) -> dict:
    """
    Detect wildlife using the Roboflow API.
    """

    if not settings.roboflow_api_key:
        return {
            "detected": False,
            "animal": None,
            "confidence": 0,
            "raw": "Roboflow API key not configured",
        }

    try:
        with open(image_path, "rb") as image_file:
            response = httpx.post(
                f"https://detect.roboflow.com/{settings.roboflow_model_id}",
                params={
                    "api_key": settings.roboflow_api_key,
                },
                files={
                    "file": image_file,
                },
                timeout=60,
            )

        response.raise_for_status()

        result = response.json()
        predictions = result.get("predictions", [])

        if not predictions:
            return {
                "detected": False,
                "animal": None,
                "confidence": 0,
                "raw": result,
            }

        best_prediction = max(
            predictions,
            key=lambda prediction: prediction.get("confidence", 0),
        )

        return {
            "detected": True,
            "animal": best_prediction.get("class", "Unknown"),
            "confidence": round(
                best_prediction.get("confidence", 0),
                4,
            ),
            "raw": result,
        }

    except Exception as error:
        print(f"Roboflow inference error: {error}")

        return {
            "detected": False,
            "animal": None,
            "confidence": 0,
            "raw": str(error),
        }