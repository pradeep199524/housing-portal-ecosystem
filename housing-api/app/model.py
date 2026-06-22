import os
import pandas as pd
import logging
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge

# Configure basic logging for production monitoring
logging.basicConfig(level=logging.INFO)

class HousingModel:
    def __init__(self, dataset_path: str = "/code/House_Price_Dataset.xlsx"):
        """
        Initializes the model pipeline with Ridge regression.
        The pipeline scales features to ensure statistical consistency.
        """
        self.dataset_path = dataset_path
        self.features = [
            "square_footage", "bedrooms", "bathrooms", 
            "year_built", "lot_size", "distance_to_city_center", "school_rating"
        ]
        self.target = "price"
        
        # Pipeline: Scaling + Regression
        self.model = Pipeline([
            ('scaler', StandardScaler()),
            ('regressor', Ridge(alpha=0.001, positive=True)) 
        ])
        
        self._train_model()

    def _train_model(self):
        """Loads data and trains the model. Raises an error if data is missing."""
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"Dataset not found at {self.dataset_path}")
            
        df = pd.read_excel(self.dataset_path)
        
        X = df[self.features]
        y = df[self.target]
        
        self.model.fit(X, y)
        logging.info("Model training completed successfully.")

    def predict(self, data: list) -> list:
        """
        Performs inference on the provided data.
        'data' must be a list of lists (e.g., [[val1, val2, ...]])
        """
        df_data = pd.DataFrame(data, columns=self.features)
        predictions = self.model.predict(df_data)
        return [round(p, 2) for p in predictions]

    def predict_single(self, feature_values: list) -> float:
        """Helper to predict for a single house input."""
        return self.predict([feature_values])[0]

    def get_model_summary(self):
        """Returns the learned model parameters."""
        regressor = self.model.named_steps['regressor']
        return {
            "model_type": "Ridge_Regression",
            "coefficients": dict(zip(self.features, regressor.coef_)),
            "intercept": regressor.intercept_
        }

# Usage example:
housing_model = HousingModel()
# price = housing_model.predict_single([1750, 4, 2, 1997, 6800, 4.1, 3])