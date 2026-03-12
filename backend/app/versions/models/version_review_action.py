import enum


class VersionReviewAction(str, enum.Enum):
    APPROVE = "approve"
    REJECT = "reject"
