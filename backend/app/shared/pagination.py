from typing import TypeVar, Generic

from app.shared.base_schema import CamelCaseSchema

T = TypeVar("T")


class PaginatedResponse(CamelCaseSchema, Generic[T]):
    items: list[T]
    total_count: int
    page: int
    page_size: int
    total_pages: int
