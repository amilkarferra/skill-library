import re
from urllib.parse import quote_plus

import pyodbc

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


def is_raw_odbc_connection_string(connection_value: str) -> bool:
    return connection_value.startswith("Driver=") or connection_value.startswith("driver=")


def convert_odbc_to_sqlalchemy_url(raw_odbc_string: str) -> str:
    odbc_with_available_driver = _replace_odbc_driver_with_available(raw_odbc_string)
    encoded_odbc_string = quote_plus(odbc_with_available_driver)
    return f"{_SQLALCHEMY_PYODBC_PREFIX}{encoded_odbc_string}"
