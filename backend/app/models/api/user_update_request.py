from typing import Optional

from pydantic import BaseModel


class UserUpdateRequest(BaseModel):
    username: str
    email: str
    password: Optional[str]
