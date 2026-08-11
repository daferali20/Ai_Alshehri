# backend/services/ai_engine/main.py
from fastapi import FastAPI, HTTPException
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.ensemble import RandomForestClassifier
import joblib
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import aiohttp
import asyncio

from .models.lstm_model import LSTMModel
from .models.transformer import TransformerModel
from .feature_engineering import FeatureEngineer
from .config import settings

app = FastAPI(title="AI Engine Service", version="1.0.0")

class AIEngine:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load models
        self.lstm_model = self.load_lstm_model()
        self.transformer_model = self.load_transformer_model()
        self.rf_model = self.load_random_forest_model()
        self.xgboost_model = self.load_xgboost_model()
        
        self.feature_engineer = FeatureEngineer()
        self.model_cache = {}
        
    def load_lstm_model(self):
        """Load LSTM model for time series analysis"""
        model = LSTMModel(
            input_size=50,
            hidden_size=128,
            num_layers=2,
            output_size=1
        )
        model.load_state_dict(torch.load(
            settings.LSTM_MODEL_PATH,
            map_location=self.device
        ))
        model.eval()
        return model.to(self.device)
    
    def load_transformer_model(self):
        """Load Transformer model for sequence prediction"""
        model = TransformerModel(
            input_dim=50,
            d_model=128,
            nhead=8,
            num_encoder_layers=3,
            num_decoder_layers=3,
            dim_feedforward=512,
            output_dim=1
        )
        model.load_state_dict(torch.load(
            settings.TRANSFORMER_MODEL_PATH,
            map_location=self.device
        ))
        model.eval()
        return model.to(self.device)
    
    def load_random_forest_model(self):
        """Load Random Forest model for classification"""
        return joblib.load(settings.RF_MODEL_PATH)
    
    def load_xgboost_model(self):
        """Load XGBoost model for classification"""
        import xgboost as xgb
        model = xgb.XGBClassifier()
        model.load_model(settings.XGBOOST_MODEL_PATH)
        return model
    
    async def generate_signal(self, symbol: str) -> Dict:
        """Generate trading signal using ensemble of models"""
        try:
            # Fetch market data
            market_data = await self.fetch_market_data(symbol)
            
            # Fetch sentiment data
            sentiment_data = await self.fetch_sentiment_data(symbol)
            
            # Engineer features
            features = self.feature_engineer.process_data(
                market_data,
                sentiment_data
            )
            
            # Generate predictions from each model
            lstm_prediction = await self.predict_lstm(features)
            transformer_prediction = await self.predict_transformer(features)
            rf_prediction = await self.predict_random_forest(features)
            xgboost_prediction = await self.predict_xgboost(features)
            
            # Ensemble predictions
            ensemble_prediction = self.ensemble_predictions([
                lstm_prediction,
                transformer_prediction,
                rf_prediction,
                xgboost_prediction
            ])
            
            # Calculate confidence
            confidence = self.calculate_confidence([
                lstm_prediction,
                transformer_prediction,
                rf_prediction,
                xgboost_prediction
            ])
            
            # Determine signal type
            signal_type = self.determine_signal_type(
                ensemble_prediction,
                confidence,
                features
            )
            
            # Generate analysis explanation
            analysis = self.generate_analysis(
                signal_type,
                confidence,
                features,
                market_data
            )
            
            return {
                "symbol": symbol,
                "type": signal_type,
                "confidence": round(confidence * 100, 2),
                "prediction": round(ensemble_prediction, 4),
                "analysis": analysis,
                "timestamp": datetime.utcnow().isoformat(),
                "current_price": market_data.get("last_price", 0),
                "recommended_quantity": self.calculate_position_size(
                    confidence,
                    market_data.get("last_price", 0)
                )
            }
            
        except Exception as e:
            print(f"Error generating signal: {e}")
            raise HTTPException(status_code=500, detail="Signal generation failed")
    
    async def predict_lstm(self, features: np.ndarray) -> float:
        """Make prediction using LSTM model"""
        with torch.no_grad():
            tensor_input = torch.FloatTensor(features).unsqueeze(0).to(self.device)
            prediction = self.lstm_model(tensor_input)
            return prediction.cpu().numpy()[0][0]
    
    async def predict_transformer(self, features: np.ndarray) -> float:
        """Make prediction using Transformer model"""
        with torch.no_grad():
            tensor_input = torch.FloatTensor(features).unsqueeze(0).to(self.device)
            prediction = self.transformer_model(tensor_input)
            return prediction.cpu().numpy()[0][0]
    
    async def predict_random_forest(self, features: np.ndarray) -> float:
        """Make prediction using Random Forest model"""
        prediction = self.rf_model.predict(features.reshape(1, -1))
        return float(prediction[0])
    
    async def predict_xgboost(self, features: np.ndarray) -> float:
        """Make prediction using XGBoost model"""
        import xgboost as xgb
        prediction = self.xgboost_model.predict(features.reshape(1, -1))
        return float(prediction[0])
    
    def ensemble_predictions(self, predictions: List[float]) -> float:
        """Combine predictions from multiple models"""
        # Weighted average with more weight on deep learning models
        weights = [0.3, 0.3, 0.2, 0.2]  # LSTM, Transformer, RF, XGBoost
        return sum(p * w for p, w in zip(predictions, weights))
    
    def calculate_confidence(self, predictions: List[float]) -> float:
        """Calculate confidence level based on prediction agreement"""
        # Calculate standard deviation of predictions
        mean = np.mean(predictions)
        std = np.std(predictions)
        
        # Higher confidence when predictions are close together
        confidence = 1.0 - (std / (abs(mean) + 1e-6))
        return max(0.0, min(1.0, confidence))
    
    def determine_signal_type(self, prediction: float, confidence: float, features: np.ndarray) -> str:
        """Determine signal type (BUY/SELL/HOLD) based on prediction and confidence"""
        if confidence < 0.5:
            return "HOLD"
        
        if prediction > 0.3:
            return "BUY"
        elif prediction < -0.3:
            return "SELL"
        else:
            return "HOLD"
    
    def generate_analysis(self, signal_type: str, confidence: float, features: np.ndarray, market_data: Dict) -> str:
        """Generate human-readable analysis of the signal"""
        analysis_parts = []
        
        # Technical indicators analysis
        rsi = features[0, 10] if features.shape[1] > 10 else None
        if rsi is not None:
            if rsi > 70:
                analysis_parts.append("Overbought conditions (RSI > 70)")
            elif rsi < 30:
                analysis_parts.append("Oversold conditions (RSI < 30)")
        
        # Moving average analysis
        ma_50 = features[0, 8] if features.shape[1] > 8 else None
        ma_200 = features[0, 9] if features.shape[1] > 9 else None
        if ma_50 is not None and ma_200 is not None:
            if ma_50 > ma_200:
                analysis_parts.append("Golden cross (50MA > 200MA)")
            else:
                analysis_parts.append("Death cross (50MA < 200MA)")
        
        # Sentiment analysis
        sentiment = features[0, 15] if features.shape[1] > 15 else None
        if sentiment is not None:
            if sentiment > 0.5:
                analysis_parts.append("Positive market sentiment")
            elif sentiment < -0.5:
                analysis_parts.append("Negative market sentiment")
        
        # Volume analysis
        volume = market_data.get("volume", 0)
        avg_volume = market_data.get("average_volume", 1)
        if volume > avg_volume * 1.5:
            analysis_parts.append("High volume (50% above average)")
        
        analysis_text = f"Signal: {signal_type} with {confidence:.1%} confidence. "
        analysis_text += "Key factors: " + ", ".join(analysis_parts) if analysis_parts else "No clear pattern"
        
        return analysis_text
    
    def calculate_position_size(self, confidence: float, price: float) -> int:
        """Calculate recommended position size based on confidence and risk management"""
        # Base position size
        base_size = 100
        
        # Adjust based on confidence
        if confidence > 0.8:
            multiplier = 1.5
        elif confidence > 0.6:
            multiplier = 1.0
        else:
            multiplier = 0.5
        
        size = int(base_size * multiplier)
        return size

# Initialize AI engine
ai_engine = AIEngine()

@app.get("/api/v1/ai/signals/{symbol}")
async def get_signal(symbol: str):
    """Get AI trading signal for a symbol"""
    signal = await ai_engine.generate_signal(symbol)
    return signal

@app.post("/api/v1/ai/predict")
async def predict_batch(predictions_request: dict):
    """Generate predictions for multiple symbols"""
    symbols = predictions_request.get("symbols", [])
    results = {}
    
    for symbol in symbols:
        try:
            signal = await ai_engine.generate_signal(symbol)
            results[symbol] = signal
        except Exception as e:
            results[symbol] = {"error": str(e)}
    
    return results

@app.post("/api/v1/ai/train")
async def train_models(training_config: dict):
    """Trigger model retraining"""
    # Implementation for model training
    pass
