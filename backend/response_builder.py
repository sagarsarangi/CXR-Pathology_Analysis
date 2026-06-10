from .risk_scorer import RISK_MAP
from .utils import numpy_to_b64, pil_to_numpy, normalize_label

def build_unified_response(densenet_results, yolo_results, risk_level, case_flags, prob_thresholds, overlap_classes):
    """Assemble final JSON response for frontend (Section 11)."""
    
    # 1. Confirmed Findings (Positive conditions sorted by probability)
    confirmed_findings = []
    for cond in densenet_results['positive_conditions']:
        if cond == "No Finding":
            continue
        
        prob = densenet_results['all_results'][cond]['prob']
        threshold = prob_thresholds.get(cond, 0.5)
        
        # Normalized confidence calculation: (prob - threshold) / (1 - threshold)
        normalized_conf = (prob - threshold) / (1.0 - threshold)
        normalized_conf = max(0.0, min(1.0, normalized_conf)) # Clamp 0-1
        
        confirmed_findings.append({
            "condition": cond,
            "prob": prob,
            "normalized_conf": round(normalized_conf, 4),
            "risk": RISK_MAP.get(cond, "LOW")
        })
    
    # Sort by probability descending
    confirmed_findings.sort(key=lambda x: x['prob'], reverse=True)

    # 2. Localization Type Mapping
    localization_type = {}
    
    for cond in densenet_results['positive_conditions']:
        if cond == "No Finding":
            continue
            
        norm_cond = normalize_label(cond)
        if norm_cond in overlap_classes:
            localization_type[cond] = "boxes_and_heatmap"
        else:
            localization_type[cond] = "heatmap_only"

    # 3. Assemble full response
    response = {
        "status": "success",
        "predictions": densenet_results['all_results'],
        "positive_conditions": densenet_results['positive_conditions'],
        "confirmed_findings": confirmed_findings,
        "risk_level": risk_level,
        "localization_type": localization_type,
        "images": {
            # Heatmaps is a dict {condition: b64}
            # The brief suggests singular 'heatmap_b64', 'boxes_b64', 'combined_b64'
            # But Section 12 implies multiple heatmaps for mixed cases.
            # I will provide the main composite images and the individual heatmaps if needed.
            "original_b64": yolo_results['boxes_image'], # fallback if no boxes
            "heatmap_b64": list(densenet_results['heatmaps'].values())[0] if densenet_results['heatmaps'] else "",
            "boxes_b64": yolo_results['boxes_image'],
            "combined_b64": yolo_results['boxes_image'], # In this simple impl, boxes image is our 'combined' view
            "individual_heatmaps": densenet_results['heatmaps']
        },
        "yolo_boxes": yolo_results['kept_boxes'],
        "case_flags": case_flags,
        "report": None # Deferred as per Section 19
    }
    
    return response
