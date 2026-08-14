from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

try:
    from .config import settings
except ImportError:
    from config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": settings.DB_POOL_RECYCLE,
    "connect_args": connect_args,
}
if not settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs.update({"pool_size": settings.DB_POOL_SIZE, "max_overflow": settings.DB_MAX_OVERFLOW, "pool_timeout": settings.DB_POOL_TIMEOUT})

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
