from sqlalchemy.orm import Session

from app.downloads.models.download import Download
from app.skills.models.skill import Skill
from app.versions.models.skill_version import SkillVersion
from app.versions.models.version_status import VersionStatus


def record_download(
    database_session: Session,
    skill: Skill,
    version: SkillVersion,
    user_id: int | None,
) -> None:
    new_download = Download(
        skill_id=skill.id,
        version_id=version.id,
        user_id=user_id,
    )
    database_session.add(new_download)
    skill.total_downloads = skill.total_downloads + 1
    database_session.commit()


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
