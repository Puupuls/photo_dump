import hashlib
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, UploadFile, HTTPException, Form, File
from sqlmodel import select
from starlette.responses import FileResponse

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
        photos = session.exec(
            select(Photo)
            .where(Photo.deleted_at == None)
            .order_by(Photo.date_taken.desc())
        ).all()
        return photos

    @staticmethod
    @router.put(
        "/",
        response_model=Photo,
        response_model_exclude={"id", "uploader_id", "creator_id"}
    )
    async def upload_photo(
            file: Annotated[UploadFile, File()],
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            modified_timestamp: Annotated[int, Form()] = None,
            session=Depends(get_db)
    ):
        if modified_timestamp is None:
            modified_timestamp = datetime.now().timestamp()
        else:
            modified_timestamp = int(modified_timestamp)/1000
        photo = Photo(
            filename_original=file.filename,
            mimetype=file.content_type,
            uploader_id=current_user.id,
            creator_id=current_user.id,
        )

        dst = Path(photo.get_file_path())
        with dst.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        os.utime(dst, (modified_timestamp, modified_timestamp))

        hash = hashlib.blake2b()
        with dst.open("rb") as buffer:
            for chunk in iter(lambda: buffer.read(4096), b""):
                hash.update(chunk)
        photo.hash = hash.hexdigest()

        existing_photo = session.exec(
            select(Photo)
            .where(Photo.hash == photo.hash)
            .where(Photo.deleted_at == None)
        ).first()
        if existing_photo:
            raise HTTPException(status_code=409, detail="Photo already exists")
        else:
            if photo.get_file_type() not in SUPPORTED_FILE_TYPES:
                raise HTTPException(status_code=415, detail="Unsupported file type")

            photo.update_metadata()

            session.add(photo)
            session.commit()
            return photo

    @staticmethod
    @router.get('/file/{photo_uuid}')
    async def get_photo_file(
            photo_uuid: str,
            session=Depends(get_db)
    ):
        photo = session.exec(select(Photo).where(Photo.uuid == UUID(photo_uuid))).first()

        file_path = photo.get_file_path()
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Photo not found")

        return FileResponse(file_path)
