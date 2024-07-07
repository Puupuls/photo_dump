import hashlib
import io
import os
import shutil
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, UploadFile, HTTPException, Form, File as fFile
from sqlmodel import select
from starlette.responses import FileResponse, StreamingResponse

from app.deps import get_db
from app.models.api.files_download_request import FilesDownloadRequest
from app.models.db import User, File, AlbumFile, Album
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
            current_user: Annotated[User, Depends(Sessions.get_current_user(UserRole.VIEWER))],
            album_uuid: str = None,
            session=Depends(get_db)
    ):
        query = select(File).order_by(File.timeline_date.desc())
        if album_uuid:
            query = query.join(AlbumFile).join(Album).where(Album.uuid == UUID(album_uuid))
        files = session.exec(
            query
        ).all()
        return files

    @staticmethod
    @router.post(
        "/",
        response_model=File,
        response_model_exclude={"id", "uploader_id", "creator_id", 'meta'}
    )
    async def upload_file(
            file: Annotated[UploadFile, fFile()],
            current_user: Annotated[User, Depends(Sessions.get_current_user(UserRole.EDITOR))],
            album_uuid: str = None,
            modified_timestamp: Annotated[int, Form()] = None,
            session=Depends(get_db)
    ):
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
            if album_uuid:
                album = session.exec(select(Album).where(Album.uuid == UUID(album_uuid))).first()
                if not album:
                    raise HTTPException(status_code=404, detail="Album not found")
                album_file = AlbumFile(
                    album_id=album.id,
                    file_id=existing_file.id
                )
                # CHeck if not already in album
                if not session.exec(
                        select(AlbumFile)
                        .where(AlbumFile.album_id == album_file.album_id)
                        .where(AlbumFile.file_id == album_file.file_id)
                ).first():
                    session.add(album_file)
                    session.commit()
                    album.process_meta()
                    session.commit()
            raise HTTPException(status_code=409, detail="File already exists")
        else:
            if dbFile.file_extension not in SUPPORTED_FILE_TYPES:
                raise HTTPException(status_code=415, detail="Unsupported file type")

            dbFile.update_metadata()

            session.add(dbFile)
            if album_uuid:
                album = session.exec(select(Album).where(Album.uuid == UUID(album_uuid))).first()
                if not album:
                    raise HTTPException(status_code=404, detail="Album not found")
                album_file = AlbumFile(
                    album_id=album.id,
                    file_id=dbFile.id
                )
                if not session.exec(
                        select(AlbumFile)
                        .where(AlbumFile.album_id == album.id)
                        .where(AlbumFile.file_id == dbFile.id)
                ).first():
                    session.add(album_file)
            session.commit()
            return dbFile

    @staticmethod
    @router.post(
        '/download'
    )
    async def get_files_file(
            data: FilesDownloadRequest,
            session=Depends(get_db),
            current_user: User = Depends(Sessions.get_current_user(UserRole.GUEST)),
    ):
        files = session.exec(select(File).where(File.uuid.in_(data.files))).all()
        file_paths = [file.get_file_path() for file in files]
        for file_path in file_paths:
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found")
        if len(file_paths) == 1:
            return FileResponse(
                file_paths[0],
                content_disposition_type="attachment",
                filename=files[0].filename_original,
                headers={
                    "Content-Type": files[0].mimetype,
                    "Last-Modified": files[0].created_at.isoformat(),
                }
            )
        else:
            zip_bytes_io = io.BytesIO()
            with zipfile.ZipFile(zip_bytes_io, 'w', zipfile.ZIP_DEFLATED) as zipped:
                for file in files:
                    zipped.write(file.get_file_path(), file.filename_original)
            zip_bytes_io.seek(0)
            response = StreamingResponse(
                iter([zip_bytes_io.getvalue()]),
                media_type="application/x-zip-compressed",
                headers={
                    "Content-Disposition": f"attachment; filename=files.zip",
                    "Content-Length": str(zip_bytes_io.getbuffer().nbytes)
                }
            )
            zip_bytes_io.close()
            return response

    @staticmethod
    @router.get(
        '/{file_uuid}',
    )
    async def get_file_file(
            file_uuid: str,
            download: bool = False,
            session=Depends(get_db),
            current_user: User = Depends(Sessions.get_current_user(UserRole.GUEST)),
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
            current_user: Annotated[User, Depends(Sessions.get_current_user(UserRole.EDITOR))],
            session=Depends(get_db)
    ):
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
        for album_file in albums:
            album = session.exec(select(Album).where(Album.id == album_file.album_id)).first()
            album.process_meta()
            session.delete(album_file)
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
            current_user: Annotated[User, Depends(Sessions.get_current_user(UserRole.EDITOR))],
            session=Depends(get_db)
    ):
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
                    album = session.exec(select(Album).where(Album.id == album.album_id)).first()
                    album.process_meta()
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
