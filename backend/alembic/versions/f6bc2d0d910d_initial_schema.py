"""initial schema

Revision ID: f6bc2d0d910d
Revises:
Create Date: 2026-03-11 19:33:51.164652

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'f6bc2d0d910d'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

FK_USERS_ID = "users.id"
FK_SKILLS_ID = "skills.id"
FK_SKILL_VERSIONS_ID = "skill_versions.id"
FK_TAGS_ID = "tags.id"
FK_CATEGORIES_ID = "categories.id"


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("azure_ad_object_id", sa.String(100), nullable=False),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("deactivated_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("azure_ad_object_id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_users_azure_ad_object_id", "users", ["azure_ad_object_id"])
    op.create_index("ix_users_username", "users", ["username"])

    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("slug", sa.String(50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )

    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_tags_name", "tags", ["name"])

    op.create_table(
        "skills",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("display_name", sa.String(150), nullable=False),
        sa.Column("short_description", sa.String(200), nullable=False),
        sa.Column("long_description", sa.Text(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column(
            "collaboration_mode",
            sa.Enum("closed", "open", name="collaborationmode"),
            nullable=False,
            server_default="closed",
        ),
        sa.Column("current_version", sa.String(20), nullable=True),
        sa.Column("total_likes", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("total_downloads", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("total_comments", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("deactivated_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.ForeignKeyConstraint(["owner_id"], [FK_USERS_ID]),
        sa.ForeignKeyConstraint(["category_id"], [FK_CATEGORIES_ID]),
    )
    op.create_index("ix_skills_owner_id", "skills", ["owner_id"])
    op.create_index("ix_skills_name", "skills", ["name"])

    op.create_table(
        "skill_tags",
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("skill_id", "tag_id"),
        sa.ForeignKeyConstraint(["skill_id"], [FK_SKILLS_ID]),
        sa.ForeignKeyConstraint(["tag_id"], [FK_TAGS_ID]),
    )

    op.create_table(
        "skill_versions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("version", sa.String(20), nullable=False),
        sa.Column("changelog", sa.Text(), nullable=False),
        sa.Column("blob_url", sa.String(500), nullable=False),
        sa.Column("file_size", sa.Integer(), nullable=False),
        sa.Column("uploaded_by_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("published", "pending_review", "rejected", name="versionstatus"),
            nullable=False,
            server_default="published",
        ),
        sa.Column("reviewed_by_id", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("skill_id", "version", name="uq_skill_version"),
        sa.ForeignKeyConstraint(["skill_id"], [FK_SKILLS_ID]),
        sa.ForeignKeyConstraint(["uploaded_by_id"], [FK_USERS_ID]),
        sa.ForeignKeyConstraint(["reviewed_by_id"], [FK_USERS_ID]),
    )
    op.create_index("ix_skill_versions_skill_id", "skill_versions", ["skill_id"])

    op.create_table(
        "downloads",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("version_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["skill_id"], [FK_SKILLS_ID]),
        sa.ForeignKeyConstraint(["version_id"], [FK_SKILL_VERSIONS_ID]),
        sa.ForeignKeyConstraint(["user_id"], [FK_USERS_ID]),
    )
    op.create_index("ix_downloads_skill_id", "downloads", ["skill_id"])

    op.create_table(
        "skill_likes",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("user_id", "skill_id"),
        sa.ForeignKeyConstraint(["user_id"], [FK_USERS_ID]),
        sa.ForeignKeyConstraint(["skill_id"], [FK_SKILLS_ID]),
    )

    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("comment_text", sa.String(2000), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["skill_id"], [FK_SKILLS_ID]),
        sa.ForeignKeyConstraint(["user_id"], [FK_USERS_ID]),
    )
    op.create_index("ix_comments_skill_id", "comments", ["skill_id"])

    op.create_table(
        "skill_collaborators",
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("skill_id", "user_id"),
        sa.ForeignKeyConstraint(["skill_id"], [FK_SKILLS_ID]),
        sa.ForeignKeyConstraint(["user_id"], [FK_USERS_ID]),
    )

    op.create_table(
        "collaboration_requests",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("requester_id", sa.Integer(), nullable=False),
        sa.Column(
            "direction",
            sa.Enum("invitation", "request", name="requestdirection"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("pending", "accepted", "rejected", "cancelled", name="requeststatus"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["skill_id"], [FK_SKILLS_ID]),
        sa.ForeignKeyConstraint(["requester_id"], [FK_USERS_ID]),
    )
    op.create_index("ix_collaboration_requests_skill_id", "collaboration_requests", ["skill_id"])
    op.create_index("ix_collaboration_requests_requester_id", "collaboration_requests", ["requester_id"])

    _seed_categories()


def _seed_categories() -> None:
    categories_table = sa.table(
        "categories",
        sa.column("name", sa.String),
        sa.column("slug", sa.String),
    )
    op.bulk_insert(categories_table, [
        {"name": "Frontend", "slug": "frontend"},
        {"name": "Backend", "slug": "backend"},
        {"name": "Testing", "slug": "testing"},
        {"name": "DevOps", "slug": "devops"},
        {"name": "Architecture", "slug": "architecture"},
        {"name": "Tooling", "slug": "tooling"},
    ])


def downgrade() -> None:
    op.drop_table("collaboration_requests")
    op.drop_table("skill_collaborators")
    op.drop_table("comments")
    op.drop_table("skill_likes")
    op.drop_table("downloads")
    op.drop_table("skill_versions")
    op.drop_table("skill_tags")
    op.drop_table("skills")
    op.drop_table("tags")
    op.drop_table("categories")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS collaborationmode")
    op.execute("DROP TYPE IF EXISTS versionstatus")
    op.execute("DROP TYPE IF EXISTS requestdirection")
    op.execute("DROP TYPE IF EXISTS requeststatus")
