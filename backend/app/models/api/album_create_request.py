from typing import Optional

from pydantic import BaseModel


class AlbumCreateRequest(BaseModel):
    name: str
    files: Optional[list[str]] = None
