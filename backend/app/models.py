from uuid import UUID, uuid4

from passlib.context import CryptContext
from sqlmodel import Field, SQLModel, create_engine, Session, select
from typing import Optional, List
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str = Field()
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)

    def authenticate_user(self, plain_password: str):
        return pwd_context.verify(plain_password, self.hashed_password)

    @staticmethod
    def get_password_hash(password: str):
        return pwd_context.hash(password)


class Space(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    name: str = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)


class SpaceUser(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    space_uuid: int = Field(foreign_key="space.id")
    user_uuid: int = Field(foreign_key="user.id")
    is_owner: bool = Field(default=False)
    can_manage: bool = Field(default=False)
    can_edit: bool = Field(default=False)
    can_upload: bool = Field(default=False)
    can_create_albums: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)


class Photo(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    space_uuid: int = Field(foreign_key="space.id")
    uploader_uuid: int = Field(foreign_key="user.id")
    creator_uuid: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)


class Album(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    user_uuid: int = Field(foreign_key="user.id")
    space_uuid: int = Field(foreign_key="space.id")
    name: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)


class AlbumPhoto(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    album_uuid: int = Field(foreign_key="album.id")
    photo_uuid: int = Field(foreign_key="photo.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)
    is_cover: bool = Field(default=False)
