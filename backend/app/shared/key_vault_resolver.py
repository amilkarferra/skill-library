import os
import re
from urllib.parse import quote_plus

import pyodbc
from azure.identity import ChainedTokenCredential, DefaultAzureCredential, InteractiveBrowserCredential
from azure.keyvault.secrets import SecretClient

_KEY_VAULT_SECRET_TO_ENVIRONMENT_VARIABLE = {
    "jwt-secret": "JWT_SECRET",
    "database-url": "DATABASE_URL",
    "storage-connection-string": "AZURE_STORAGE_CONNECTION_STRING",
    "azure-ad-tenant-id": "AZURE_AD_TENANT_ID",
    "azure-ad-client-id": "AZURE_AD_CLIENT_ID",
    "azure-storage-container": "AZURE_STORAGE_CONTAINER",
}

_DATABASE_URL_SECRET_NAME = "database-url"
_SQLALCHEMY_PYODBC_PREFIX = "mssql+pyodbc:///?odbc_connect="
_ODBC_DRIVER_PATTERN = re.compile(r"ODBC Driver \d+ for SQL Server")
_ODBC_DRIVER_IN_CONNECTION_STRING_PATTERN = re.compile(r"Driver=\{[^}]+\}", re.IGNORECASE)


def _find_best_available_odbc_driver() -> str | None:
    installed_drivers = pyodbc.drivers()
    sql_server_drivers = [driver for driver in installed_drivers if _ODBC_DRIVER_PATTERN.match(driver)]
    has_no_sql_server_driver = len(sql_server_drivers) == 0
    if has_no_sql_server_driver:
        return None

    sql_server_drivers.sort(reverse=True)
    return sql_server_drivers[0]


def _replace_odbc_driver_with_available(raw_odbc_string: str) -> str:
    best_available_driver = _find_best_available_odbc_driver()
    has_no_available_driver = best_available_driver is None
    if has_no_available_driver:
        return raw_odbc_string

    return _ODBC_DRIVER_IN_CONNECTION_STRING_PATTERN.sub(f"Driver={{{best_available_driver}}}", raw_odbc_string)


def _is_raw_odbc_connection_string(connection_value: str) -> bool:
    return connection_value.startswith("Driver=") or connection_value.startswith("driver=")


def _convert_odbc_to_sqlalchemy_url(raw_odbc_string: str) -> str:
    odbc_with_available_driver = _replace_odbc_driver_with_available(raw_odbc_string)
    encoded_odbc_string = quote_plus(odbc_with_available_driver)
    return f"{_SQLALCHEMY_PYODBC_PREFIX}{encoded_odbc_string}"


def _normalize_secret_value(secret_name: str, raw_value: str) -> str:
    is_database_url = secret_name == _DATABASE_URL_SECRET_NAME
    is_raw_odbc = _is_raw_odbc_connection_string(raw_value)
    needs_conversion = is_database_url and is_raw_odbc
    if needs_conversion:
        return _convert_odbc_to_sqlalchemy_url(raw_value)

    return raw_value


def _build_azure_credential() -> ChainedTokenCredential:
    default_credential = DefaultAzureCredential(exclude_shared_token_cache_credential=True)
    interactive_credential = InteractiveBrowserCredential()
    return ChainedTokenCredential(default_credential, interactive_credential)


def populate_environment_from_key_vault(vault_url: str) -> None:
    credential = _build_azure_credential()
    secret_client = SecretClient(vault_url=vault_url, credential=credential)

    for secret_name, environment_variable_name in _KEY_VAULT_SECRET_TO_ENVIRONMENT_VARIABLE.items():
        is_already_set = os.getenv(environment_variable_name) is not None
        if is_already_set:
            continue

        secret = secret_client.get_secret(secret_name)
        normalized_value = _normalize_secret_value(secret_name, secret.value)
        os.environ[environment_variable_name] = normalized_value
