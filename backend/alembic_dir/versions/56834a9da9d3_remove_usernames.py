"""Remove usernames

Revision ID: 56834a9da9d3
Revises: 7d556398cce9
Create Date: 2024-06-17 13:20:26.614103

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '56834a9da9d3'
down_revision: Union[str, None] = '7d556398cce9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.drop_index('ix_user_username', table_name='user')
    op.create_index(op.f('ix_user_name'), 'user', ['name'], unique=True)
    op.drop_column('user', 'username')
    op.drop_column('user', 'is_admin')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('is_admin', sa.BOOLEAN(), autoincrement=False, nullable=False))
    op.add_column('user', sa.Column('username', sa.VARCHAR(), autoincrement=False, nullable=False))
    op.drop_index(op.f('ix_user_name'), table_name='user')
    op.create_index('ix_user_username', 'user', ['username'], unique=True)
    op.drop_column('user', 'name')
    # ### end Alembic commands ###
