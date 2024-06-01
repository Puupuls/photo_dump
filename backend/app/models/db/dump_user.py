from datetime import datetime

from sqlmodel import Field, SQLModel


class DumpUser(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    dump_uuid: int = Field(foreign_key="dump.id")
    user_uuid: int = Field(foreign_key="user.id")
    is_owner: bool = Field(default=False)
    can_manage: bool = Field(default=False)
    can_edit: bool = Field(default=False)
    can_upload: bool = Field(default=False)
    can_create_albums: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)