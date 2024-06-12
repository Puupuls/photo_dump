from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import select

from app.deps import get_db
from app.models.db import User
from app.routes.sessions import Sessions


class Users:
    router = APIRouter(
        prefix="/users",
        tags=["users"],
    )

    @staticmethod
    @router.get(
        "/me",
        response_model=User,
        response_model_exclude={"password_hash", "id"}
    )
    async def read_users_me(
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
    ):
        return current_user

    @staticmethod
    @router.get(
        "/",
        response_model=list[User],
        response_model_exclude={
            "hashed_password",
            "is_admin",
        }
    )
    async def list_users(
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        users = session.exec(
            select(User)
        ).all()
        return users
