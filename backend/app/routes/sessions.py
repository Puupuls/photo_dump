import os
from datetime import datetime, timedelta
from typing import Annotated

import jwt
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import InvalidTokenError
from loguru import logger
from pydantic import BaseModel
from sqlmodel import select, Session
from starlette import status

from ..deps import get_db, engine
from ..models import User

ALGORITHM = "HS256"
bearer = HTTPBearer(
    auto_error=False
)


class Sessions:
    router = APIRouter(
        prefix="/auth",
        tags=["auth"]
    )

    class LoginData(BaseModel):
        username: str
        password: str

    @staticmethod
    @router.post("/login")
    async def login(data: LoginData, request: Request, session=Depends(get_db)):
        user = session.exec(select(User).where(User.username == data.username)).first()
        if not user:
            raise HTTPException(status_code=400, detail="Incorrect username or password")

        if not user.authenticate_user(data.password):
            raise HTTPException(status_code=400, detail="Incorrect username or password")

        token = Sessions.generate_token(user)
        return {"token": token}

    @staticmethod
    def generate_token(user: User):
        # Include some user information and an expiry time in the token
        to_encode = {"uuid": user.uuid.hex, "exp": datetime.utcnow() + timedelta(days=10)}
        return jwt.encode(to_encode, os.environ.get('SECRET_KEY'), algorithm=ALGORITHM)

    @staticmethod
    @logger.catch
    async def get_current_user(token: Annotated[HTTPAuthorizationCredentials, Depends(bearer)]):
        if token is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing token",
            )
        try:
            payload = jwt.decode(token.credentials, os.environ.get('SECRET_KEY'), algorithms=[ALGORITHM])
            uuid: str = payload.get("uuid")
            if uuid is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                )

            with Session(engine) as db:
                user = db.exec(select(User).where(User.uuid == uuid)).first()

        except InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

        return user
