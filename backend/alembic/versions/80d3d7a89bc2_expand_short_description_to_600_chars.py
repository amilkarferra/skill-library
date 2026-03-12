"""expand_short_description_to_600_chars

Revision ID: 80d3d7a89bc2
Revises: f6bc2d0d910d
Create Date: 2026-03-12 17:34:05.206064

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '80d3d7a89bc2'
down_revision: Union[str, None] = 'f6bc2d0d910d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'skills',
        'short_description',
        existing_type=sa.VARCHAR(length=200),
        type_=sa.String(length=600),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        'skills',
        'short_description',
        existing_type=sa.String(length=600),
        type_=sa.VARCHAR(length=200),
        existing_nullable=False,
    )
