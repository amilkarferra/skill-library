from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func

from app.shared.database import Base
from app.collaboration.models.request_direction import RequestDirection
from app.collaboration.models.request_status import RequestStatus


class CollaborationRequest(Base):
    __tablename__ = "collaboration_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False, index=True)
    requester_id = Column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    direction = Column(Enum(RequestDirection), nullable=False)
    status = Column(
        Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False
    )
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime, nullable=True)
