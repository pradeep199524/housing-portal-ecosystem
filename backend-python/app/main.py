from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import requests

app = FastAPI(title="App 1: Python Gateway Backend")

# Cross-Origin Resource Sharing configuration for the Next.js UI Portal
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PropertyFormInput(BaseModel):
    square_footage: float = Field(..., gt=0, description="Must be greater than 0")
    bedrooms: int = Field(..., gt=0, lt=20)
    bathrooms: float = Field(..., gt=0, lt=15)
    year_built: int = Field(..., gte=1800, lte=2026)
    lot_size: float = Field(..., gt=0)
    distance_to_city_center: float = Field(..., gte=0)
    school_rating: float = Field(..., gte=0, lte=10)

@app.post("/api/estimate")
def get_housing_estimate(payload: PropertyFormInput):
    # Using our Docker Compose network alias to route directly to Task 1
    ml_engine_url = "http://housing-api:8000/predict"
    
    try:
        response = requests.post(ml_engine_url, json=payload.model_dump())
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="ML Core Engine failed to process metrics.")
        return response.json()
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="ML Prediction Engine service is offline.")