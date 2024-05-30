"""Initial

Revision ID: c27ca5dbe148
Revises: 
Create Date: 2024-05-30 07:37:23.880814

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'c27ca5dbe148'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('space',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('modified_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_space_id'), 'space', ['id'], unique=True)
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('uuid', sqlmodel.sql.sqltypes.GUID(), nullable=False),
    sa.Column('username', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('hashed_password', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('last_login', sa.DateTime(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('modified_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    op.create_index(op.f('ix_user_id'), 'user', ['id'], unique=True)
    op.create_index(op.f('ix_user_username'), 'user', ['username'], unique=True)
    op.create_index(op.f('ix_user_uuid'), 'user', ['uuid'], unique=True)
    op.create_table('album',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_uuid', sa.Integer(), nullable=False),
    sa.Column('space_uuid', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('modified_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['space_uuid'], ['space.id'], ),
    sa.ForeignKeyConstraint(['user_uuid'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_album_id'), 'album', ['id'], unique=True)
    op.create_table('photo',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('space_uuid', sa.Integer(), nullable=False),
    sa.Column('user_uuid', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('modified_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['space_uuid'], ['space.id'], ),
    sa.ForeignKeyConstraint(['user_uuid'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_photo_id'), 'photo', ['id'], unique=True)
    op.create_table('spaceuser',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('space_uuid', sa.Integer(), nullable=False),
    sa.Column('user_uuid', sa.Integer(), nullable=False),
    sa.Column('is_owner', sa.Boolean(), nullable=False),
    sa.Column('can_manage', sa.Boolean(), nullable=False),
    sa.Column('can_edit', sa.Boolean(), nullable=False),
    sa.Column('can_upload', sa.Boolean(), nullable=False),
    sa.Column('can_create_albums', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('modified_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['space_uuid'], ['space.id'], ),
    sa.ForeignKeyConstraint(['user_uuid'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_spaceuser_id'), 'spaceuser', ['id'], unique=True)
    op.create_table('albumphoto',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('album_uuid', sa.Integer(), nullable=False),
    sa.Column('photo_uuid', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('modified_at', sa.DateTime(), nullable=False),
    sa.Column('is_cover', sa.Boolean(), nullable=False),
    sa.ForeignKeyConstraint(['album_uuid'], ['album.id'], ),
    sa.ForeignKeyConstraint(['photo_uuid'], ['photo.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_albumphoto_id'), 'albumphoto', ['id'], unique=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_albumphoto_id'), table_name='albumphoto')
    op.drop_table('albumphoto')
    op.drop_index(op.f('ix_spaceuser_id'), table_name='spaceuser')
    op.drop_table('spaceuser')
    op.drop_index(op.f('ix_photo_id'), table_name='photo')
    op.drop_table('photo')
    op.drop_index(op.f('ix_album_id'), table_name='album')
    op.drop_table('album')
    op.drop_index(op.f('ix_user_uuid'), table_name='user')
    op.drop_index(op.f('ix_user_username'), table_name='user')
    op.drop_index(op.f('ix_user_id'), table_name='user')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_table('user')
    op.drop_index(op.f('ix_space_id'), table_name='space')
    op.drop_table('space')
    # ### end Alembic commands ###