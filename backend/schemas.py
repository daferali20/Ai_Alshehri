from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=200)
    password: str = Field(min_length=8, max_length=128)
    terms_accepted: bool = False

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("الاسم مطلوب")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RecommendationRequest(BaseModel):
    symbols: list[str] = Field(min_length=1, max_length=100)

    @field_validator("symbols")
    @classmethod
    def clean_symbols(cls, value: list[str]) -> list[str]:
        cleaned = list(dict.fromkeys(item.strip().upper() for item in value if item and item.strip()))
        if not cleaned:
            raise ValueError("يجب إدخال سهم واحد على الأقل")
        return cleaned
