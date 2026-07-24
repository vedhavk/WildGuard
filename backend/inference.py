from inference_sdk import InferenceHTTPClient
from config import settings

# Initialize the Roboflow inference client
CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=settings.roboflow_api_key,
)


def detect_animal(image_path: str) -> dict:
    """
    Run wild animal inference on an image using the Roboflow model.

    Args:
        image_path: Absolute path to the image file on disk.

    Returns:
        dict with keys:
            - detected (bool): Whether a wild animal was found
            - animal (str | None): Name/class of the detected animal
            - confidence (float): Confidence score (0–1)
            - raw (dict): Full Roboflow response for debugging
    """
    if not settings.roboflow_api_key:
        print("Roboflow API key is not configured")
        return {"detected": False, "animal": None, "confidence": 0, "raw": "API key not configured"}

    try:
        result = CLIENT.infer(image_path, model_id=settings.roboflow_model_id)
    except Exception as e:
        print(f"Inference error: {e}")
        return {"detected": False, "animal": None, "confidence": 0, "raw": str(e)}

    # The inference SDK may return a dict or an object with attributes.
    # Handle both cases gracefully.
    predictions = None

    if isinstance(result, dict):
        predictions = result.get("predictions", [])
    elif hasattr(result, "predictions"):
        # Some SDK versions return an object with a predictions attribute
        preds = result.predictions
        if preds is not None:
            # Convert prediction objects to dicts if needed
            predictions = []
            for p in preds:
                if isinstance(p, dict):
                    predictions.append(p)
                elif hasattr(p, "__dict__"):
                    pred_dict = {}
                    pred_dict["class"] = getattr(p, "class_name", None) or getattr(p, "class_id", "Unknown")
                    pred_dict["confidence"] = getattr(p, "confidence", 0)
                    predictions.append(pred_dict)
                else:
                    predictions.append({"class": str(p), "confidence": 0})
    else:
        # Try to convert to dict as a fallback
        try:
            if hasattr(result, "dict"):
                result_dict = result.dict()
            elif hasattr(result, "model_dump"):
                result_dict = result.model_dump()
            elif hasattr(result, "__dict__"):
                result_dict = result.__dict__
            else:
                result_dict = {"raw_result": str(result)}
            predictions = result_dict.get("predictions", [])
        except Exception as conv_err:
            print(f"Could not parse inference result: {conv_err}")
            print(f"Result type: {type(result)}, value: {result}")
            return {"detected": False, "animal": None, "confidence": 0, "raw": str(result)}

    if not predictions:
        raw_for_debug = result if isinstance(result, dict) else str(result)
        return {"detected": False, "animal": None, "confidence": 0, "raw": raw_for_debug}

    # Get the highest-confidence prediction
    best = max(predictions, key=lambda p: p.get("confidence", 0) if isinstance(p, dict) else getattr(p, "confidence", 0))

    if isinstance(best, dict):
        animal_class = best.get("class", "Unknown")
        confidence = best.get("confidence", 0)
    else:
        animal_class = getattr(best, "class_name", None) or getattr(best, "class_id", "Unknown")
        confidence = getattr(best, "confidence", 0)

    return {
        "detected": True,
        "animal": animal_class,
        "confidence": round(confidence, 4),
        "raw": result if isinstance(result, dict) else str(result),
    }
