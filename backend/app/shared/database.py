from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, DeclarativeBase

from app.shared.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def provide_database_session() -> Session:
    database_session = SessionLocal()
    try:
        yield database_session
    finally:
        database_session.close()
