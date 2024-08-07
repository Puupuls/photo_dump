"""Unique constraint on album files

Revision ID: 60f3f3768bc8
Revises: 70fc1536eca7
Create Date: 2024-07-07 09:40:12.391795

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '60f3f3768bc8'
down_revision: Union[str, None] = '70fc1536eca7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint(None, 'albumfile', ['album_id', 'file_id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'albumfile', type_='unique')
    # ### end Alembic commands ###
