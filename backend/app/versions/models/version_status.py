import enum


class VersionStatus(str, enum.Enum):
    PUBLISHED = "published"
    PENDING_REVIEW = "pending_review"
    REJECTED = "rejected"
