from datetime import datetime
from typing import Optional
from uuid import uuid4, UUID

from pydantic import computed_field
from sqlmodel import Field, SQLModel, select


class Album(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    uuid: UUID = Field(index=True, unique=True, default_factory=uuid4)
    user_id: int = Field(foreign_key="user.id")
    name: str = Field(default="")
    min_timestamp: Optional[datetime] = Field(default=None)
    max_timestamp: Optional[datetime] = Field(default=None)
    thumbnail_file_id: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)

    @computed_field
    def thumbnail_file_uuid(self) -> str:
        from app.deps import get_db
        if self.thumbnail_file_id is None:
            return None
        session = next(get_db())
        from app.models.db import File
        file = session.exec(select(File).where(File.id == self.thumbnail_file_id)).first()
        return file.uuid

    @computed_field
    def thumbnail_src(self) -> str:
        from app.deps import get_db
        if self.thumbnail_file_id is None:
            return None
        session = next(get_db())
        from app.models.db import File
        file = session.exec(select(File).where(File.id == self.thumbnail_file_id)).first()
        return file.src

    def process_meta(self):
        from app.deps import get_db
        from app.models.db import AlbumFile, File
        session = next(get_db())
        self.min_timestamp = session.exec(
            select(File.timeline_date).where(
                AlbumFile.album_id == self.id
            ).order_by(
                File.timeline_date
            ).limit(1)
        ).first()
        self.max_timestamp = session.exec(
            select(File.timeline_date).where(
                AlbumFile.album_id == self.id
            ).order_by(
                File.timeline_date.desc()
            ).limit(1)
        ).first()
        if not self.thumbnail_file_id:
            self.thumbnail_file_id = session.exec(
                select(AlbumFile.file_id).where(
                    AlbumFile.album_id == self.id
                ).order_by(
                    AlbumFile.file_id
                ).limit(1)
            ).first()