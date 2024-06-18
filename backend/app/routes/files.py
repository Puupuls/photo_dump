import hashlib
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, UploadFile, HTTPException, Form, File as fFile
from sqlmodel import select
from starlette.requests import Request
from starlette.responses import FileResponse

from app.deps import get_db
from app.models.db import User, File, AlbumFile
from app.models.db.file import SUPPORTED_FILE_TYPES
from app.models.enums.enumUserRole import UserRole
from app.routes.sessions import Sessions


class Files:
    router = APIRouter(
        prefix="/files",
        tags=["files"],
    )

    @staticmethod
    @router.get(
        "/",
        response_model=list[File],
        response_model_exclude={"id"}
    )
    async def list_files(
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        files = session.exec(
            select(File)
            .order_by(File.timeline_date.desc())
        ).all()
        return files

    @staticmethod
    @router.put(
        "/",
        response_model=File,
        response_model_exclude={"id", "uploader_id", "creator_id", 'meta'}
    )
    async def upload_file(
            file: Annotated[UploadFile, fFile()],
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            modified_timestamp: Annotated[int, Form()] = None,
            session=Depends(get_db)
    ):
        if current_user.role.to_int() < UserRole.EDITOR.to_int():
            raise HTTPException(status_code=403, detail="Permission denied")

        if modified_timestamp is None:
            modified_timestamp = datetime.now().timestamp()
        else:
            modified_timestamp = int(modified_timestamp)/1000
        dbFile = File(
            filename_original=file.filename,
            mimetype=file.content_type,
            uploader_id=current_user.id,
            creator_id=current_user.id,
        )

        dst = Path(dbFile.get_file_path())
        with dst.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        # TODO: Sanitize svg files, removing js to prevent XSS
        if dbFile.file_extension == "svg":
            pass
        os.utime(dst, (modified_timestamp, modified_timestamp))

        hash = hashlib.blake2b()
        with dst.open("rb") as buffer:
            for chunk in iter(lambda: buffer.read(4096), b""):
                hash.update(chunk)
        dbFile.hash = hash.hexdigest()

        existing_file = session.exec(
            select(File)
            .where(File.hash == dbFile.hash)
        ).first()
        if existing_file:
            raise HTTPException(status_code=409, detail="File already exists")
        else:
            if dbFile.file_extension not in SUPPORTED_FILE_TYPES:
                raise HTTPException(status_code=415, detail="Unsupported file type")

            dbFile.update_metadata()

            session.add(dbFile)
            session.commit()
            return dbFile

    @staticmethod
    @router.get(
        '/{file_uuid}'
    )
    async def get_file_file(
            file_uuid: str,
            download: bool = False,
            session=Depends(get_db),
            request=Request
    ):
        file = session.exec(select(File).where(File.uuid == UUID(file_uuid))).first()

        file_path = file.get_file_path()
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        resp = FileResponse(
            file_path,
            content_disposition_type="attachment" if download else "inline",
            filename=file.filename_original,
            headers={
                "Content-Type": file.mimetype,
                "Last-Modified": file.created_at.isoformat(),
            }
        )
        return resp

    @staticmethod
    @router.delete(
        '/{file_uuid}'
    )
    async def delete_file(
            file_uuid: str,
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        if current_user.role.to_int() < UserRole.EDITOR.to_int():
            raise HTTPException(status_code=403, detail="Permission denied")

        file = session.exec(select(File).where(File.uuid == UUID(file_uuid))).first()
        if current_user.role.to_int() < UserRole.ADMIN.to_int():
            if file.creator_id != current_user.id or file.uploader_id != current_user.id:
                raise HTTPException(status_code=403, detail="Permission denied")
        if not file:
            raise HTTPException(status_code=404, detail="File not found")
        metadata = file.meta
        for meta in metadata:
            session.delete(meta)
        albums = session.exec(select(AlbumFile).where(AlbumFile.file_id == file.id)).all()
        for album in albums:
            session.delete(album)
        session.delete(file)
        os.remove(file.get_file_path())
        session.commit()
        return {
            "status": "success",
            "message": "File deleted"
        }

    @staticmethod
    @router.delete(
        '/',
    )
    async def delete_files(
            files: list[str],
            current_user: Annotated[User, Depends(Sessions.get_current_user)],
            session=Depends(get_db)
    ):
        if current_user.role.to_int() < UserRole.EDITOR.to_int():
            raise HTTPException(status_code=403, detail="Permission denied")

        permission_error = set()
        file_error = set()
        generic_error = set()

        for file_uuid in files:
            try:
                file = session.exec(select(File).where(File.uuid == UUID(file_uuid))).first()

                if not file:
                    file_error.add(file_uuid)
                    continue
                if current_user.role.to_int() < UserRole.ADMIN.to_int():
                    if file.creator_id != current_user.id or file.uploader_id != current_user.id:
                        permission_error.add(file_uuid)
                        continue
                metadata = file.meta
                for meta in metadata:
                    session.delete(meta)
                albums = session.exec(select(AlbumFile).where(AlbumFile.file_id == file.id)).all()
                for album in albums:
                    session.delete(album)
                session.delete(file)
                session.commit()
                os.remove(file.get_file_path())

            except Exception as e:
                print(e)
                generic_error.add(file_uuid)

        return {
            "message": "Files deleted",
            "permission_missing_for": permission_error,
            "files_not_found": file_error,
            "generic_error": generic_error
        }
