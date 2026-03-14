from sqlalchemy.orm import Session

from app.auth.models.user import User
from app.collaboration.models.skill_collaborator import SkillCollaborator
from app.skills.models.collaboration_mode import CollaborationMode
from app.skills.models.skill import Skill
from app.versions.models.skill_version import SkillVersion
from app.versions.models.version_status import VersionStatus
from app.versions.models.version_review_action import VersionReviewAction
from app.versions.schemas.pending_version_response import PendingVersionResponse
from app.versions.schemas.version_response import VersionResponse
from app.shared.exceptions import ForbiddenActionError


def _is_user_owner_or_collaborator(
    database_session: Session, skill: Skill, user: User
) -> bool:
    is_owner = skill.owner_id == user.id
    if is_owner:
        return True

    collaborator = (
        database_session.query(SkillCollaborator)
        .filter(
            SkillCollaborator.skill_id == skill.id,
            SkillCollaborator.user_id == user.id,
        )
        .first()
    )
    is_collaborator = collaborator is not None
    return is_collaborator


def _determine_version_status(
    database_session: Session, skill: Skill, user: User
) -> VersionStatus:
    is_privileged_user = _is_user_owner_or_collaborator(
        database_session, skill, user
    )
    if is_privileged_user:
        return VersionStatus.PUBLISHED

    is_open_collaboration = (
        skill.collaboration_mode == CollaborationMode.OPEN
    )
    if is_open_collaboration:
        return VersionStatus.PENDING_REVIEW

    raise ForbiddenActionError("Skill is not open for external contributions")


def find_duplicate_version(
    database_session: Session, skill_id: int, version_str: str
) -> SkillVersion | None:
    return (
        database_session.query(SkillVersion)
        .filter(
            SkillVersion.skill_id == skill_id,
            SkillVersion.version == version_str,
        )
        .first()
    )


def create_version(
    database_session: Session,
    skill: Skill,
    user: User,
    version_str: str,
    changelog: str,
    blob_url: str,
    file_size: int,
) -> SkillVersion:
    status = _determine_version_status(
        database_session, skill, user
    )

    new_version = SkillVersion(
        skill_id=skill.id,
        version=version_str,
        changelog=changelog,
        blob_url=blob_url,
        file_size=file_size,
        uploaded_by_id=user.id,
        status=status,
    )
    database_session.add(new_version)

    is_published = status == VersionStatus.PUBLISHED
    if is_published:
        skill.current_version = version_str

    database_session.commit()
    database_session.refresh(new_version)
    return new_version


def build_version_response(
    database_session: Session, version: SkillVersion
) -> VersionResponse:
    uploader = (
        database_session.query(User)
        .filter(User.id == version.uploaded_by_id)
        .first()
    )
    reviewer = None
    has_reviewer = version.reviewed_by_id is not None
    if has_reviewer:
        reviewer = (
            database_session.query(User)
            .filter(User.id == version.reviewed_by_id)
            .first()
        )

    return VersionResponse(
        id=version.id,
        version=version.version,
        changelog=version.changelog,
        file_size=version.file_size,
        status=version.status.value,
        uploaded_by_username=uploader.username,
        reviewed_by_username=(
            reviewer.username if reviewer else None
        ),
        created_at=version.created_at,
    )


def list_skill_versions(
    database_session: Session, skill_id: int
) -> list[VersionResponse]:
    versions = (
        database_session.query(SkillVersion)
        .filter(
            SkillVersion.skill_id == skill_id,
            SkillVersion.is_active == True,
            SkillVersion.status == VersionStatus.PUBLISHED,
        )
        .order_by(SkillVersion.created_at.desc())
        .all()
    )
    return [
        build_version_response(database_session, version)
        for version in versions
    ]


def review_version(
    database_session: Session,
    skill: Skill,
    version: SkillVersion,
    action: str,
    reviewer: User,
) -> SkillVersion:
    is_approve_action = action == VersionReviewAction.APPROVE
    if is_approve_action:
        version.status = VersionStatus.PUBLISHED
        skill.current_version = version.version

    is_reject_action = not is_approve_action
    if is_reject_action:
        version.status = VersionStatus.REJECTED

    version.reviewed_by_id = reviewer.id
    database_session.commit()
    database_session.refresh(version)
    return version


def find_version_by_number(
    database_session: Session,
    skill_id: int,
    version_str: str,
) -> SkillVersion | None:
    return (
        database_session.query(SkillVersion)
        .filter(
            SkillVersion.skill_id == skill_id,
            SkillVersion.version == version_str,
            SkillVersion.is_active == True,
        )
        .first()
    )


def list_pending_versions_for_skill_owner(
    database_session: Session,
    owner_id: int,
) -> list[PendingVersionResponse]:
    rows = (
        database_session.query(SkillVersion, Skill)
        .join(Skill, Skill.id == SkillVersion.skill_id)
        .filter(
            Skill.owner_id == owner_id,
            SkillVersion.status == VersionStatus.PENDING_REVIEW,
            SkillVersion.is_active == True,
        )
        .all()
    )
    return [_build_pending_version_response(database_session, version, skill) for version, skill in rows]


def _build_pending_version_response(
    database_session: Session,
    version: SkillVersion,
    skill: Skill,
) -> PendingVersionResponse:
    version_response = build_version_response(database_session, version)
    return PendingVersionResponse(
        skill_slug=skill.name,
        **version_response.model_dump(by_alias=False),
    )
