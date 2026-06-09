# Neuro

**Multimodal Chest X-Ray Analysis with Explainable AI, Disease Localization, and Risk Scoring**

![Status](https://img.shields.io/badge/Status-Deployed-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![PyTorch](https://img.shields.io/badge/AI-PyTorch_&_YOLOv8-EE4C2C?style=for-the-badge&logo=pytorch)
![Supabase](https://img.shields.io/badge/Auth-Supabase-3ECF8E?style=for-the-badge&logo=supabase)

Neuro is a full-stack medical AI web application designed to analyze chest X-ray images, provide multi-label disease classification, and generate high-resolution localizations using a custom dual-model architecture.

## Live Deployment

- **Website**: Deployed on [Vercel](https://neurochest.vercel.app/)
- **CI/CD**: Fully automated via GitHub Actions

## Key Features

- **Multi-Label Classification**: Accurately detects 14 distinct chest conditions + "No Finding".
- **Explainable AI**: Generates GradCAM attention heatmaps overlaid on the original image, ensuring full transparency in the model's decision-making process.
- **Precise Localization**: Utilizes a fine-tuned YOLOv8s model to draw precise bounding boxes for detected abnormalities.
- **Risk Assessment System**: Automatically categorizes clinical findings into actionable risk levels (CRITICAL, HIGH, MEDIUM, LOW, NORMAL).
- **Clinical Reference Archive**: A built-in sample gallery of pre-loaded medical X-rays allowing users to test the inference engine instantly without uploading files.
- **Advanced Diagnostic UI**: A three-way interactive view mode allowing the user to toggle between the **Raw Image**, **Heatmap (GradCAM)**, and **Detection (YOLOv8)** views.

## The AI Architecture (Dual-Model Pipeline)

Neuro uses a highly specialized pipeline to maximize both broad classification accuracy and pixel-level localization precision.

### 1. Classification & Heatmaps: Custom DenseNet-121

- **Architecture**: A modified DenseNet-121. We replaced the standard classification head with a **Dual Pooling Head**, concatenating Global Average Pooling (GAP) and Global Max Pooling (GMP). This provides a rich 2048-dimensional feature vector capable of capturing both widespread patterns and highly localized anomalies.
- **Classes**: 14 distinct conditions (Atelectasis, Cardiomegaly, Effusion, Infiltration, Mass, Nodule, Pneumonia, Pneumothorax, Consolidation, Edema, Emphysema, Fibrosis, Pleural Thickening, Hernia) + "No Finding".

- **Grad-CAM Visualization**: Applied Grad-CAM to generate heatmaps highlighting the regions of chest X-rays that most influenced the model's predictions, improving interpretability and providing visual insights into the decision-making process.

- **Benchmarks**: Achieves a mean validation AUC of **0.7933** (performing at **94%** of the original CheXNet research model's **0.84**), demonstrating robust, well-calibrated multi-label classification performance.

### 2. High-Resolution Detection: YOLOv8s

- **Role**: While GradCAM provides the general area of attention, YOLOv8s draws crisp, precise bounding rectangles.
- **Benchmarks**: Our YOLOv8s model achieves highly competitive results against published Faster R-CNN baselines while running at a fraction of the computational cost:
  - **Mean mAP50**: **0.412** (**91.5%** relative performance vs. baseline's **0.450**)
  - **Mean Recall (@0.1 FP/img)**: **0.436** (**93.3%** relative performance vs. baseline's **0.467**)

### 3. Pipeline Integration: How They Work Together

The models don't just run in parallel; they inform each other to reduce false positives.

1. **Initial Classification**: The X-ray is fed into DenseNet. Conditions exceeding their specific, individually tuned probability thresholds are flagged as "Positive."
2. **Overlap Gatekeeping**: The backend checks these positive conditions against the **10 Overlap Classes** (Atelectasis, Cardiomegaly, Consolidation, Effusion, Emphysema, Fibrosis, Mass, Nodule, Pleural Thickening, Pneumothorax).
3. **Targeted Bounding**: YOLOv8 is only invoked to draw bounding boxes for the positive conditions identified by DenseNet. DenseNet acts as the high-accuracy gatekeeper, preventing YOLO from hallucinating boxes for conditions the patient doesn't actually have.

## Tech Stack

**Frontend:**

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Supabase (Authentication)
- GSAP (Animations)

**Backend:**

- FastAPI
- PyTorch (DenseNet Custom Architecture)
- Ultralytics (YOLOv8)
- OpenCV / Pillow (Image Processing)
