from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    EDITOR = "EDITOR"
    VIEWER = "VIEWER"

    def to_int(self):
        return {
            UserRole.ADMIN: 10,
            UserRole.EDITOR: 5,
            UserRole.VIEWER: 1,
        }[self]
