from pydantic import BaseModel


class FilesDownloadRequest(BaseModel):
    files: list[str]
