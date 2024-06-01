import hashlib
import os
from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile, HTTPException
from sqlmodel import select

from app.deps import get_db
from app.models.db import User, Photo
from app.models.db.photo import SUPPORTED_FILE_TYPES
from app.routes.sessions import Sessions


class Photos:
    router = APIRouter(
        prefix="/photos",
        tags=["photos"],
    )

    @staticmethod
    @router.get(
        "/",
        response_model=list[Photo],
        response_model_exclude={"id"}
    )
    async def list_photos(
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        photos = session.exec(select(Photo)).all()
        return photos

    @staticmethod
    @router.put(
        "/",
        response_model=Photo,
        response_model_exclude={"id", "uploader_id", "creator_id"}
    )
    async def upload_photo(
            file: UploadFile,
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        photo = Photo(
            filename_original=file.filename,
            content_type=file.content_type,
            uploader_id=current_user.id,
            creator_id=current_user.id
        )

        file_contents = await file.read()
        photo.hash = hashlib.blake2b(file_contents).hexdigest()

        existing_photo = session.exec(select(Photo).where(Photo.hash == photo.hash)).first()
        if existing_photo:
            raise HTTPException(status_code=409, detail="Photo already exists")
        else:
            if photo.get_file_type() not in SUPPORTED_FILE_TYPES:
                raise HTTPException(status_code=415, detail="Unsupported file type")

            with open(photo.get_file_path(), "wb") as f:
                f.write(file_contents)

            session.add(photo)
            session.commit()
            return photo
