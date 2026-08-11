# backend/api_gateway/main.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import httpx
import redis
import json
from datetime import datetime
from typing import Dict
import asyncio
from contextlib import asynccontextmanager

from .middleware.auth import JWTAuthMiddleware
from .middleware.rate_limit import RateLimitMiddleware
from .middleware.logging import LoggingMiddleware
from .config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    app.state.redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        decode_responses=True
    )
    app.state.http_client = httpx.AsyncClient(timeout=30.0)
    yield
    # Shutdown
    await app.state.http_client.aclose()
    app.state.redis_client.close()

app = FastAPI(
    title="AI Trading Gateway",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(CORSMiddleware, 
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)
app.add_middleware(JWTAuthMiddleware, excluded_paths=["/health", "/api/v1/auth/login", "/api/v1/auth/register"])
app.add_middleware(RateLimitMiddleware, redis_client=app.state.redis_client)
app.add_middleware(LoggingMiddleware)

# Service registry
SERVICES = {
    "user": settings.USER_SERVICE_URL,
    "order": settings.ORDER_SERVICE_URL,
    "liquidity": settings.LIQUIDITY_SERVICE_URL,
    "ai": settings.AI_SERVICE_URL,
}

# Routes mapping
ROUTES = {
    "/api/v1/auth": "user",
    "/api/v1/users": "user",
    "/api/v1/orders": "order",
    "/api/v1/trading": "order",
    "/api/v1/liquidity": "liquidity",
    "/api/v1/ai/signals": "ai",
    "/api/v1/ai/predict": "ai",
}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": SERVICES
    }

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(request: Request, path: str):
    # Determine which service to route to
    service_name = None
    for route_prefix, service in ROUTES.items():
        if f"/{path}".startswith(route_prefix) or path.startswith(route_prefix.strip("/")):
            service_name = service
            break
    
    if not service_name:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service_url = SERVICES.get(service_name)
    if not service_url:
        raise HTTPException(status_code=503, detail="Service unavailable")
    
    # Build target URL
    target_url = f"{service_url}/{path}"
    
    # Forward request
    try:
        # Get request body
        body = await request.body()
        
        # Prepare headers
        headers = dict(request.headers)
        headers.pop("host", None)
        
        # Forward request
        response = await app.state.http_client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            params=request.query_params,
        )
        
        # Cache responses if needed
        if request.method == "GET" and response.status_code == 200:
            cache_key = f"cache:{path}:{request.query_params}"
            await cache_response(app.state.redis_client, cache_key, response.text)
        
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
        )
    
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Gateway timeout")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Bad gateway: {str(e)}")

async def cache_response(redis_client, key: str, value: str, ttl: int = 60):
    """Cache response in Redis with TTL"""
    await redis_client.setex(key, ttl, value)
