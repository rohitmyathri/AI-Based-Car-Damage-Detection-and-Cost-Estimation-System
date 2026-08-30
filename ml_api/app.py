from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import torch
from ultralytics import YOLO
from PIL import Image
import io
import os
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
MODEL_PATH = "best_model.pt"
model = None

@app.on_event("startup")
async def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = YOLO(MODEL_PATH)
        print(f"Model loaded. Classes: {model.names}")
    else:
        print("Model file not found!")

@app.get("/")
def root():
    return {"status": "ML Service Running", "model_loaded": model is not None}

@app.get("/health")
def health():
    return {"status": "OK", "model_loaded": model is not None}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"success": False, "error": "Model not loaded"}

    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Save to temp file
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            image.save(tmp.name)
            tmp_path = tmp.name

        # Run inference
        results = model(tmp_path, conf=0.25, verbose=False)
        os.unlink(tmp_path)

        detections = []
        total_area = 0

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                damage_type = model.names[class_id]
                area = (x2 - x1) * (y2 - y1)
                total_area += area

                detections.append({
                    "damageType": damage_type,
                    "confidence": round(confidence * 100, 2),
                    "boundingBox": {
                        "x1": round(x1, 2),
                        "y1": round(y1, 2),
                        "x2": round(x2, 2),
                        "y2": round(y2, 2)
                    },
                    "area": round(area, 2)
                })

        if not detections:
            return {"success": False, "error": "No damage detected in the image."}

        detections.sort(key=lambda x: x["confidence"], reverse=True)
        primary_damage = detections[0]["damageType"]
        avg_confidence = sum(d["confidence"] for d in detections) / len(detections)

        if len(detections) >= 3 or total_area > 50000:
            severity = "Severe"
        elif len(detections) >= 2 or total_area > 20000:
            severity = "Moderate"
        else:
            severity = "Minor"

        return {
            "success": True,
            "damageType": primary_damage,
            "severity": severity,
            "confidence": round(avg_confidence, 2),
            "affectedArea": round(total_area, 2),
            "detections": detections,
            "totalDetections": len(detections),
            "modelSource": "huggingface"
        }

    except Exception as e:
        return {"success": False, "error": str(e)}
