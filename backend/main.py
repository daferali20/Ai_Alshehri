from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="Ai_Alshehri API",
    description="نظام التوصيات الذكي للأسهم",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== نماذج البيانات ==========
class SubscriptionTier(BaseModel):
    id: str
    name: str
    price: float
    priceYearly: float
    features: dict

class UserSubscription(BaseModel):
    userId: int
    tier: str
    startDate: str
    endDate: str
    isActive: bool
    executionEnabled: bool

class UpgradeRequest(BaseModel):
    tierId: str
    billingCycle: str
    termsAccepted: Optional[bool] = False
    consentSignature: Optional[str] = None

# ========== البيانات الوهمية ==========
TIERS = [
    {"id": "free", "name": "مجاني", "price": 0, "priceYearly": 0, "features": {"maxSymbols": 3}},
    {"id": "basic", "name": "أساسي", "price": 29, "priceYearly": 290, "features": {"maxSymbols": 10}},
    {"id": "pro", "name": "احترافي", "price": 99, "priceYearly": 990, "features": {"maxSymbols": 50}},
    {"id": "premium", "name": "مميز", "price": 299, "priceYearly": 2990, "features": {"maxSymbols": -1}},
]

CURRENT_SUBSCRIPTION = {
    "userId": 1,
    "tier": "free",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "isActive": True,
    "executionEnabled": False
}

# ========== الـ Endpoints ==========
@app.get("/")
async def root():
    return {
        "message": "مرحباً بك في Ai_Alshehri API",
        "version": "1.0.0",
        "endpoints": [
            "/health",
            "/api/v1/subscription/tiers",
            "/api/v1/subscription/current",
            "/api/v1/subscription/upgrade"
        ]
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": "2026-08-12"}

@app.get("/api/v1/subscription/tiers")
async def get_tiers():
    return {"tiers": TIERS}

@app.get("/api/v1/subscription/current")
async def get_current_subscription():
    return CURRENT_SUBSCRIPTION

@app.post("/api/v1/subscription/upgrade")
async def upgrade_subscription(request: UpgradeRequest):
    # التحقق من وجود الخطة
    tier = next((t for t in TIERS if t["id"] == request.tierId), None)
    if not tier:
        raise HTTPException(status_code=404, detail="الخطة غير موجودة")
    
    # تحديث الاشتراك
    updated_subscription = CURRENT_SUBSCRIPTION.copy()
    updated_subscription["tier"] = request.tierId
    updated_subscription["executionEnabled"] = request.tierId == "premium"
    
    return {
        "success": True,
        "message": f"تمت الترقية إلى {tier['name']} بنجاح",
        "subscription": updated_subscription
    }

# ========== تشغيل الخادم ==========
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
