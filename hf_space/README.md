---
title: CheXVision Backend
emoji: 🫁
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
short_description: FastAPI backend for chest X-ray analysis (DenseNet + YOLOv8)
---

# CheXVision — Backend API

FastAPI backend for the CheXVision multimodal chest X-ray analysis system.

## Endpoints

- `GET /health` — Check model load status
- `POST /predict` — Accepts a chest X-ray image, returns classifications, GradCAM heatmaps, and YOLOv8 bounding boxes

## Models

- **DenseNet-121 Custom** (dual-pooling head) — 15-class NIH chest X-ray classification
- **YOLOv8s** — 13-class bounding box detection (ChestX-Det dataset, imgsz=800)
