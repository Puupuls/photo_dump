import os
from datetime import datetime, timedelta

import jwt
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import InvalidTokenError
from loguru import logger
from sqlmodel import select, Session, or_, and_
from starlette import status

from app.deps import get_db, engine
from app.models.api.login_request import LoginRequest
from app.models.api.login_response import LoginResponse
from app.models.db import User
from app.models.enums.enumUserRole import UserRole

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
    def generate_token(user: User):
        # Include some user information and an expiry time in the token
        to_encode = {"uuid": user.uuid.hex, "exp": datetime.utcnow() + timedelta(days=10)}
        return jwt.encode(to_encode, os.environ.get('SECRET_KEY'), algorithm=ALGORITHM)

    @staticmethod
    def get_current_user(
            role: UserRole = UserRole.VIEWER,
    ):
        async def check_cur_user(
            token: HTTPAuthorizationCredentials = Depends(bearer)
        ):
            if token is None:
                logger.error("Missing token")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing token.",
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

            logger.info(f"User {user.email} authenticated")

            if user.role.to_int() < role.to_int():
                logger.error(f"User {user.email} does not have permission to access this resource")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission denied",
                )

            return user
        return check_cur_user

    @staticmethod
    @router.post("/login")
    async def login(data: LoginRequest, session=Depends(get_db)) -> LoginResponse:
        user = session.exec(
            select(User).where(
                and_(
                    or_(
                        User.email == data.email
                    ),
                    User.disabled_at == None
                )
            )
        ).first()
        if not user:
            raise HTTPException(status_code=400, detail="Incorrect email or password")

        if not user.authenticate_user(data.password):
            raise HTTPException(status_code=400, detail="Incorrect email or password")

        response = LoginResponse(
            token=Sessions.generate_token(user)
        )
        user.last_login = datetime.utcnow()
        session.add(user)
        session.commit()
        return response