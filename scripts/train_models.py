# scripts/train_models.py
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import joblib
from datetime import datetime, timedelta
import asyncpg
import asyncio

class ModelTrainer:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.scaler = StandardScaler()
        
    async def fetch_training_data(self, symbol: str, start_date: str, end_date: str):
        """Fetch historical data from TimescaleDB"""
        conn = await asyncpg.connect(
            host="localhost",
            port=5432,
            database="trading_db",
            user="user",
            password="password"
        )
        
        query = """
        SELECT * FROM market_data
        WHERE symbol = $1
        AND timestamp BETWEEN $2 AND $3
        ORDER BY timestamp ASC
        """
        
        data = await conn.fetch(query, symbol, start_date, end_date)
        await conn.close()
        
        return pd.DataFrame(data, columns=['timestamp', 'symbol', 'price', 'volume'])
    
    def prepare_features(self, df: pd.DataFrame) -> tuple:
        """Prepare features for model training"""
        # Calculate technical indicators
        df['returns'] = df['price'].pct_change()
        df['sma_20'] = df['price'].rolling(20).mean()
        df['sma_50'] = df['price'].rolling(50).mean()
        df['sma_200'] = df['price'].rolling(200).mean()
        df['rsi'] = self.calculate_rsi(df['price'])
        df['volatility'] = df['returns'].rolling(20).std()
        
        # Create target variable (next day return)
        df['target'] = df['price'].shift(-1) / df['price'] - 1
        df['target_class'] = (df['target'] > 0.01).astype(int)  # 1 for BUY, 0 for SELL
        
        # Drop NaN values
        df = df.dropna()
        
        # Prepare features
        feature_columns = ['returns', 'sma_20', 'sma_50', 'sma_200', 'rsi', 'volatility', 'volume']
        X = df[feature_columns].values
        y = df['target_class'].values
        
        return X, y
    
    def calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """Calculate RSI indicator"""
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def train_random_forest(self, X: np.ndarray, y: np.ndarray) -> RandomForestClassifier:
        """Train Random Forest model"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        # Evaluate model
        score = model.score(X_test, y_test)
        print(f"Random Forest Accuracy: {score:.4f}")
        
        return model
    
    def train_xgboost(self, X: np.ndarray, y: np.ndarray) -> xgb.XGBClassifier:
        """Train XGBoost model"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        model = xgb.XGBClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.01,
            objective='binary:logistic',
            random_state=42
        )
        
        model.fit(X_train, y_train)
        
        # Evaluate model
        score = model.score(X_test, y_test)
        print(f"XGBoost Accuracy: {score:.4f}")
        
        return model
    
    def train_lstm(self, X: np.ndarray, y: np.ndarray) -> nn.Module:
        """Train LSTM model for time series prediction"""
        # Prepare sequences for LSTM
        sequence_length = 60
        X_seq, y_seq = [], []
        
        for i in range(len(X) - sequence_length):
            X_seq.append(X[i:i+sequence_length])
            y_seq.append(y[i+sequence_length])
        
        X_seq = np.array(X_seq)
        y_seq = np.array(y_seq)
        
        # Split data
        train_size = int(0.8 * len(X_seq))
        X_train = torch.FloatTensor(X_seq[:train_size])
        y_train = torch.FloatTensor(y_seq[:train_size])
        X_test = torch.FloatTensor(X_seq[train_size:])
        y_test = torch.FloatTensor(y_seq[train_size:])
        
        # Create data loaders
        train_dataset = TensorDataset(X_train, y_train)
        test_dataset = TensorDataset(X_test, y_test)
        train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
        test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
        
        # Define LSTM model
        class LSTMModel(nn.Module):
            def __init__(self, input_size, hidden_size, num_layers, output_size):
                super().__init__()
                self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
                self.fc = nn.Linear(hidden_size, output_size)
            
            def forward(self, x):
                lstm_out, _ = self.lstm(x)
                return self.fc(lstm_out[:, -1, :])
        
        model = LSTMModel(
            input_size=X.shape[1],
            hidden_size=128,
            num_layers=2,
            output_size=1
        ).to(self.device)
        
        # Train model
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        
        for epoch in range(50):
            model.train()
            for batch_x, batch_y in train_loader:
                batch_x = batch_x.to(self.device)
                batch_y = batch_y.to(self.device)
                
                optimizer.zero_grad()
                output = model(batch_x)
                loss = criterion(output, batch_y.unsqueeze(1))
                loss.backward()
                optimizer.step()
            
            # Evaluate
            model.eval()
            test_loss = 0
            with torch.no_grad():
                for batch_x, batch_y in test_loader:
                    batch_x = batch_x.to(self.device)
                    batch_y = batch_y.to(self.device)
                    output = model(batch_x)
                    test_loss += criterion(output, batch_y.unsqueeze(1)).item()
            
            if epoch % 10 == 0:
                print(f"Epoch {epoch}, Test Loss: {test_loss/len(test_loader):.4f}")
        
        return model
    
    async def train_all_models(self, symbol: str = "AAPL"):
        """Train all models for a given symbol"""
        print(f"Training models for {symbol}...")
        
        # Fetch training data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365*2)  # 2 years of data
        
        df = await self.fetch_training_data(
            symbol,
            start_date.strftime("%Y-%m-%d"),
            end_date.strftime("%Y-%m-%d")
        )
        
        # Prepare features
        X, y = self.prepare_features(df)
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train models
        rf_model = self.train_random_forest(X_scaled, y)
        xgb_model = self.train_xgboost(X_scaled, y)
        lstm_model = self.train_lstm(X_scaled, y)
        
        # Save models
        joblib.dump(rf_model, f"models/{symbol}_rf_model.joblib")
        xgb_model.save_model(f"models/{symbol}_xgb_model.json")
        torch.save(lstm_model.state_dict(), f"models/{symbol}_lstm_model.pth")
        joblib.dump(self.scaler, f"models/{symbol}_scaler.joblib")
        
        print(f"Models saved for {symbol}")
        
        return {
            'symbol': symbol,
            'rf_model': rf_model,
            'xgb_model': xgb_model,
            'lstm_model': lstm_model
        }

# Run training
async def main():
    trainer = ModelTrainer()
    
    # Train for multiple symbols
    symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"]
    
    for symbol in symbols:
        try:
            await trainer.train_all_models(symbol)
        except Exception as e:
            print(f"Error training model for {symbol}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
