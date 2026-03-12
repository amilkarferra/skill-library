import enum


class RequestDirection(str, enum.Enum):
    INVITATION = "invitation"
    REQUEST = "request"
