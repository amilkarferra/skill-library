"""revert_short_description_to_200_chars

Revision ID: fc555e87467b
Revises: 80d3d7a89bc2
Create Date: 2026-03-13 07:56:42.410276

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'fc555e87467b'
down_revision: Union[str, None] = '80d3d7a89bc2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'skills',
        'short_description',
        existing_type=sa.String(length=600),
        type_=sa.VARCHAR(length=200),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        'skills',
        'short_description',
        existing_type=sa.VARCHAR(length=200),
        type_=sa.String(length=600),
        existing_nullable=False,
    )
