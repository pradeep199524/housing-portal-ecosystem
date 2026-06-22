from pydantic import BaseModel, Field
from typing import List

class HousingFeatures(BaseModel):
    square_footage: float = Field(..., description="Total square footage of the house", example=1550.0)
    bedrooms: int = Field(..., description="Number of bedrooms", example=3)
    bathrooms: float = Field(..., description="Number of bathrooms", example=2.0)
    year_built: int = Field(..., description="The year the house was built", example=1997)
    lot_size: float = Field(..., description="Total lot size square footage", example=6800.0)
    distance_to_city_center: float = Field(..., description="Distance to city center", example=4.1)
    school_rating: float = Field(..., description="Local school rating score", example=7.6)

class PredictionOutput(BaseModel):
    predicted_price: float = Field(..., description="Predicted house price value")

class BatchPredictionOutput(BaseModel):
    predictions: List[float] = Field(..., description="List of predicted house prices")

class ModelInfoOutput(BaseModel):
    model_type: str
    features: List[str]
    coefficients: List[float]
    intercept: float
    metrics: dict