from datetime import datetime

from sqlmodel import Field, SQLModel


class Photo(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    dump_uuid: int = Field(foreign_key="dump.id")
    uploader_uuid: int = Field(foreign_key="user.id")
    creator_uuid: int = Field(foreign_key="user.id")
    hash: str = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)