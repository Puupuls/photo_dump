from pydantic import BaseModel


class UserCreateRequest(BaseModel):
    name: str
    email: str
    role: str
    password: str
