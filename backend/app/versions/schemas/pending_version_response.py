from app.versions.schemas.version_response import VersionResponse


class PendingVersionResponse(VersionResponse):
    skill_slug: str
