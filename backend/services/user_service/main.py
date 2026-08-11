# backend/services/user_service/main.py
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
import stripe
from enum import Enum

app = FastAPI(title="User Service", version="1.0.0")

# ============================================
# نماذج البيانات
# ============================================

class SubscriptionTier(str, Enum):
    FREE = "free"
    BASIC = "basic"          # توصيات فقط
    PRO = "pro"              # توصيات + تحليل متقدم
    PREMIUM = "premium"      # توصيات + تنفيذ تلقائي (مع API الخاص بالمستخدم)

class UserSubscription(Base):
    __tablename__ = "user_subscriptions"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # تخزين مفاتيح API مشفرة
    broker_api_key = Column(String, nullable=True)      # مشفر
    broker_api_secret = Column(String, nullable=True)   # مشفر
    broker_type = Column(String, nullable=True)         # "alpaca", "interactive_brokers", etc.
    
    # موافقات قانونية
    execution_consent_given = Column(Boolean, default=False)
    consent_given_at = Column(DateTime, nullable=True)
    consent_document_hash = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # سجل النشاط للامتثال
    last_login = Column(DateTime)
    ip_address = Column(String)
    user_agent = Column(String)

# ============================================
# واجهات برمجة التطبيقات (APIs)
# ============================================

@app.post("/api/v1/auth/register")
async def register_user(user_data: UserCreate):
    """تسجيل مستخدم جديد مع قبول الشروط القانونية"""
    # التحقق من الموافقة على الشروط
    if not user_data.terms_accepted:
        raise HTTPException(
            status_code=400,
            detail="يجب قبول الشروط والأحكام للاستمرار"
        )
    
    # إنشاء المستخدم
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
        created_at=datetime.utcnow()
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # إنشاء اشتراك مجاني افتراضي
    subscription = UserSubscription(
        user_id=user.id,
        tier=SubscriptionTier.FREE,
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=365),
        is_active=True
    )
    db.add(subscription)
    db.commit()
    
    return {"user_id": user.id, "message": "تم التسجيل بنجاح"}

@app.post("/api/v1/subscription/upgrade")
async def upgrade_subscription(
    user_id: int,
    tier: SubscriptionTier,
    payment_method: str,
    db: Session = Depends(get_db)
):
    """ترقية الاشتراك إلى مستوى أعلى"""
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == user_id,
        UserSubscription.is_active == True
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="الاشتراك غير موجود")
    
    # معالجة الدفع عبر Stripe/PayPal
    try:
        payment_result = await process_payment(user_id, tier, payment_method)
        if not payment_result.success:
            raise HTTPException(status_code=400, detail="فشل الدفع")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في الدفع: {str(e)}")
    
    # تحديث الاشتراك
    subscription.tier = tier
    subscription.end_date = datetime.utcnow() + timedelta(days=30)  # شهري
    
    # إذا كان اشتراك PREMIUM، طلب موافقة قانونية إضافية
    if tier == SubscriptionTier.PREMIUM:
        subscription.execution_consent_given = False  # يطلب الموافقة لاحقاً
    
    db.commit()
    
    return {
        "message": f"تم الترقية إلى {tier}",
        "features": get_features_for_tier(tier)
    }

@app.post("/api/v1/subscription/add-broker-api")
async def add_broker_api(
    user_id: int,
    broker_type: str,
    api_key: str,
    api_secret: str,
    consent_signature: str,  # توقيع إلكتروني للموافقة
    db: Session = Depends(get_db)
):
    """إضافة مفاتيح API الخاصة بالمستخدم للوسيط (للمستخدمين PREMIUM فقط)"""
    
    # التحقق من الاشتراك
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == user_id,
        UserSubscription.is_active == True
    ).first()
    
    if not subscription or subscription.tier != SubscriptionTier.PREMIUM:
        raise HTTPException(
            status_code=403,
            detail="هذه الميزة متاحة فقط لمشتركي PREMIUM"
        )
    
    # تسجيل الموافقة القانونية
    if not subscription.execution_consent_given:
        # حفظ توقيع الموافقة
        consent_record = ExecutionConsent(
            user_id=user_id,
            consent_signature=consent_signature,
            consent_given_at=datetime.utcnow(),
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent"),
            document_hash=hash(consent_document)
        )
        db.add(consent_record)
        
        subscription.execution_consent_given = True
        subscription.consent_given_at = datetime.utcnow()
    
    # تخزين المفاتيح مشفرة
    encrypted_api_key = encrypt(api_key)
    encrypted_api_secret = encrypt(api_secret)
    
    subscription.broker_api_key = encrypted_api_key
    subscription.broker_api_secret = encrypted_api_secret
    subscription.broker_type = broker_type
    
    db.commit()
    
    # تسجيل الحدث للامتثال
    await log_audit_event(
        user_id=user_id,
        action="BROKER_API_ADDED",
        details=f"Broker type: {broker_type}",
        ip=request.client.host
    )
    
    return {
        "message": "تم إضافة مفاتيح API بنجاح",
        "broker_type": broker_type,
        "execution_enabled": True
    }

@app.get("/api/v1/subscription/features")
async def get_features(user_id: int, db: Session = Depends(get_db)):
    """الحصول على ميزات الاشتراك الحالي"""
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == user_id,
        UserSubscription.is_active == True
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="الاشتراك غير موجود")
    
    features = get_features_for_tier(subscription.tier)
    
    # إضافة حالة التنفيذ إذا كان PREMIUM
    if subscription.tier == SubscriptionTier.PREMIUM:
        features["execution_enabled"] = (
            subscription.execution_consent_given and
            subscription.broker_api_key is not None
        )
        features["broker_connected"] = subscription.broker_type is not None
    
    return features

def get_features_for_tier(tier: SubscriptionTier):
    """الحصول على ميزات كل مستوى اشتراك"""
    features = {
        SubscriptionTier.FREE: {
            "recommendations": True,
            "max_symbols": 3,
            "updates_interval": "daily",
            "technical_indicators": True,
            "execution_enabled": False,
            "real_time_data": False,
            "advanced_models": False
        },
        SubscriptionTier.BASIC: {
            "recommendations": True,
            "max_symbols": 10,
            "updates_interval": "hourly",
            "technical_indicators": True,
            "execution_enabled": False,
            "real_time_data": False,
            "advanced_models": False
        },
        SubscriptionTier.PRO: {
            "recommendations": True,
            "max_symbols": 50,
            "updates_interval": "realtime",
            "technical_indicators": True,
            "execution_enabled": False,
            "real_time_data": True,
            "advanced_models": True
        },
        SubscriptionTier.PREMIUM: {
            "recommendations": True,
            "max_symbols": "unlimited",
            "updates_interval": "realtime",
            "technical_indicators": True,
            "execution_enabled": True,  # لكن يحتاج API خاص بالمستخدم
            "real_time_data": True,
            "advanced_models": True,
            "auto_execution": True,
            "custom_strategies": True,
            "priority_support": True
        }
    }
    
    return features.get(tier, {})
