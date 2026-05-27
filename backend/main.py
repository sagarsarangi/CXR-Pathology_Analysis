from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# This will hold our loaded models
models_registry = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load all models at startup
    logger.info("Initializing models...")
    try:
        from .model_loader import load_all_models
        models_registry.update(load_all_models())
        logger.info("All models loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load models: {str(e)}")
        # In a real production app, we might want to exit here
    yield
    models_registry.clear()
    logger.info("Models cleared from registry.")

app = FastAPI(title='Chest X-Ray Diagnostic API', lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/health')
def health():
    return {
        "status": "ok", 
        "models_loaded": bool(models_registry),
        "available_classes": models_registry.get('label_columns', [])
    }

@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    if not bool(models_registry):
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    # Validation
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File provided is not an image")

    try:
        from .densenet_inference import run_densenet_inference
        from .yolo_inference import run_yolo_inference
        from .risk_scorer import get_risk_level, get_case_flags
        from .response_builder import build_unified_response
        from .utils import preprocess_image

        # 1. Read and preprocess image
        image_bytes = await file.read()
        img_tensor, original_img_pil = preprocess_image(image_bytes)
        
        # 2. DenseNet Classification & GradCAM
        densenet_results = run_densenet_inference(
            models_registry['densenet'],
            img_tensor,
            original_img_pil,
            models_registry['label_columns'],
            models_registry['prob_thresholds'],
            models_registry['cam_thresholds']
        )
        
        # 3. YOLO Detection (Conditional)
        yolo_results = run_yolo_inference(
            models_registry['yolo'],
            original_img_pil,
            densenet_results['positive_conditions'],
            models_registry['id_to_class'],
            models_registry['overlap_classes'],
            models_registry['yolo_conf'],
            models_registry['yolo_iou']
        )
        
        # 4. Risk and Case Flags
        risk_level = get_risk_level(densenet_results['positive_conditions'])
        case_flags = get_case_flags(densenet_results['positive_conditions'], yolo_results['kept_boxes'])
        
        # 5. Build Final Response
        response = build_unified_response(
            densenet_results,
            yolo_results,
            risk_level,
            case_flags,
            models_registry['mean_test_auc'],
            models_registry['prob_thresholds']
        )
        
        return response

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
