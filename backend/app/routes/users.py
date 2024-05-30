from typing import Annotated

from fastapi import APIRouter, Depends

from app.deps import get_db
from app.models import User
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
    )
    async def read_users_me(
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
    ):
        return current_user
