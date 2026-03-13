import os

from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

from app.shared.odbc_connection_normalizer import convert_odbc_to_sqlalchemy_url, is_raw_odbc_connection_string

_KEY_VAULT_SECRET_TO_ENVIRONMENT_VARIABLE = {
    "jwt-secret": "JWT_SECRET",
    "database-url": "DATABASE_URL",
    "storage-connection-string": "AZURE_STORAGE_CONNECTION_STRING",
}

_DATABASE_URL_SECRET_NAME = "database-url"


def _normalize_secret_value(secret_name: str, raw_value: str) -> str:
    is_database_url = secret_name == _DATABASE_URL_SECRET_NAME
    is_raw_odbc = is_raw_odbc_connection_string(raw_value)
    needs_conversion = is_database_url and is_raw_odbc
    if needs_conversion:
        return convert_odbc_to_sqlalchemy_url(raw_value)

    return raw_value


def populate_environment_from_key_vault(vault_url: str) -> None:
    credential = DefaultAzureCredential()
    secret_client = SecretClient(vault_url=vault_url, credential=credential)

    for secret_name, environment_variable_name in _KEY_VAULT_SECRET_TO_ENVIRONMENT_VARIABLE.items():
        is_already_set = os.getenv(environment_variable_name) is not None
        if is_already_set:
            continue

        secret = secret_client.get_secret(secret_name)
        normalized_value = _normalize_secret_value(secret_name, secret.value)
        os.environ[environment_variable_name] = normalized_value
