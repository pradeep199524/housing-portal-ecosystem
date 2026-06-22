# Housing Price Prediction Model API

A production-ready machine learning inference API built with FastAPI and Scikit-Learn to predict housing prices. The entire ecosystem is containerized using Docker for seamless local deployment and interview demonstration.

## 🚀 Features
* **ML Inference Engine (`/predict`)**: Handles both single property JSON objects and full batch array structures simultaneously.
* **Model Diagnostics (`/model-info`)**: Returns real-time trained coefficients, intercept, and evaluation metrics ($R^2$, $RMSE$) computed directly from the provided training Excel sheet.
* **System Utility (`/health`)**: Lightweight monitoring health check.

## 🛠️ Tech Stack
* **Language**: Python 3.12+
* **Framework**: FastAPI (ASGI)
* **ML Runtime**: Scikit-Learn (Linear Regression), Pandas, NumPy
* **Containerization**: Docker & Docker Compose

## 📦 Local Installation & Deployment

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone <your-github-repo-url>
   cd housing-api