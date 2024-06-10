import os
from datetime import datetime
from enum import Enum
from uuid import uuid4, UUID
from PIL import Image, ExifTags
from exif import Image as ExifImage
import cv2
import mimetypes
from sqlmodel import Field, SQLModel

mimetypes.init()
SUPPORTED_FILE_TYPES = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg",
                        "webm", "mp4", "mov", "avi", "mkv", "mpg", "mpeg"]


class PhotoType(str, Enum):
    photo = "photo"
    video = "video"


class Photo(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    uuid: UUID = Field(index=True, unique=True, default_factory=uuid4)
    filename_original: str = Field()
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

    def get_file_type(self):
        extension = mimetypes.guess_extension(self.mimetype)
        if extension is None:
            extension = self.filename_original.split(".")[-1]
        return extension.strip(".").lower()

    @staticmethod
    def get_file_dir() -> str:
        return "photos"

    def get_file_path(self) -> str:
        """
        Makes sure that needed directory exists and
        creates file path from uuid and file type
        :return: file path as string
        """
        os.makedirs("photos", exist_ok=True)
        return f"{Photo.get_file_dir()}/{self.uuid.hex}.{self.get_file_type()}"

    def update_metadata(self) -> None:
        """
        Updates photo metadata from exif data
        """
        file_path = self.get_file_path()
        # Check exif for images
        if self.get_file_type() in ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]:
            image = Image.open(file_path)
            self.width = image.width
            self.height = image.height
            e_image = ExifImage(file_path)
            if e_image:
                if e_image.get('datetime_original'):
                    self.date_taken = datetime.strptime(e_image.datetime_original, "%Y:%m:%d %H:%M:%S")
                elif e_image.get('datetime_digitized'):
                    self.date_taken = datetime.strptime(e_image.datetime_digitized, "%Y:%m:%d %H:%M:%S")


        # Get video dimensions
        if self.get_file_type() in ["webm", "mp4", "mov", "avi", "mkv", "mpg", "mpeg"]:
            cap = cv2.VideoCapture(file_path)
            self.width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            self.height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            cap.release()

        if self.date_taken is None:
            self.date_taken = datetime.utcfromtimestamp(os.path.getmtime(file_path))
        self.modified_at = datetime.utcnow()

        if self.date_taken is None:
            self.date_taken = datetime.utcnow()
