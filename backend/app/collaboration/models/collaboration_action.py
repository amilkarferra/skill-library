import enum


class CollaborationAction(str, enum.Enum):
    ACCEPT = "accept"
    REJECT = "reject"
    CANCEL = "cancel"
