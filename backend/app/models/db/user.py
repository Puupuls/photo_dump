from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from passlib.context import CryptContext
from sqlmodel import SQLModel, Field

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str = Field()
    is_admin: bool = Field(default=False)
    last_login: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)

    def authenticate_user(self, plain_password: str):
        return pwd_context.verify(plain_password, self.hashed_password)

    @staticmethod
    def get_password_hash(password: str):
        return pwd_context.hash(password)