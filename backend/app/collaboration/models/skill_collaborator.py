from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.shared.database import Base


class SkillCollaborator(Base):
    __tablename__ = "skill_collaborators"

    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
