import re


SEMVER_PATTERN = re.compile(r"^\d+\.\d+\.\d+$")


def is_valid_semver(version_string: str) -> bool:
    return SEMVER_PATTERN.match(version_string) is not None
