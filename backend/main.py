import inspect
import logging
import sys
from contextlib import asynccontextmanager

from alembic import command
from alembic.config import Config
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from loguru import logger
from sqlmodel import select, Session

from app.deps import get_db, get_url, engine
from app.models.db import User
from app.routes.sessions import Sessions
from app.routes.users import Users


def only_level(level):
    def is_level(record):
        return record['level'].name == level

    return is_level


logger.remove()
logger.add(
    sys.stdout,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> <level>{message}</level>",
    level=logging.INFO
)
# For debug also log line
logger.add(
    sys.stdout,
    colorize=True,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level=logging.DEBUG,
    filter=only_level("DEBUG")
)



@logger.catch
@asynccontextmanager
async def lifespan(app_: FastAPI):
    logger.info("Starting up...")
    try:
        logger.info("run alembic upgrade head...")
        alembic_cfg = Config("alembic.ini")
        alembic_cfg.set_main_option("sqlalchemy.url", get_url())
        command.upgrade(alembic_cfg, "head")
        logger.info("Alembic upgrade done")
    except Exception as e:
        logger.error(f"Error during Alembic upgrade: {e}")
        raise e

    with Session(engine) as session:
        any_user = session.exec(select(User)).first()
        if not any_user:
            logger.info("Creating default user...")
            user = User(
                username="admin",
                email="admin@admin.admin",
                hashed_password=User.get_password_hash("admin"),
                is_admin=True
            )
            session.add(user)
            session.commit()
        else:
            logger.info("Users already exists")

    yield

    logger.info("Shutting down...")

app = FastAPI(lifespan=lifespan)
app.add_middleware(
    GZipMiddleware,
    minimum_size=1000
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(Sessions.router)
app.include_router(Users.router)


@app.middleware("http")
@logger.catch
async def middleware(request: Request, call_next):
    logger.info(f"{request.client.host} | {request.method:<6} | {request.url.path}")
    return await call_next(request)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        proxy_headers=True,
    )