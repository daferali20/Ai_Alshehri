from __future__ import annotations

import re

from pydantic import BaseModel, Field, field_validator


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def validate_email(value: str) -> str:
    value = value.strip().lower()
    if not EMAIL_PATTERN.fullmatch(value):
        raise ValueError("البريد الإلكتروني غير صالح")
    return value


class RegisterRequest(BaseModel):
    email: str
    full_name: str = Field(min_length=2, max_length=200)
    password: str = Field(min_length=8, max_length=128)
    terms_accepted: bool = False

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return validate_email(value)

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("الاسم مطلوب")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return validate_email(value)


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
