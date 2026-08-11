# backend/services/order_service/main.py
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
import asyncio
import httpx
from datetime import datetime

from .models import Order, OrderStatus, Trade
from .database import get_db, engine
from .broker_client import BrokerClient
from .liquidity_client import LiquidityClient
from .config import settings

app = FastAPI(title="Order Service", version="1.0.0")

# Initialize clients
broker_client = BrokerClient(settings.BROKER_API_KEY, settings.BROKER_API_SECRET)
liquidity_client = LiquidityClient(settings.LIQUIDITY_SERVICE_URL)

@app.post("/api/v1/orders")
async def create_order(
    order_data: dict,
    db: Session = Depends(get_db)
):
    """Create and execute a new trading order"""
    try:
        # Validate order
        if order_data["action"] not in ["BUY", "SELL"]:
            raise HTTPException(status_code=400, detail="Invalid order action")
        
        # Check liquidity
        liquidity_check = await liquidity_client.check_liquidity(
            symbol=order_data["symbol"],
            quantity=order_data["quantity"]
        )
        
        if not liquidity_check["sufficient"]:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient liquidity. Available: {liquidity_check['available']}"
            )
        
        # Execute order with broker
        broker_response = await broker_client.execute_order(
            symbol=order_data["symbol"],
            action=order_data["action"],
            quantity=order_data["quantity"],
            order_type=order_data.get("order_type", "market"),
            limit_price=order_data.get("limit_price")
        )
        
        # Create order record
        order = Order(
            user_id=order_data["user_id"],
            symbol=order_data["symbol"],
            action=order_data["action"],
            quantity=order_data["quantity"],
            price=broker_response["executed_price"],
            status=OrderStatus.EXECUTED,
            broker_order_id=broker_response["broker_order_id"],
            created_at=datetime.utcnow(),
            executed_at=datetime.utcnow()
        )
        
        db.add(order)
        db.commit()
        db.refresh(order)
        
        # Create trade record
        trade = Trade(
            order_id=order.id,
            symbol=order.symbol,
            quantity=order.quantity,
            price=order.price,
            side=order.action,
            executed_at=datetime.utcnow()
        )
        db.add(trade)
        db.commit()
        
        # Publish order event to Kafka
        await publish_order_event(order)
        
        return {
            "order_id": order.id,
            "status": order.status,
            "executed_price": order.price,
            "quantity": order.quantity,
            "timestamp": order.executed_at.isoformat()
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Order execution failed: {str(e)}")

@app.get("/api/v1/orders/{order_id}")
async def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get order details by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.get("/api/v1/orders/user/{user_id}")
async def get_user_orders(
    user_id: int,
    status: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get orders for a specific user"""
    query = db.query(Order).filter(Order.user_id == user_id)
    if status:
        query = query.filter(Order.status == status)
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    return orders

async def publish_order_event(order: Order):
    """Publish order event to Kafka for other services"""
    # Implementation for Kafka publishing
    pass
