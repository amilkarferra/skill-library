from app.skills.slug import generate_slug


class TestGenerateSlug:

    def test_generates_slug_from_display_name(self):
        slug = generate_slug("Angular Senior Developer")
        expected_slug = "angular-senior-developer"

        assert slug == expected_slug

    def test_removes_special_characters(self):
        slug = generate_slug("My Cool Tool!")
        expected_slug = "my-cool-tool"

        assert slug == expected_slug

    def test_collapses_multiple_hyphens(self):
        slug = generate_slug("React -- Hooks -- Helper")
        expected_slug = "react-hooks-helper"

        assert slug == expected_slug

    def test_strips_leading_and_trailing_hyphens(self):
        slug = generate_slug("  -My Skill-  ")
        expected_slug = "my-skill"

        assert slug == expected_slug
