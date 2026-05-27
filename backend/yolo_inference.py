import cv2
import numpy as np
from .utils import pil_to_numpy, numpy_to_b64, normalize_label
from .densenet_inference import CONDITION_COLORS_RGB

def run_yolo_inference(yolo_model, original_img_pil, positive_conditions, id_to_class, overlap_classes, conf=0.15, iou=0.5):
    """Run YOLO detection filtered by NIH classification results (Section 8)."""
    
    # 1. Determine eligible classes for detection
    normalized_positive = {normalize_label(c) for c in positive_conditions}
    eligible = normalized_positive & overlap_classes

    original_np = pil_to_numpy(original_img_pil)
    img_display = original_np.copy()
    kept_boxes = []

    if not eligible:
        # Return empty results if no overlap classes were confirmed by NIH
        return {
            "boxes_image": numpy_to_b64(img_display),
            "kept_boxes": []
        }

    # 2. Run YOLO Inference
    # YOLO handles resizing internally to 640
    results = yolo_model.predict(
        source=original_img_pil, 
        imgsz=640, 
        conf=conf, 
        iou=iou, 
        verbose=False
    )[0]

    # 3. Filter and Draw Boxes
    for box in results.boxes:
        cid = int(box.cls)
        name = id_to_class[str(cid)]
        conf_score = float(box.conf)
        
        # Only keep boxes if class confirmed by DenseNet (NIH)
        if name not in eligible:
            continue
            
        x1, y1, x2, y2 = [int(v) for v in box.xyxy[0]]
        
        # Color mapping (consistent with GradCAM)
        color_key = name.replace(' ', '_')
        if color_key not in CONDITION_COLORS_RGB:
            color_key = name
            
        color_rgb = CONDITION_COLORS_RGB.get(color_key, (255, 255, 255))
        color_bgr = color_rgb[::-1]
        
        # Draw box
        cv2.rectangle(img_display, (x1, y1), (x2, y2), color_bgr, 3)
        
        # Draw label
        label_text = f"YOLO: {name} {conf_score:.2f}"
        (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(img_display, (x1, max(y1-th-10, 0)), (x1+tw+4, y1), color_bgr, -1)
        cv2.putText(img_display, label_text, (x1+2, max(y1-5, 0)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,0), 2)
        
        kept_boxes.append({
            'class': name, 
            'conf': round(conf_score, 4), 
            'xyxy': [x1, y1, x2, y2]
        })

    return {
        "boxes_image": numpy_to_b64(img_display),
        "kept_boxes": kept_boxes
    }
