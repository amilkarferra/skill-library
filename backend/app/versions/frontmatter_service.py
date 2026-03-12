import io
import zipfile

import yaml

from app.shared.constants import ZIP_FILE_MAGIC_BYTES


def _extract_markdown_from_zip(file_content: bytes) -> str:
    zip_buffer = io.BytesIO(file_content)
    with zipfile.ZipFile(zip_buffer, "r") as zip_file:
        for entry_name in zip_file.namelist():
            is_skill_markdown = entry_name.upper() == "SKILL.MD"
            if is_skill_markdown:
                return zip_file.read(entry_name).decode("utf-8")
    return ""


def _parse_yaml_frontmatter(markdown_text: str) -> dict[str, str]:
    is_missing_frontmatter = not markdown_text.startswith("---")
    if is_missing_frontmatter:
        return {}

    frontmatter_sections = markdown_text.split("---", 2)
    has_valid_structure = len(frontmatter_sections) >= 3
    if has_valid_structure:
        parsed = yaml.safe_load(frontmatter_sections[1])
        is_valid_dict = isinstance(parsed, dict)
        if is_valid_dict:
            return parsed
    return {}


def extract_frontmatter_from_skill_file(
    file_content: bytes,
) -> dict[str, str]:
    is_zip_file = file_content[:4] == ZIP_FILE_MAGIC_BYTES
    if is_zip_file:
        markdown_text = _extract_markdown_from_zip(file_content)
    else:
        markdown_text = file_content.decode("utf-8")

    frontmatter = _parse_yaml_frontmatter(markdown_text)
    return {
        "name": str(frontmatter.get("name", "")),
        "description": str(frontmatter.get("description", "")),
    }
