import os
from datetime import datetime
from uuid import uuid4, UUID

from sqlmodel import Field, SQLModel, Relationship

SUPPORTED_FILE_TYPES = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg",
                        "webm", "mp4", "mov", "avi", "mkv", "mpg", "mpeg"]


class Photo(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    uuid: UUID = Field(index=True, unique=True, default_factory=uuid4)
    filename_original: str = Field()
    content_type: str = Field()
    uploader_id: int = Field(foreign_key="user.id")
    creator_id: int = Field(foreign_key="user.id")
    deleted_at: datetime = Field(default=None, nullable=True)
    hash: str = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)

    def get_file_type(self):
        extension = self.filename_original.split(".")[-1]
        return extension

    def get_file_path(self):
        os.makedirs("photos", exist_ok=True)
        return f"photos/{self.uuid.hex}.{self.get_file_type()}"
