from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import select

from app.deps import get_db
from app.models.api.user_create_request import UserCreateRequest
from app.models.api.user_update_request import UserUpdateRequest
from app.models.db import User
from app.models.enums.enumUserRole import UserRole
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
        response_model_exclude={
            "hashed_password",
            "uuid"
        }
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
            "uuid",
        }
    )
    async def list_users(
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        users = session.exec(
            select(User).order_by(
                User.name
            )
        ).all()
        return users

    @staticmethod
    @router.get(
        "/{user_id}",
        response_model=User,
        response_model_exclude={
            "hashed_password",
            "uuid",
        }
    )
    async def read_user(
            user_id: int,
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        user = session.exec(
            select(User)
            .where(User.id == user_id)
        ).first()
        return user

    @staticmethod
    @router.post(
        "/",
        response_model=User,
        response_model_exclude={
            "hashed_password",
            "uuid",
        }
    )
    async def create_user(
            user_request: UserCreateRequest,
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        user = User(
            name=user_request.name,
            email=user_request.email,
            role=UserRole[user_request.role],
            hashed_password=User.get_password_hash(user_request.password)
        )
        existing_user = session.exec(
            select(User)
            .where(User.email == user.email)
        ).first()
        if existing_user:
            raise ValueError("User already exists")
        session.add(user)
        session.commit()
        return user

    @staticmethod
    @router.put(
        "/{user_id}",
        response_model=User,
        response_model_exclude={
            "hashed_password",
            "uuid",
        }
    )
    async def update_user(
            user_id: int,
            user_data: UserUpdateRequest,
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        user = session.exec(
            select(User)
            .where(User.id == user_id)
        ).first()
        user.name = user_data.name
        user.email = user_data.email
        user.role = user_data.role
        if user_data.password:
            user.hashed_password = User.get_password_hash(user_data.password)
        session.add(user)
        session.commit()
        return user

    @staticmethod
    @router.delete(
        "/{user_id}",
        name="Disable or re-enable user",
        description="Disable or re-enable user access to system"
    )
    async def disable_user(
            user_id: int,
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        user = session.exec(
            select(User)
            .where(User.id == user_id)
        ).first()
        is_disabled = user.disabled_at is not None
        if user.disabled_at:
            user.disabled_at = None
        else:
            user.disabled_at = datetime.utcnow()
        session.add(user)
        session.commit()
        return {
            "message": "User deleted" if not is_disabled else "User restored"
        }
