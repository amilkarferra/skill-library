import pytest
import yaml

from app.versions.frontmatter_service import extract_frontmatter_from_skill_file
from tests.conftest import (
    build_markdown_with_frontmatter,
    build_zip_with_skill_md,
    build_empty_zip,
)


EXPECTED_NAME = "My Skill"
EXPECTED_DESCRIPTION = "A great description"
EMPTY_STRING = ""
FRONTMATTER_NAME_KEY = "name"
FRONTMATTER_DESCRIPTION_KEY = "description"


@pytest.fixture
def markdown_with_frontmatter() -> bytes:
    text = build_markdown_with_frontmatter(EXPECTED_NAME, EXPECTED_DESCRIPTION)
    return text.encode("utf-8")


@pytest.fixture
def markdown_without_frontmatter() -> bytes:
    return b"# Just a Heading\nSome content here."


@pytest.fixture
def markdown_missing_name() -> bytes:
    text = f"---\ndescription: {EXPECTED_DESCRIPTION}\n---\n# Content"
    return text.encode("utf-8")


@pytest.fixture
def markdown_missing_description() -> bytes:
    text = f"---\nname: {EXPECTED_NAME}\n---\n# Content"
    return text.encode("utf-8")


@pytest.fixture
def markdown_with_yaml_parsing_to_none() -> bytes:
    text = "---\n\n---\n# Content"
    return text.encode("utf-8")


@pytest.fixture
def markdown_with_broken_yaml() -> bytes:
    text = "---\n: : invalid: yaml: [broken\n---\n# Content"
    return text.encode("utf-8")


@pytest.fixture
def zip_with_skill_md() -> bytes:
    markdown = build_markdown_with_frontmatter(EXPECTED_NAME, EXPECTED_DESCRIPTION)
    return build_zip_with_skill_md(markdown)


@pytest.fixture
def zip_without_skill_md() -> bytes:
    return build_empty_zip()


@pytest.fixture
def non_utf8_content() -> bytes:
    return b"\xff\xfe" + "---\nname: test\n---".encode("utf-16-le")


@pytest.fixture
def invalid_zip_content() -> bytes:
    return b"PK\x03\x04this-is-not-a-real-zip-file"


class TestExtractFrontmatterFromSkillFile:

    def test_frontmatter_extraction_returns_name_when_md_has_valid_frontmatter(
        self, markdown_with_frontmatter
    ):
        result = extract_frontmatter_from_skill_file(markdown_with_frontmatter)

        assert result[FRONTMATTER_NAME_KEY] == EXPECTED_NAME

    def test_frontmatter_extraction_returns_description_when_md_has_valid_frontmatter(
        self, markdown_with_frontmatter
    ):
        result = extract_frontmatter_from_skill_file(markdown_with_frontmatter)

        assert result[FRONTMATTER_DESCRIPTION_KEY] == EXPECTED_DESCRIPTION

    def test_frontmatter_extraction_returns_empty_name_when_md_has_no_frontmatter(
        self, markdown_without_frontmatter
    ):
        result = extract_frontmatter_from_skill_file(markdown_without_frontmatter)

        assert result[FRONTMATTER_NAME_KEY] == EMPTY_STRING

    def test_frontmatter_extraction_returns_empty_description_when_md_has_no_frontmatter(
        self, markdown_without_frontmatter
    ):
        result = extract_frontmatter_from_skill_file(markdown_without_frontmatter)

        assert result[FRONTMATTER_DESCRIPTION_KEY] == EMPTY_STRING

    def test_frontmatter_extraction_returns_name_when_zip_contains_skill_md(
        self, zip_with_skill_md
    ):
        result = extract_frontmatter_from_skill_file(zip_with_skill_md)

        assert result[FRONTMATTER_NAME_KEY] == EXPECTED_NAME

    def test_frontmatter_extraction_returns_description_when_zip_contains_skill_md(
        self, zip_with_skill_md
    ):
        result = extract_frontmatter_from_skill_file(zip_with_skill_md)

        assert result[FRONTMATTER_DESCRIPTION_KEY] == EXPECTED_DESCRIPTION

    def test_frontmatter_extraction_returns_empty_name_when_zip_lacks_skill_md(
        self, zip_without_skill_md
    ):
        result = extract_frontmatter_from_skill_file(zip_without_skill_md)

        assert result[FRONTMATTER_NAME_KEY] == EMPTY_STRING

    def test_frontmatter_extraction_returns_empty_description_when_zip_lacks_skill_md(
        self, zip_without_skill_md
    ):
        result = extract_frontmatter_from_skill_file(zip_without_skill_md)

        assert result[FRONTMATTER_DESCRIPTION_KEY] == EMPTY_STRING

    def test_frontmatter_extraction_returns_empty_name_when_name_field_missing(
        self, markdown_missing_name
    ):
        result = extract_frontmatter_from_skill_file(markdown_missing_name)

        assert result[FRONTMATTER_NAME_KEY] == EMPTY_STRING

    def test_frontmatter_extraction_returns_description_when_name_field_missing(
        self, markdown_missing_name
    ):
        result = extract_frontmatter_from_skill_file(markdown_missing_name)

        assert result[FRONTMATTER_DESCRIPTION_KEY] == EXPECTED_DESCRIPTION

    def test_frontmatter_extraction_returns_name_when_description_field_missing(
        self, markdown_missing_description
    ):
        result = extract_frontmatter_from_skill_file(markdown_missing_description)

        assert result[FRONTMATTER_NAME_KEY] == EXPECTED_NAME

    def test_frontmatter_extraction_returns_empty_description_when_description_field_missing(
        self, markdown_missing_description
    ):
        result = extract_frontmatter_from_skill_file(markdown_missing_description)

        assert result[FRONTMATTER_DESCRIPTION_KEY] == EMPTY_STRING

    def test_frontmatter_extraction_returns_empty_name_when_yaml_parses_to_none(
        self, markdown_with_yaml_parsing_to_none
    ):
        result = extract_frontmatter_from_skill_file(markdown_with_yaml_parsing_to_none)

        assert result[FRONTMATTER_NAME_KEY] == EMPTY_STRING

    def test_frontmatter_extraction_returns_empty_description_when_yaml_parses_to_none(
        self, markdown_with_yaml_parsing_to_none
    ):
        result = extract_frontmatter_from_skill_file(markdown_with_yaml_parsing_to_none)

        assert result[FRONTMATTER_DESCRIPTION_KEY] == EMPTY_STRING

    def test_frontmatter_extraction_raises_when_yaml_is_broken(
        self, markdown_with_broken_yaml
    ):
        with pytest.raises(yaml.YAMLError):
            extract_frontmatter_from_skill_file(markdown_with_broken_yaml)

    def test_frontmatter_extraction_raises_when_content_is_not_utf8(
        self, non_utf8_content
    ):
        with pytest.raises(UnicodeDecodeError):
            extract_frontmatter_from_skill_file(non_utf8_content)

    def test_frontmatter_extraction_raises_when_zip_is_invalid(
        self, invalid_zip_content
    ):
        with pytest.raises(Exception):
            extract_frontmatter_from_skill_file(invalid_zip_content)

    def test_frontmatter_extraction_handles_case_insensitive_skill_md_in_zip(self):
        markdown = build_markdown_with_frontmatter(EXPECTED_NAME, EXPECTED_DESCRIPTION)
        zip_bytes = build_zip_with_skill_md(markdown, entry_name="skill.md")

        result = extract_frontmatter_from_skill_file(zip_bytes)

        assert result[FRONTMATTER_NAME_KEY] == EXPECTED_NAME
