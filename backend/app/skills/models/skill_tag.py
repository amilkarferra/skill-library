from sqlalchemy import Column, Integer, ForeignKey

from app.shared.database import Base


class SkillTag(Base):
    __tablename__ = "skill_tags"

    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)
