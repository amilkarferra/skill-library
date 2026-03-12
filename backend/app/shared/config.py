import os
from pathlib import Path

from pydantic_settings import BaseSettings

_ENV_FILE_PATH = Path(__file__).resolve().parent.parent.parent / ".env"


def _read_key_vault_url() -> str | None:
    from_environment = os.getenv("KEY_VAULT_URL")
    if from_environment:
        return from_environment

    if not _ENV_FILE_PATH.exists():
        return None

    for line in _ENV_FILE_PATH.read_text(encoding="utf-8").splitlines():
        stripped_line = line.strip()
        has_key_vault_url = stripped_line.startswith("KEY_VAULT_URL=")
        if has_key_vault_url:
            raw_value = stripped_line.split("=", 1)[1].strip()
            return raw_value.strip('"').strip("'")

    return None


_key_vault_url = _read_key_vault_url()
if _key_vault_url:
    from app.shared.key_vault_resolver import populate_environment_from_key_vault

    populate_environment_from_key_vault(_key_vault_url)


class Settings(BaseSettings):
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
