import io
import zipfile
from posixpath import basename as posix_basename

import yaml

from app.shared.constants import ZIP_FILE_MAGIC_BYTES

SKILL_MARKDOWN_FILENAME = "SKILL.MD"


def _is_skill_markdown_entry(entry_name: str) -> bool:
    entry_basename = posix_basename(entry_name).upper()
    return entry_basename == SKILL_MARKDOWN_FILENAME


def _find_shallowest_skill_markdown(entry_names: list[str]) -> str | None:
    matching_entries = [name for name in entry_names if _is_skill_markdown_entry(name)]
    has_no_matches = len(matching_entries) == 0
    if has_no_matches:
        return None
    matching_entries.sort(key=lambda name: name.count("/"))
    return matching_entries[0]


def _extract_markdown_from_zip(file_content: bytes) -> str:
    zip_buffer = io.BytesIO(file_content)
    with zipfile.ZipFile(zip_buffer, "r") as zip_file:
        shallowest_entry = _find_shallowest_skill_markdown(zip_file.namelist())
        has_no_skill_markdown = shallowest_entry is None
        if has_no_skill_markdown:
            return ""
        return zip_file.read(shallowest_entry).decode("utf-8")


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


def _convert_kebab_case_to_title(kebab_name: str) -> str:
    return " ".join(word.capitalize() for word in kebab_name.split("-"))


def _build_display_name(raw_name: str) -> str:
    is_empty = len(raw_name.strip()) == 0
    if is_empty:
        return ""
    is_kebab_case = "-" in raw_name and raw_name == raw_name.lower()
    if is_kebab_case:
        return _convert_kebab_case_to_title(raw_name)
    return raw_name


def _find_first_markdown_entry(entry_names: list[str]) -> str | None:
    markdown_entries = [name for name in entry_names if name.lower().endswith(".md")]
    has_no_matches = len(markdown_entries) == 0
    if has_no_matches:
        return None
    markdown_entries.sort(key=lambda name: name.count("/"))
    return markdown_entries[0]


def _extract_any_markdown_from_zip(file_content: bytes) -> str:
    zip_buffer = io.BytesIO(file_content)
    with zipfile.ZipFile(zip_buffer, "r") as zip_file:
        first_entry = _find_first_markdown_entry(zip_file.namelist())
        has_no_markdown = first_entry is None
        if has_no_markdown:
            return ""
        return zip_file.read(first_entry).decode("utf-8")


def _strip_yaml_frontmatter(markdown_text: str) -> str:
    is_missing_frontmatter = not markdown_text.startswith("---")
    if is_missing_frontmatter:
        return markdown_text

    frontmatter_sections = markdown_text.split("---", 2)
    has_valid_structure = len(frontmatter_sections) >= 3
    if has_valid_structure:
        return frontmatter_sections[2].strip()
    return markdown_text


def extract_markdown_body_from_skill_file(file_content: bytes) -> str:
    is_zip_file = file_content[:4] == ZIP_FILE_MAGIC_BYTES
    if is_zip_file:
        raw_markdown = _extract_any_markdown_from_zip(file_content)
    else:
        raw_markdown = file_content.decode("utf-8")

    return _strip_yaml_frontmatter(raw_markdown)


def extract_frontmatter_from_skill_file(
    file_content: bytes,
) -> dict[str, str]:
    is_zip_file = file_content[:4] == ZIP_FILE_MAGIC_BYTES
    if is_zip_file:
        markdown_text = _extract_markdown_from_zip(file_content)
    else:
        markdown_text = file_content.decode("utf-8")

    frontmatter = _parse_yaml_frontmatter(markdown_text)
    raw_name = str(frontmatter.get("name", ""))
    raw_description = str(frontmatter.get("description", ""))
    return {
        "name": _build_display_name(raw_name),
        "description": raw_description,
    }
