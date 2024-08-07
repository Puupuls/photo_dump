from datetime import datetime

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class AlbumFile(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    album_id: int = Field(foreign_key="album.id")
    file_id: int = Field(foreign_key="file.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)
    is_cover: bool = Field(default=False)

    # Unique index on album_id and file_id
    __table_args__ = (UniqueConstraint("album_id", "file_id"),)