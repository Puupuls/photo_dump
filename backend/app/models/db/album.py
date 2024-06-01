from datetime import datetime

from sqlmodel import Field, SQLModel


class Album(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    user_uuid: int = Field(foreign_key="user.id")
    dump_uuid: int = Field(foreign_key="dump.id")
    name: str = Field(default="")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)