# backend/services/recommendation_service/main.py
from fastapi import FastAPI, HTTPException, Depends
from typing import List, Dict
import httpx

app = FastAPI(title="Recommendation Service", version="1.0.0")

# ============================================
# خدمة التوصيات - فقط تحليل بدون تنفيذ
# ============================================

class RecommendationService:
    def __init__(self):
        self.ai_engine_url = settings.AI_ENGINE_URL
    
    async def get_recommendations(
        self, 
        user_id: int, 
        symbols: List[str],
        subscription_tier: str
    ) -> List[Dict]:
        """توليد توصيات للمستخدم (بدون تنفيذ)"""
        
        # التحقق من حدود الاشتراك
        max_symbols = get_max_symbols(subscription_tier)
        if len(symbols) > max_symbols:
            raise HTTPException(
                status_code=400,
                detail=f"الحد الأقصى للأسهم هو {max_symbols} لخطة {subscription_tier}"
            )
        
        # جلب التوصيات من محرك الذكاء الاصطناعي
        recommendations = []
        async with httpx.AsyncClient() as client:
            for symbol in symbols:
                response = await client.get(
                    f"{self.ai_engine_url}/api/v1/ai/signals/{symbol}"
                )
                if response.status_code == 200:
                    signal = response.json()
                    
                    # إضافة تحذير قانوني لكل توصية
                    signal["disclaimer"] = {
                        "type": "analysis_only",
                        "message": "هذه التوصية للتحليل فقط، وليست نصيحة استثمارية",
                        "execution_not_enabled": True,
                        "user_responsibility": "المستخدم يتحمل كامل المسؤولية عن أي قرارات استثمارية"
                    }
                    
                    # إضافة ميزات الاشتراك
                    signal["subscription_features"] = {
                        "can_execute": False,
                        "execution_required_tier": "PREMIUM",
                        "current_tier": subscription_tier
                    }
                    
                    recommendations.append(signal)
        
        # تسجيل وصول المستخدم للتوصيات (للتدقيق)
        await log_user_access(user_id, "RECOMMENDATIONS_VIEWED", symbols)
        
        return recommendations

recommendation_service = RecommendationService()

@app.post("/api/v1/recommendations")
async def get_recommendations(
    request: RecommendationsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """الحصول على توصيات للأسهم المحددة"""
    
    # التحقق من الاشتراك
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == current_user.id,
        UserSubscription.is_active == True
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=403, detail="لا يوجد اشتراك نشط")
    
    # جلب التوصيات
    recommendations = await recommendation_service.get_recommendations(
        user_id=current_user.id,
        symbols=request.symbols,
        subscription_tier=subscription.tier
    )
    
    return {
        "user_id": current_user.id,
        "subscription_tier": subscription.tier,
        "recommendations": recommendations,
        "timestamp": datetime.utcnow().isoformat(),
        "execution_enabled": False,  # التنفيذ غير مفعل افتراضياً
        "note": "هذا النظام يقدم توصيات تحليلية فقط. للتنفيذ التلقائي، قم بترقية اشتراكك إلى PREMIUM"
    }

@app.get("/api/v1/recommendations/test-execution")
async def test_execution(
    symbol: str,
    quantity: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """محاكاة تنفيذ الصفقة - فقط لاختبار التوصيات بدون تنفيذ فعلي"""
    
    # التحقق من الاشتراك
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == current_user.id,
        UserSubscription.is_active == True
    ).first()
    
    # توليد توصية تجريبية
    recommendation = await recommendation_service.get_recommendations(
        user_id=current_user.id,
        symbols=[symbol],
        subscription_tier=subscription.tier
    )
    
    # إظهار كيف سيكون التنفيذ (دون تنفيذ فعلي)
    return {
        "simulation": True,
        "symbol": symbol,
        "quantity": quantity,
        "recommendation": recommendation[0] if recommendation else None,
        "would_execute_at": datetime.utcnow().isoformat(),
        "execution_enabled": False,
        "message": "هذه محاكاة فقط. لتمكين التنفيذ الفعلي، قم بترقية اشتراكك إلى PREMIUM وأضف مفاتيح API الخاصة بك"
    }
