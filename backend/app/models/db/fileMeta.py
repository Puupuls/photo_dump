from sqlmodel import SQLModel, Field, Relationship


class FileMeta(SQLModel, table=True):
    id: int = Field(default_factory=None, primary_key=True, index=True, unique=True, nullable=False)
    key: str = Field()
    value: str = Field()

    file_id: int = Field(foreign_key="file.id")
    file: list["File"] = Relationship(back_populates="meta")
