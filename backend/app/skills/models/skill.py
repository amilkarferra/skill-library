from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func

from app.shared.constants import DISPLAY_NAME_MAX_LENGTH, SHORT_DESCRIPTION_MAX_LENGTH
from app.shared.database import Base
from app.skills.models.collaboration_mode import CollaborationMode


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    display_name = Column(String(DISPLAY_NAME_MAX_LENGTH), nullable=False)
    short_description = Column(String(SHORT_DESCRIPTION_MAX_LENGTH), nullable=False)
    long_description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    collaboration_mode = Column(
        Enum(CollaborationMode), default=CollaborationMode.CLOSED, nullable=False
    )
    current_version = Column(String(20), nullable=True)
    total_likes = Column(Integer, default=0, nullable=False)
    total_downloads = Column(Integer, default=0, nullable=False)
    total_comments = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    deactivated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
