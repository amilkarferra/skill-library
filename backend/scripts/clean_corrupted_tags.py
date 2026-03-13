import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import text
from app.shared.database import SessionLocal


CORRUPTED_TAG_PATTERN = "%[[]%"


def remove_corrupted_tags() -> None:
    database_session = SessionLocal()
    try:
        corrupted_tags = database_session.execute(
            text("SELECT id, name FROM tags WHERE name LIKE :pattern"),
            {"pattern": CORRUPTED_TAG_PATTERN},
        ).fetchall()

        has_no_corrupted_tags = len(corrupted_tags) == 0
        if has_no_corrupted_tags:
            print("No corrupted tags found.")
            return

        print(f"Found {len(corrupted_tags)} corrupted tag(s):")
        for tag in corrupted_tags:
            print(f"  id={tag.id}  name='{tag.name}'")

        corrupted_tag_ids = [tag.id for tag in corrupted_tags]

        deleted_skill_tags_count = 0
        for tag_id in corrupted_tag_ids:
            deleted_skill_tags_count += database_session.execute(
                text("DELETE FROM skill_tags WHERE tag_id = :tag_id"),
                {"tag_id": tag_id},
            ).rowcount

        deleted_tags_count = 0
        for tag_id in corrupted_tag_ids:
            deleted_tags_count += database_session.execute(
                text("DELETE FROM tags WHERE id = :tag_id"),
                {"tag_id": tag_id},
            ).rowcount

        database_session.commit()

        print(f"\nDeleted {deleted_skill_tags_count} skill_tag associations.")
        print(f"Deleted {deleted_tags_count} corrupted tags.")
    except Exception as error:
        database_session.rollback()
        raise error
    finally:
        database_session.close()


if __name__ == "__main__":
    remove_corrupted_tags()
