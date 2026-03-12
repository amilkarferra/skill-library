import re


def generate_slug(display_name: str) -> str:
    lowered = display_name.lower().strip()
    hyphenated = lowered.replace(" ", "-")
    cleaned = re.sub(r"[^a-z0-9\-]", "", hyphenated)
    collapsed = re.sub(r"-+", "-", cleaned)
    return collapsed.strip("-")
