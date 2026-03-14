"""replace_unique_name_with_filtered_unique_index

Revision ID: 809fe5bbf80e
Revises: fc555e87467b
Create Date: 2026-03-14 12:25:02.835942

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '809fe5bbf80e'
down_revision: Union[str, None] = 'fc555e87467b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

UNIQUE_CONSTRAINT_NAME = "uq_skills_name"
FILTERED_INDEX_NAME = "ix_skills_name_active_unique"
TABLE_NAME = "skills"
COLUMN_NAME = "name"


def upgrade() -> None:
    op.drop_constraint(UNIQUE_CONSTRAINT_NAME, TABLE_NAME, type_="unique")
    op.execute(
        f"CREATE UNIQUE INDEX {FILTERED_INDEX_NAME} "
        f"ON {TABLE_NAME} ({COLUMN_NAME}) "
        f"WHERE is_active = 1"
    )


def downgrade() -> None:
    op.execute(f"DROP INDEX {FILTERED_INDEX_NAME} ON {TABLE_NAME}")
    op.create_unique_constraint(UNIQUE_CONSTRAINT_NAME, TABLE_NAME, [COLUMN_NAME])
