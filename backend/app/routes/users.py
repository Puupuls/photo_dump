from typing import Annotated

from fastapi import APIRouter, Depends

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
