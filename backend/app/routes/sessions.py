import os
from datetime import datetime, timedelta
from typing import Annotated

import jwt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import InvalidTokenError
from loguru import logger
from sqlmodel import select, Session, or_
from starlette import status

from app.deps import get_db, engine
from app.models.db import User
from app.models.api.login_request import LoginRequest
from app.models.api.login_response import LoginResponse

ALGORITHM = "HS256"
bearer = HTTPBearer(
    auto_error=False
)


class Sessions:
    router = APIRouter(
        prefix="/auth",
        tags=["auth"]
    )

    @staticmethod
    @router.post("/login")
    async def login(data: LoginRequest, session=Depends(get_db)) -> LoginResponse:
        user = session.exec(select(User).where(or_(User.username == data.username, User.email == data.username))).first()
        if not user:
            raise HTTPException(status_code=400, detail="Incorrect username or password")

        if not user.authenticate_user(data.password):
            raise HTTPException(status_code=400, detail="Incorrect username or password")

        response = LoginResponse(
            token=Sessions.generate_token(user)
        )
        user.last_login = datetime.utcnow()
        session.add(user)
        session.commit()
        return response

    @staticmethod
    def generate_token(user: User):
        # Include some user information and an expiry time in the token
        to_encode = {"uuid": user.uuid.hex, "exp": datetime.utcnow() + timedelta(days=10)}
        return jwt.encode(to_encode, os.environ.get('SECRET_KEY'), algorithm=ALGORITHM)

    @staticmethod
    async def get_current_user(token: Annotated[HTTPAuthorizationCredentials, Depends(bearer)]):
        if token is None:
            logger.error("Missing token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing token",
            )
        try:
            payload = jwt.decode(token.credentials, os.environ.get('SECRET_KEY'), algorithms=[ALGORITHM])
            uuid: str = payload.get("uuid")
            if uuid is None:
                logger.error("Could not validate credentials")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                )

            with Session(engine) as db:
                user = db.exec(select(User).where(User.uuid == uuid)).first()

        except InvalidTokenError:
            logger.error("Invalid token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )

        if user is None:
            logger.error(f"User with uuid {uuid} not found")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        else:
            logger.info(f"User {user.username} authenticated")

        return user
