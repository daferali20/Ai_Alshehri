from __future__ import annotations
from datetime import datetime, timezone
import asyncio
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session
from .ai_analysis import analyze_stock
from .ai_ranking import rank_stock
from .analysis_engine import analyze_quote
from .config import settings
from .database import get_db, init_db
from .liquidity_engine import analyze_liquidity, analyze_momentum
from .market_data import MarketDataError, get_history, get_quote
from .models.models import SubscriptionTier, User, UserSubscription
from .schemas import LoginRequest, RecommendationRequest, RegisterRequest, TokenResponse
from .security import create_access_token, decode_access_token, hash_password, verify_password
from .technical_analysis import analyze_ohlcv
from .screener_api import router as screener_router
from .news_engine import get_news

app = FastAPI(title=settings.APP_NAME, description='منصة تحليل وتوصيات الأسهم', version=settings.APP_VERSION)

# Public read-only market endpoints are consumed directly by the deployed React app.
# Keep the explicit frontend origin and also allow the Render preview/custom frontend
# origins supplied through CORS_ORIGINS. Credentials are enabled for authenticated
# endpoints; no wildcard origin is used when credentials are enabled.
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(settings.CORS_ORIGINS + [
        'https://ai-alshehri-2.onrender.com',
        'https://ai-alshehri.onrender.com',
    ])),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
    expose_headers=['*'],
)
security = HTTPBearer(auto_error=False)
app.include_router(screener_router)
TIERS=[{'id':'free','name':'مجاني','price':0,'priceYearly':0,'features':{'maxSymbols':3}},{'id':'basic','name':'أساسي','price':29,'priceYearly':290,'features':{'maxSymbols':10}},{'id':'pro','name':'احترافي','price':99,'priceYearly':990,'features':{'maxSymbols':50}},{'id':'premium','name':'مميز','price':299,'priceYearly':2990,'features':{'maxSymbols':-1}}]

def current_user(credentials: HTTPAuthorizationCredentials|None=Depends(security), db: Session=Depends(get_db)) -> User:
    if not credentials: raise HTTPException(401,'المصادقة مطلوبة')
    try: user_id=decode_access_token(credentials.credentials)
    except Exception as exc: raise HTTPException(401,'رمز الدخول غير صالح') from exc
    user=db.get(User,user_id)
    if not user: raise HTTPException(401,'المستخدم غير موجود')
    return user

@app.on_event('startup')
def startup(): init_db()
@app.get('/')
async def root(): return {'message':'مرحباً بك في Ai_Alshehri API','version':settings.APP_VERSION,'service':'stock-analysis'}
@app.get('/health')
async def health(): return {'status':'healthy','timestamp':datetime.now(timezone.utc).isoformat()}
@app.get('/api/v1/subscription/tiers')
async def get_tiers(): return {'tiers':TIERS}
@app.get('/api/v1/subscription/current')
async def get_current_subscription(user:User=Depends(current_user),db:Session=Depends(get_db)):
    sub=db.scalar(select(UserSubscription).where(UserSubscription.user_id==user.id))
    if not sub: sub=UserSubscription(user_id=user.id,tier=SubscriptionTier.FREE.value,is_active=True); db.add(sub); db.commit(); db.refresh(sub)
    return {'userId':user.id,'tier':sub.tier,'startDate':sub.start_date.isoformat(),'endDate':sub.end_date.isoformat() if sub.end_date else None,'isActive':sub.is_active,'executionEnabled':False}
@app.post('/api/v1/auth/register',response_model=TokenResponse)
async def register(request:RegisterRequest,db:Session=Depends(get_db)):
    if not request.terms_accepted: raise HTTPException(400,'يجب قبول الشروط والأحكام')
    if db.scalar(select(User).where(User.email==request.email)): raise HTTPException(409,'البريد الإلكتروني مستخدم بالفعل')
    user=User(email=request.email,full_name=request.full_name,hashed_password=hash_password(request.password)); db.add(user); db.flush(); db.add(UserSubscription(user_id=user.id,tier=SubscriptionTier.FREE.value,is_active=True)); db.commit()
    return TokenResponse(access_token=create_access_token(user.id))
@app.post('/api/v1/auth/login',response_model=TokenResponse)
async def login(request:LoginRequest,db:Session=Depends(get_db)):
    user=db.scalar(select(User).where(User.email==request.email))
    if not user or not verify_password(request.password,user.hashed_password): raise HTTPException(401,'البريد الإلكتروني أو كلمة المرور غير صحيحة')
    return TokenResponse(access_token=create_access_token(user.id))
@app.get('/api/v1/stocks/{symbol}')
async def stock_analysis(symbol:str):
    """Read-only stock analysis endpoint used by the public dashboard."""
    try:
        quote,history=await asyncio.gather(get_quote(symbol),get_history(symbol,260)); technical=analyze_ohlcv(history) if history else {}; liquidity=analyze_liquidity(history) if history else {}; momentum=analyze_momentum(history) if history else {}; ranking=rank_stock(technical,liquidity,momentum,quote); ai=analyze_stock(technical,liquidity,momentum,ranking,quote); news=get_news(symbol,10)
        return {'quote':quote,'history':history,'analysis':analyze_quote(quote),'technical':technical,'liquidity':liquidity,'momentum':momentum,'ranking':ranking,'ai_analysis':ai,'news':news}
    except MarketDataError as exc: raise HTTPException(502,str(exc)) from exc
@app.post('/api/v1/recommendations')
async def recommendations(request:RecommendationRequest,user:User=Depends(current_user),db:Session=Depends(get_db)):
    sub=db.scalar(select(UserSubscription).where(UserSubscription.user_id==user.id)); tier=sub.tier if sub else 'free'; max_symbols=next(x['features']['maxSymbols'] for x in TIERS if x['id']==tier); symbols=list(dict.fromkeys(s.strip().upper() for s in request.symbols if s.strip()))
    if max_symbols!=-1 and len(symbols)>max_symbols: raise HTTPException(403,f'خطتك تسمح بتحليل {max_symbols} أسهم فقط')
    results=[]
    for symbol in symbols:
        try:
            quote,history=await asyncio.gather(get_quote(symbol),get_history(symbol,260)); technical=analyze_ohlcv(history) if history else {}; liquidity=analyze_liquidity(history) if history else {}; momentum=analyze_momentum(history) if history else {}; ranking=rank_stock(technical,liquidity,momentum,quote); ai=analyze_stock(technical,liquidity,momentum,ranking,quote); news=get_news(symbol,10)
            results.append({'symbol':symbol,'quote':quote,'history':history,'technical':technical,'liquidity':liquidity,'momentum':momentum,'ranking':ranking,'ai_analysis':ai,'news':news})
        except MarketDataError as exc: results.append({'symbol':symbol,'error':str(exc)})
    return {'status':'ok','tier':tier,'results':results}
if __name__=='__main__':
    import uvicorn
    uvicorn.run('backend.main:app',host=settings.HOST,port=settings.PORT,reload=settings.DEBUG)
