from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, desc

from app.deps import get_db
from app.models.api.album_create_request import AlbumCreateRequest
from app.models.db import User, File, AlbumFile, Album
from app.models.enums.enumUserRole import UserRole
from app.routes.sessions import Sessions


class Albums:
    router = APIRouter(
        prefix="/albums",
        tags=["albums"],
    )

    @staticmethod
    def get_current_album(
            album_uuid: str,
            session=Depends(get_db),
    ):
        album = session.exec(select(Album).where(Album.uuid == album_uuid)).first()
        if album is None:
            raise HTTPException(status_code=404, detail="Album not found")
        return album

    @staticmethod
    @router.get(
        '/',
        response_model=list[Album],
        response_model_exclude={"thumbnail_file_id"}
    )
    async def get_albums(
            session=Depends(get_db),
            current_user: User = Depends(Sessions.get_current_user(UserRole.GUEST)),
    ) -> list[Album]:
        albums = session.exec(select(Album).order_by(desc(Album.max_timestamp))).all()
        return albums

    @staticmethod
    @router.post(
        '/',
        response_model=Album,
        response_model_exclude={"thumbnail_file_id"}
    )
    async def create_album(
            album_info: AlbumCreateRequest,
            current_user: User = Depends(Sessions.get_current_user(UserRole.EDITOR)),
            session=Depends(get_db),
    ):
        album = Album(
            created_at=datetime.now(),
            user_id=current_user.id,
            name=album_info.name,
        )
        session.add(album)
        for file_uuid in album_info.files:
            file = session.exec(select(File).where(File.uuid == file_uuid)).first()
            album_file = AlbumFile(
                album_id=album.id,
                file_id=file.id,
            )
            session.add(album_file)
        session.commit()
        album.process_meta()
        session.commit()

        album = session.exec(select(Album).where(Album.id == album.id)).first()
        return album

    @staticmethod
    @router.get(
        '/{album_uuid}',
        response_model=Album,
        response_model_exclude={"thumbnail_file_id"}
    )
    async def get_album(
            album: Album = Depends(get_current_album),
            current_user: User = Depends(Sessions.get_current_user(UserRole.VIEWER)),
            session=Depends(get_db),
    ):
        return album

    @staticmethod
    @router.put(
        '/{album_uuid}',
        response_model=Album,
        response_model_exclude={"thumbnail_file_id"}
    )
    async def update_album(
            album_info: AlbumCreateRequest,
            album: Album = Depends(get_current_album),
            current_user: User = Depends(Sessions.get_current_user(UserRole.EDITOR)),
            session=Depends(get_db),
    ):
        album.name = album_info.name
        album.modified_at = datetime.now()
        session.commit()

        return album

    @staticmethod
    @router.delete(
        '/{album_uuid}',
    )
    async def delete_album(
            album: Album = Depends(get_current_album),
            current_user: User = Depends(Sessions.get_current_user(UserRole.EDITOR)),
            session=Depends(get_db),
    ):
        if current_user.role.to_int() < UserRole.EDITOR.to_int():
            raise HTTPException(status_code=403, detail="Permission denied")

        album_files = session.exec(select(AlbumFile).where(AlbumFile.album_id == album.id)).all()
        for album_file in album_files:
            session.delete(album_file)
        session.delete(album)
        session.commit()

        return {
            "status": "success",
            "message": "Album deleted"
        }

    @staticmethod
    @router.post(
        '/{album_uuid}/files',
    )
    async def add_files(
            files: list[UUID],
            album: Album = Depends(get_current_album),
            current_user: User = Depends(Sessions.get_current_user(UserRole.EDITOR)),
            session=Depends(get_db),
    ):
        album_file_ids = session.exec(select(AlbumFile.file_id).where(AlbumFile.album_id == album.id)).all()
        for file_uuid in files:
            file = session.exec(select(File).where(File.uuid == file_uuid)).first()
            if not file:
                raise HTTPException(status_code=404, detail="File not found")
            # Check if it already exists
            if file.id in album_file_ids:
                continue
            album_file = AlbumFile(
                album_id=album.id,
                file_id=file.id,
            )
            session.add(album_file)
            album_file_ids.append(file.id)

        session.commit()
        album.process_meta()
        session.commit()

        return {
            "status": "success",
            "message": "Files added to album"
        }

    @staticmethod
    @router.delete(
        '/{album_uuid}/files',
    )
    async def remove_files(
            files: list[UUID],
            album: Album = Depends(get_current_album),
            current_user: User = Depends(Sessions.get_current_user(UserRole.EDITOR)),
            session=Depends(get_db),
    ):
        for file_uuid in files:
            file = session.exec(select(File).where(File.uuid == file_uuid)).first()
            if file:
                album_file = session.exec(
                    select(AlbumFile).where(
                        AlbumFile.album_id == album.id,
                        AlbumFile.file_id == file.id
                    )
                ).first()
                if album_file:
                    session.delete(album_file)
        album.process_meta()
        session.commit()

        return {
            "status": "success",
            "message": "Files added to album"
        }