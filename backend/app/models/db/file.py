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
from sqlmodel import Field, SQLModel

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

    width: int = Field(default=0)
    height: int = Field(default=0)
    date_taken: datetime = Field(default=None, nullable=True)

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
        if self.file_extension in ["jpg", "jpeg", "png", "gif", "webp", "bmp"]:
            self.file_type = FileType.file
            image = Image.open(file_path)
            self.width = image.width
            self.height = image.height
            try:
                e_image = ExifImage(file_path)
                if e_image.has_exif:
                    if e_image.get('datetime_original', None):
                        self.date_taken = datetime.strptime(e_image.datetime_original, "%Y:%m:%d %H:%M:%S")
                    elif e_image.get('datetime_digitized', None):
                        self.date_taken = datetime.strptime(e_image.datetime_digitized, "%Y:%m:%d %H:%M:%S")
            except Exception as e:
                logger.error(f"Error reading exif data: {e}")
        elif self.file_extension == "svg":
            self.file_type = FileType.file
            try:
                with open(file_path, "r") as f:
                    svg = minidom.parse(f)
                    width = svg.getElementsByTagName("svg")[0].getAttribute("width")
                    height = svg.getElementsByTagName("svg")[0].getAttribute("height")
                    self.width = int(width.replace("px", ""))
                    self.height = int(height.replace("px", ""))
            except Exception as e:
                logger.error(f"Error reading svg data: {e}")

        # Get video dimensions
        elif self.file_extension in ["webm", "mp4", "mov", "avi", "mkv", "mpg", "mpeg"]:
            self.file_type = FileType.video
            cap = cv2.VideoCapture(file_path)
            self.width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            self.height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            cap.release()

        if self.date_taken is None:
            self.date_taken = datetime.utcfromtimestamp(os.path.getmtime(file_path))
        self.modified_at = datetime.utcnow()

        if self.date_taken is None:
            self.date_taken = datetime.utcnow()
