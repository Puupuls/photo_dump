import os

from sqlalchemy import create_engine

from app.models.db import *
from sqlmodel import Session


def get_url():
    user = os.getenv("PG_USER")
    password = os.getenv("PG_PASSWORD")
    db = os.getenv("PG_DB")
    host = os.getenv("PG_HOST", "db")  # default to "db" as used in docker-compose
    return f"postgresql://{user}:{password}@{host}/{db}"


engine = create_engine(get_url(), echo=True)


def get_db():
    with Session(engine) as session:
        yield session
