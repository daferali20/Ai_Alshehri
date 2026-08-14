from __future__ import annotations

import base64
import hashlib
import os

from cryptography.fernet import Fernet, InvalidToken

try:
    from ..config import settings
except ImportError:
    from config import settings


def _fernet() -> Fernet:
    raw = settings.MASTER_ENCRYPTION_KEY
    if raw:
        try:
            return Fernet(raw.encode())
        except (ValueError, TypeError):
            pass
    # Development-only deterministic key derived from configuration.
    # Production deployments should set MASTER_ENCRYPTION_KEY to a Fernet key.
    digest = hashlib.sha256((settings.JWT_SECRET_KEY + settings.ENCRYPTION_SALT).encode()).digest()
    return Fernet(base64.urlsafe_b64encode(digest))


def encrypt(value: str) -> str:
    if not isinstance(value, str):
        raise TypeError("value must be a string")
    return _fernet().encrypt(value.encode()).decode()


def decrypt(value: str) -> str:
    try:
        return _fernet().decrypt(value.encode()).decode()
    except (InvalidToken, ValueError, TypeError) as exc:
        raise ValueError("Unable to decrypt value") from exc
