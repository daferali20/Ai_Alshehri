# backend/data_pipeline/kafka_consumer.py
import asyncio
import json
from aiokafka import AIOKafkaConsumer
import redis
from datetime import datetime
from typing import Dict, Any
import asyncpg
from .config import settings

class DataPipelineConsumer:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True
        )
        self.consumers = {}
        self.db_pool = None
        
    async def initialize(self):
        """Initialize database connection pool"""
        self.db_pool = await asyncpg.create_pool(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            database=settings.POSTGRES_DB,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            min_size=5,
            max_size=20
        )
    
    async def start_consumer(self, topic: str, group_id: str):
        """Start Kafka consumer for a specific topic"""
        consumer = AIOKafkaConsumer(
            topic,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id=group_id,
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        
        await consumer.start()
        self.consumers[topic] = consumer
        
        # Start consuming messages
        asyncio.create_task(self.consume_messages(topic))
    
    async def consume_messages(self, topic: str):
        """Consume messages from a specific topic"""
        consumer = self.consumers.get(topic)
        if not consumer:
            return
        
        try:
            async for msg in consumer:
                await self.process_message(topic, msg.value)
        except Exception as e:
            print(f"Error consuming messages from {topic}: {e}")
            await consumer.stop()
    
    async def process_message(self, topic: str, message: Dict[str, Any]):
        """Process incoming Kafka messages based on topic"""
        if topic == "market_data":
            await self.process_market_data(message)
        elif topic == "liquidity_data":
            await self.process_liquidity_data(message)
        elif topic == "order_events":
            await self.process_order_events(message)
        elif topic == "trade_signals":
            await self.process_trade_signals(message)
    
    async def process_market_data(self, data: Dict[str, Any]):
        """Process real-time market data"""
        symbol = data.get("symbol")
        price = data.get("price")
        volume = data.get("volume")
        
        # Store latest price in Redis
        self.redis_client.setex(f"price:{symbol}", 60, str(price))
        
        # Store in TimescaleDB for historical analysis
        async with self.db_pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO market_data (symbol, price, volume, timestamp)
                VALUES ($1, $2, $3, $4)
                """,
                symbol, price, volume, data.get("timestamp", datetime.utcnow())
            )
    
    async def process_liquidity_data(self, data: Dict[str, Any]):
        """Process liquidity data from order book"""
        symbol = data.get("symbol")
        best_bid = data.get("best_bid")
        best_ask = data.get("best_ask")
        bid_depth = data.get("bid_depth")
        ask_depth = data.get("ask_depth")
        
        # Store in Redis with TTL
        liquidity_data = {
            "symbol": symbol,
            "best_bid": best_bid,
            "best_ask": best_ask,
            "bid_depth": bid_depth,
            "ask_depth": ask_depth,
            "spread": best_ask - best_bid if best_ask and best_bid else 0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.redis_client.setex(
            f"liquidity:{symbol}",
            5,
            json.dumps(liquidity_data)
        )
        
        # Store in TimescaleDB
        async with self.db_pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO liquidity_metrics (symbol, best_bid, best_ask, 
                    bid_depth, ask_depth, spread, timestamp)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                """,
                symbol, best_bid, best_ask, bid_depth, ask_depth,
                best_ask - best_bid if best_ask and best_bid else 0,
                datetime.utcnow()
            )
    
    async def process_order_events(self, data: Dict[str, Any]):
        """Process order execution events"""
        order_id = data.get("order_id")
        status = data.get("status")
        
        # Update Redis cache
        self.redis_client.setex(
            f"order:{order_id}",
            3600,
            json.dumps(data)
        )
        
        # Notify connected WebSocket clients
        await self.notify_clients("order_update", data)
    
    async def process_trade_signals(self, data: Dict[str, Any]):
        """Process AI-generated trade signals"""
        symbol = data.get("symbol")
        
        # Store signal in Redis with TTL
        self.redis_client.setex(
            f"signal:{symbol}",
            300,  # 5 minutes TTL
            json.dumps(data)
        )
        
        # Notify connected WebSocket clients
        await self.notify_clients("signal_update", data)
    
    async def notify_clients(self, event_type: str, data: Dict[str, Any]):
        """Notify connected WebSocket clients about events"""
        # Implementation for WebSocket broadcasting
        pass

# Initialize and run consumer
data_pipeline = DataPipelineConsumer()

async def main():
    await data_pipeline.initialize()
    await data_pipeline.start_consumer("market_data", "market_data_group")
    await data_pipeline.start_consumer("liquidity_data", "liquidity_data_group")
    await data_pipeline.start_consumer("order_events", "order_events_group")
    await data_pipeline.start_consumer("trade_signals", "trade_signals_group")

if __name__ == "__main__":
    asyncio.run(main())
