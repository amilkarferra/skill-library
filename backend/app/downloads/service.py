from sqlalchemy import update
from sqlalchemy.orm import Session

from app.downloads.models.download import Download
from app.skills.models.skill import Skill
from app.versions.models.skill_version import SkillVersion
from app.versions.models.version_status import VersionStatus


def record_download(
    database_session: Session,
    skill_id: int,
    version_id: int,
    user_id: int | None,
) -> None:
    new_download = Download(
        skill_id=skill_id,
        version_id=version_id,
        user_id=user_id,
    )
    database_session.add(new_download)
    _increment_total_downloads(database_session, skill_id)
    database_session.commit()


def _increment_total_downloads(database_session: Session, skill_id: int) -> None:
    atomic_increment = update(Skill).where(Skill.id == skill_id).values(
        total_downloads=Skill.total_downloads + 1
    )
    database_session.execute(atomic_increment)


def get_latest_published_version(
    database_session: Session, skill_id: int
) -> SkillVersion | None:
    return (
        database_session.query(SkillVersion)
        .filter(
            SkillVersion.skill_id == skill_id,
            SkillVersion.status == VersionStatus.PUBLISHED,
            SkillVersion.is_active == True,
        )
        .order_by(SkillVersion.created_at.desc())
        .first()
    )
