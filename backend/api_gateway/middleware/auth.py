# backend/api_gateway/middleware/auth.py
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import jwt
from datetime import datetime
from typing import Set

class JWTAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, excluded_paths: Set[str] = None):
        super().__init__(app)
        self.excluded_paths = excluded_paths or {"/health", "/api/v1/auth/login", "/api/v1/auth/register"}
    
    async def dispatch(self, request: Request, call_next):
        # Check if path is excluded
        if request.url.path in self.excluded_paths:
            return await call_next(request)
        
        # Get token from header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        
        token = auth_header.split(" ")[1]
        
        try:
            # Verify token
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.utcnow().timestamp() > exp:
                raise HTTPException(status_code=401, detail="Token has expired")
            
            # Add user info to request state
            request.state.user_id = payload.get("user_id")
            request.state.user_roles = payload.get("roles", [])
            
            return await call_next(request)
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
