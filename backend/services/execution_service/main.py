# backend/services/execution_service/main.py
from fastapi import FastAPI, HTTPException, Depends
from typing import Dict
import httpx
from cryptography.fernet import Fernet

app = FastAPI(title="Execution Service", version="1.0.0")

# ============================================
# خدمة التنفيذ - متاحة فقط للمشتركين PREMIUM
# ============================================

class ExecutionService:
    def __init__(self):
        self.fernet = Fernet(settings.ENCRYPTION_KEY)
    
    async def execute_order(
        self,
        user_id: int,
        symbol: str,
        action: str,
        quantity: int,
        order_type: str = "market",
        limit_price: float = None
    ) -> Dict:
        """تنفيذ أمر تداول عبر API الخاص بالمستخدم"""
        
        # التحقق من أن المستخدم PREMIUM
        subscription = await get_user_subscription(user_id)
        if subscription.tier != SubscriptionTier.PREMIUM:
            raise HTTPException(
                status_code=403,
                detail="تنفيذ الأوامر متاح فقط لمشتركي PREMIUM"
            )
        
        # التحقق من الموافقة القانونية
        if not subscription.execution_consent_given:
            raise HTTPException(
                status_code=403,
                detail="يجب الموافقة على شروط التنفيذ التلقائي أولاً"
            )
        
        # فك تشفير مفاتيح API
        api_key = self.fernet.decrypt(subscription.broker_api_key.encode()).decode()
        api_secret = self.fernet.decrypt(subscription.broker_api_secret.encode()).decode()
        broker_type = subscription.broker_type
        
        # تنفيذ الأمر عبر الوسيط
        try:
            if broker_type == "alpaca":
                result = await self.execute_alpaca_order(
                    api_key, api_secret, symbol, action, quantity, order_type, limit_price
                )
            elif broker_type == "interactive_brokers":
                result = await self.execute_ib_order(
                    api_key, api_secret, symbol, action, quantity, order_type, limit_price
                )
            else:
                raise HTTPException(status_code=400, detail="نوع الوسيط غير مدعوم")
            
            # تسجيل الصفقة للتدقيق
            await log_trade(
                user_id=user_id,
                symbol=symbol,
                action=action,
                quantity=quantity,
                price=result["executed_price"],
                order_id=result["order_id"],
                broker_type=broker_type
            )
            
            return {
                "status": "executed",
                "order_id": result["order_id"],
                "symbol": symbol,
                "action": action,
                "quantity": quantity,
                "executed_price": result["executed_price"],
                "timestamp": datetime.utcnow().isoformat(),
                "broker": broker_type
            }
            
        except Exception as e:
            # تسجيل الخطأ للتدقيق
            await log_trade_error(user_id, symbol, str(e))
            raise HTTPException(status_code=500, detail=f"فشل التنفيذ: {str(e)}")
    
    async def execute_alpaca_order(self, api_key, api_secret, symbol, action, quantity, order_type, limit_price):
        """تنفيذ أمر عبر Alpaca API"""
        # مثال على تنفيذ عبر Alpaca
        async with httpx.AsyncClient() as client:
            headers = {
                "APCA-API-KEY-ID": api_key,
                "APCA-API-SECRET-KEY": api_secret
            }
            
            data = {
                "symbol": symbol,
                "qty": quantity,
                "side": action.lower(),
                "type": order_type,
                "time_in_force": "day"
            }
            
            if order_type == "limit" and limit_price:
                data["limit_price"] = limit_price
            
            response = await client.post(
                "https://paper-api.alpaca.markets/v2/orders",
                headers=headers,
                json=data
            )
            
            if response.status_code != 200:
                raise Exception(f"Alpaca error: {response.text}")
            
            result = response.json()
            return {
                "order_id": result["id"],
                "executed_price": float(result.get("filled_avg_price", result["limit_price"]))
            }
    
    async def execute_ib_order(self, api_key, api_secret, symbol, action, quantity, order_type, limit_price):
        """تنفيذ أمر عبر Interactive Brokers API"""
        # تنفيذ مماثل لـ IB
        pass

execution_service = ExecutionService()

@app.post("/api/v1/execute")
async def execute_order_endpoint(
    order_data: OrderExecutionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """تنفيذ أمر تداول (متاح فقط لمشتركي PREMIUM)"""
    
    # التحقق من الاشتراك
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == current_user.id,
        UserSubscription.is_active == True
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=403, detail="لا يوجد اشتراك نشط")
    
    if subscription.tier != SubscriptionTier.PREMIUM:
        raise HTTPException(
            status_code=403,
            detail=f"تنفيذ الأوامر متاح فقط لمشتركي PREMIUM. مستواك الحالي: {subscription.tier}"
        )
    
    if not subscription.execution_consent_given:
        raise HTTPException(
            status_code=403,
            detail="لم توافق على شروط التنفيذ التلقائي. يرجى الموافقة من صفحة الإعدادات"
        )
    
    if not subscription.broker_api_key:
        raise HTTPException(
            status_code=400,
            detail="لم تقم بإضافة مفاتيح API للوسيط. يرجى إضافتها من صفحة الإعدادات"
        )
    
    # تنفيذ الأمر
    result = await execution_service.execute_order(
        user_id=current_user.id,
        symbol=order_data.symbol,
        action=order_data.action,
        quantity=order_data.quantity,
        order_type=order_data.order_type,
        limit_price=order_data.limit_price
    )
    
    return result

@app.get("/api/v1/execution/status")
async def get_execution_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على حالة التنفيذ للمستخدم"""
    
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == current_user.id,
        UserSubscription.is_active == True
    ).first()
    
    return {
        "user_id": current_user.id,
        "execution_enabled": (
            subscription.tier == SubscriptionTier.PREMIUM and
            subscription.execution_consent_given and
            subscription.broker_api_key is not None
        ),
        "current_tier": subscription.tier,
        "broker_connected": subscription.broker_type is not None,
        "consent_given": subscription.execution_consent_given,
        "requires_upgrade": subscription.tier != SubscriptionTier.PREMIUM
    }
