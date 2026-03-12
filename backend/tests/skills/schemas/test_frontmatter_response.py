from app.skills.schemas.frontmatter_response import FrontmatterResponse


EXTRACTED_NAME = "My Skill"
EXTRACTED_DESCRIPTION = "A great skill"
CAMEL_CASE_NAME_KEY = "extractedName"
CAMEL_CASE_DESCRIPTION_KEY = "extractedDescription"
SNAKE_CASE_NAME_KEY = "extracted_name"
SNAKE_CASE_DESCRIPTION_KEY = "extracted_description"


class TestFrontmatterResponseSerialization:

    def test_serialization_uses_camel_case_for_name_when_serialized_by_alias(self):
        response = FrontmatterResponse(
            extracted_name=EXTRACTED_NAME,
            extracted_description=EXTRACTED_DESCRIPTION,
        )

        serialized = response.model_dump(by_alias=True)

        assert CAMEL_CASE_NAME_KEY in serialized

    def test_serialization_uses_camel_case_for_description_when_serialized_by_alias(self):
        response = FrontmatterResponse(
            extracted_name=EXTRACTED_NAME,
            extracted_description=EXTRACTED_DESCRIPTION,
        )

        serialized = response.model_dump(by_alias=True)

        assert CAMEL_CASE_DESCRIPTION_KEY in serialized

    def test_serialization_preserves_name_value_when_serialized_by_alias(self):
        response = FrontmatterResponse(
            extracted_name=EXTRACTED_NAME,
            extracted_description=EXTRACTED_DESCRIPTION,
        )

        serialized = response.model_dump(by_alias=True)

        assert serialized[CAMEL_CASE_NAME_KEY] == EXTRACTED_NAME

    def test_serialization_preserves_description_value_when_serialized_by_alias(self):
        response = FrontmatterResponse(
            extracted_name=EXTRACTED_NAME,
            extracted_description=EXTRACTED_DESCRIPTION,
        )

        serialized = response.model_dump(by_alias=True)

        assert serialized[CAMEL_CASE_DESCRIPTION_KEY] == EXTRACTED_DESCRIPTION

    def test_serialization_excludes_snake_case_name_when_serialized_by_alias(self):
        response = FrontmatterResponse(
            extracted_name=EXTRACTED_NAME,
            extracted_description=EXTRACTED_DESCRIPTION,
        )

        serialized = response.model_dump(by_alias=True)

        has_snake_case_key = SNAKE_CASE_NAME_KEY in serialized
        assert not has_snake_case_key

    def test_serialization_excludes_snake_case_description_when_serialized_by_alias(self):
        response = FrontmatterResponse(
            extracted_name=EXTRACTED_NAME,
            extracted_description=EXTRACTED_DESCRIPTION,
        )

        serialized = response.model_dump(by_alias=True)

        has_snake_case_key = SNAKE_CASE_DESCRIPTION_KEY in serialized
        assert not has_snake_case_key

    def test_serialization_allows_population_by_snake_case_name(self):
        response = FrontmatterResponse(
            extracted_name=EXTRACTED_NAME,
            extracted_description=EXTRACTED_DESCRIPTION,
        )

        assert response.extracted_name == EXTRACTED_NAME

    def test_serialization_allows_population_by_camel_case_alias(self):
        response = FrontmatterResponse(
            **{
                CAMEL_CASE_NAME_KEY: EXTRACTED_NAME,
                CAMEL_CASE_DESCRIPTION_KEY: EXTRACTED_DESCRIPTION,
            }
        )

        assert response.extracted_name == EXTRACTED_NAME
        assert response.extracted_description == EXTRACTED_DESCRIPTION
