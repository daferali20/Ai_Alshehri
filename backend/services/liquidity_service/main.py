# backend/services/liquidity_service/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
import json
import redis
from typing import Dict, List
from datetime import datetime
import numpy as np

from .data_processor import DataProcessor
from .config import settings

app = FastAPI(title="Liquidity Service", version="1.0.0")

# Redis client for real-time data
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    decode_responses=True
)

# Active WebSocket connections
active_connections: Dict[str, List[WebSocket]] = {}

class LiquidityAnalyzer:
    def __init__(self):
        self.data_processor = DataProcessor()
        self.order_book_cache = {}
    
    async def analyze_liquidity(self, symbol: str, level2_data: Dict):
        """Analyze liquidity using Level 2 & Level 3 data"""
        try:
            # Calculate spread
            best_bid = level2_data.get("best_bid", 0)
            best_ask = level2_data.get("best_ask", 0)
            spread = best_ask - best_bid
            spread_percent = (spread / best_bid) * 100 if best_bid > 0 else 0
            
            # Calculate depth at each price level
            bid_depth = self.calculate_depth(level2_data.get("bids", []))
            ask_depth = self.calculate_depth(level2_data.get("asks", []))
            
            # Calculate order book imbalance
            bid_volume = sum(bid["volume"] for bid in level2_data.get("bids", [])[:5])
            ask_volume = sum(ask["volume"] for ask in level2_data.get("asks", [])[:5])
            imbalance = (bid_volume - ask_volume) / (bid_volume + ask_volume) if (bid_volume + ask_volume) > 0 else 0
            
            # Calculate market impact estimate
            market_impact = self.estimate_market_impact(
                bid_depth,
                ask_depth,
                level2_data.get("trade_volume", 0)
            )
            
            # Store in Redis for real-time access
            cache_key = f"liquidity:{symbol}"
            liquidity_data = {
                "symbol": symbol,
                "spread": round(spread, 4),
                "spread_percent": round(spread_percent, 4),
                "bid_depth": bid_depth,
                "ask_depth": ask_depth,
                "imbalance": round(imbalance, 4),
                "market_impact": round(market_impact, 4),
                "best_bid": best_bid,
                "best_ask": best_ask,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            redis_client.setex(cache_key, 5, json.dumps(liquidity_data))
            
            # Store historical data in TimescaleDB
            await self.store_historical_liquidity(liquidity_data)
            
            return liquidity_data
            
        except Exception as e:
            print(f"Error analyzing liquidity: {e}")
            return None
    
    def calculate_depth(self, levels: List[Dict], max_levels: int = 10) -> float:
        """Calculate cumulative depth at top N levels"""
        total_volume = sum(level["volume"] for level in levels[:max_levels])
        return total_volume
    
    def estimate_market_impact(self, bid_depth: float, ask_depth: float, trade_volume: float) -> float:
        """Estimate market impact of a trade"""
        if trade_volume == 0:
            return 0.0
        
        total_depth = bid_depth + ask_depth
        if total_depth == 0:
            return 1.0
        
        impact = trade_volume / total_depth
        return min(impact, 1.0)

liquidity_analyzer = LiquidityAnalyzer()

@app.websocket("/ws/liquidity")
async def websocket_liquidity(websocket: WebSocket):
    await websocket.accept()
    symbol = None
    
    try:
        # Subscribe to liquidity updates
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("action") == "subscribe":
                symbol = message.get("symbol")
                if symbol not in active_connections:
                    active_connections[symbol] = []
                active_connections[symbol].append(websocket)
                
                # Send initial data
                liquidity_data = redis_client.get(f"liquidity:{symbol}")
                if liquidity_data:
                    await websocket.send_text(liquidity_data)
            
            elif message.get("action") == "unsubscribe":
                if symbol and symbol in active_connections:
                    active_connections[symbol].remove(websocket)
                    if not active_connections[symbol]:
                        del active_connections[symbol]
                break
                
    except WebSocketDisconnect:
        if symbol and symbol in active_connections:
            active_connections[symbol].remove(websocket)
            if not active_connections[symbol]:
                del active_connections[symbol]

@app.get("/api/v1/liquidity/{symbol}")
async def get_liquidity(symbol: str):
    """Get real-time liquidity data for a symbol"""
    liquidity_data = redis_client.get(f"liquidity:{symbol}")
    if not liquidity_data:
        raise HTTPException(status_code=404, detail="Liquidity data not available")
    return json.loads(liquidity_data)

@app.get("/api/v1/liquidity/historical/{symbol}")
async def get_historical_liquidity(
    symbol: str,
    start_time: str,
    end_time: str,
    db: Session = Depends(get_db)
):
    """Get historical liquidity data from TimescaleDB"""
    query = """
    SELECT * FROM liquidity_metrics 
    WHERE symbol = :symbol 
    AND timestamp BETWEEN :start_time AND :end_time
    ORDER BY timestamp DESC
    """
    
    result = await db.execute(
        query,
        {"symbol": symbol, "start_time": start_time, "end_time": end_time}
    )
    
    return result.fetchall()
