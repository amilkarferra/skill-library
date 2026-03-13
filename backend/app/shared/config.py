import os
from pathlib import Path

from pydantic_settings import BaseSettings

from app.shared.odbc_connection_normalizer import convert_odbc_to_sqlalchemy_url, is_raw_odbc_connection_string

_ENV_FILE_PATH = Path(__file__).resolve().parent.parent.parent / ".env"


def _load_env_file_into_environment() -> None:
    if not _ENV_FILE_PATH.exists():
        return

    for line in _ENV_FILE_PATH.read_text(encoding="utf-8").splitlines():
        stripped_line = line.strip()
        is_empty_or_comment = not stripped_line or stripped_line.startswith("#")
        if is_empty_or_comment:
            continue

        has_no_separator = "=" not in stripped_line
        if has_no_separator:
            continue

        key, raw_value = stripped_line.split("=", 1)
        clean_value = raw_value.strip().strip('"').strip("'")
        is_already_set = os.getenv(key) is not None
        if is_already_set:
            continue

        os.environ[key] = clean_value


def _normalize_database_url_if_needed() -> None:
    raw_database_url = os.getenv("DATABASE_URL")
    has_no_database_url = raw_database_url is None
    if has_no_database_url:
        return

    needs_conversion = is_raw_odbc_connection_string(raw_database_url)
    if needs_conversion:
        os.environ["DATABASE_URL"] = convert_odbc_to_sqlalchemy_url(raw_database_url)


_load_env_file_into_environment()

_key_vault_url = os.getenv("KEY_VAULT_URL")
if _key_vault_url:
    from app.shared.key_vault_resolver import populate_environment_from_key_vault

    populate_environment_from_key_vault(_key_vault_url)

_normalize_database_url_if_needed()


class Settings(BaseSettings):
    environment: str = "development"
    key_vault_url: str | None = None
    database_url: str
    jwt_secret: str
    jwt_access_expire_minutes: int = 30
    azure_ad_tenant_id: str = "common"
    azure_ad_client_id: str
    azure_storage_connection_string: str
    azure_storage_container: str = "skills"
    max_file_size_bytes: int = 52_428_800

    class Config:
        env_file = ".env"


settings = Settings()
