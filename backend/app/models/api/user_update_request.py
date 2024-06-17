from typing import Optional

from pydantic import BaseModel


class UserUpdateRequest(BaseModel):
    username: str
    email: str
    role: str
    password: Optional[str]
