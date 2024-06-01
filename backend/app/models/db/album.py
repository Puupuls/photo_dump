from datetime import datetime
from uuid import uuid4, UUID

from sqlmodel import Field, SQLModel


class Album(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    uuid: UUID = Field(index=True, unique=True, default_factory=uuid4)
    user_id: int = Field(foreign_key="user.id")
    name: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)