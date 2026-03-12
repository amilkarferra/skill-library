from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from app.shared.database import Base
from app.versions.models.version_status import VersionStatus


class SkillVersion(Base):
    __tablename__ = "skill_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    version = Column(String(20), nullable=False)
    changelog = Column(Text, nullable=False)
    blob_url = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(
        Enum(VersionStatus), default=VersionStatus.PUBLISHED, nullable=False
    )
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("skill_id", "version", name="uq_skill_version"),
    )
