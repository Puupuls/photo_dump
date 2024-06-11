import mimetypes
import os
from datetime import datetime
from enum import Enum
from uuid import uuid4, UUID
from xml.dom import minidom

import cv2
from PIL import Image
from exif import Image as ExifImage
from loguru import logger
from pydantic import computed_field
from sqlmodel import Field, SQLModel, Relationship

mimetypes.init()
SUPPORTED_FILE_TYPES = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg",
                        "webm", "mp4", "mov", "avi", "mkv", "mpg", "mpeg"]


class FileType(str, Enum):
    file = "file"
    video = "video"


class File(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    uuid: UUID = Field(index=True, unique=True, default_factory=uuid4)
    filename_original: str = Field()
    file_type: FileType = Field()
    mimetype: str = Field()
    uploader_id: int = Field(foreign_key="user.id")
    creator_id: int = Field(foreign_key="user.id")
    deleted_at: datetime = Field(default=None, nullable=True)
    hash: str = Field()

    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)

    timeline_date: datetime = Field(default=None, nullable=True)

    meta: list['FileMeta'] = Relationship(back_populates="file")

    @computed_field
    def meta_dict(self) -> dict:
        return {
            self.meta[i].key: self.meta[i].value
            for i in range(len(self.meta))
        }

    @computed_field
    def src(self) -> str:
        return f"/files/file/{self.uuid.hex}"

    @computed_field
    def file_extension(self) -> str:
        extension = mimetypes.guess_extension(self.mimetype)
        if extension is None:
            extension = self.filename_original.split(".")[-1]
        return extension.strip(".").lower()

    @staticmethod
    def get_file_dir() -> str:
        os.makedirs("files", exist_ok=True)
        return "files"

    def set_meta(self, key: str, value) -> None:
        existing = self.get_meta(key, None)
        if existing is None:
            from app.models.db.fileMeta import FileMeta
            self.meta.append(FileMeta(file_id=self.id, key=key, value=str(value)))
        else:
            for meta in self.meta:
                if meta.key == key:
                    meta.value = str(value)

    def get_meta(self, key: str, default) -> str:
        for meta in self.meta:
            if meta.key == key:
                val = meta.value
                if default and not isinstance(val, type(default)):
                    return type(default)(val)
                return meta.value
        return default

    def get_file_path(self) -> str:
        """
        Makes sure that needed directory exists and
        creates file path from uuid and file type
        :return: file path as string
        """
        return f"{File.get_file_dir()}/{self.uuid.hex}.{self.file_extension}"

    def update_metadata(self) -> None:
        """
        Updates file metadata from exif data
        """
        file_path = self.get_file_path()
        # Check exif for images
        date_taken = None
        if self.file_extension in ["jpg", "jpeg", "png", "gif", "webp", "bmp"]:
            self.file_type = FileType.file
            image = Image.open(file_path)
            self.set_meta("width", image.width)
            self.set_meta("height", image.height)
            try:
                e_image = ExifImage(file_path)
                if e_image.has_exif:
                    for tag in e_image.list_all():
                        if tag == 'flash':
                            self.set_meta(tag, e_image.get(tag).flash_fired)
                        elif isinstance(e_image.get(tag), Enum):
                            self.set_meta(tag, e_image.get(tag).name)
                        else:
                            self.set_meta(tag, e_image.get(tag))
                    if e_image.get('datetime_original', None):
                        date_taken = datetime.strptime(e_image.datetime_original, "%Y:%m:%d %H:%M:%S")

                    elif e_image.get('datetime_digitized', None):
                        date_taken = datetime.strptime(e_image.datetime_digitized, "%Y:%m:%d %H:%M:%S")
            except Exception as e:
                logger.error(f"Error reading exif data: {e}")
        elif self.file_extension == "svg":
            self.file_type = FileType.file
            try:
                with open(file_path, "r") as f:
                    svg = minidom.parse(f)
                    width = svg.getElementsByTagName("svg")[0].getAttribute("width")
                    height = svg.getElementsByTagName("svg")[0].getAttribute("height")
                    self.set_meta("width", width)
                    self.set_meta("height", height)
            except Exception as e:
                logger.error(f"Error reading svg data: {e}")

        # Get video dimensions
        elif self.file_extension in ["webm", "mp4", "mov", "avi", "mkv", "mpg", "mpeg"]:
            self.file_type = FileType.video
            cap = cv2.VideoCapture(file_path)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            self.set_meta("width", width)
            self.set_meta("height", height)
            cap.release()

        if date_taken is None:
            date_taken = datetime.utcfromtimestamp(os.path.getmtime(file_path))

        if date_taken is None:
            date_taken = datetime.utcnow()

        self.set_meta("date_taken", date_taken)
        self.timeline_date = date_taken
        self.modified_at = datetime.utcnow()
