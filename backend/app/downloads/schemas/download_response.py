from app.shared.base_schema import CamelCaseSchema


class DownloadUrlResponse(CamelCaseSchema):
    download_url: str
    file_name: str
    file_size: int
