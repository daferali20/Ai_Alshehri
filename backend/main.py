from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Ai_Alshehri API", version="1.0.0")

# إضافة CORS للسماح للواجهة الأمامية بالاتصال
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # في الإنتاج، حدد النطاق الحقيقي
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "مرحباً بك في Ai_Alshehri API"}

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "الخادم يعمل بشكل صحيح"}

@app.get("/api/v1/subscription/tiers")
async def get_tiers():
    return {
        "tiers": [
            {"id": "free", "name": "مجاني", "price": 0},
            {"id": "basic", "name": "أساسي", "price": 29},
            {"id": "pro", "name": "احترافي", "price": 99},
            {"id": "premium", "name": "مميز", "price": 299}
        ]
    }
