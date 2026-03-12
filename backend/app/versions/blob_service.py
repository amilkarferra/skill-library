import io
import zipfile
from datetime import datetime, timedelta, timezone

from azure.storage.blob import (
    BlobServiceClient,
    generate_blob_sas,
    BlobSasPermissions,
)

from app.shared.config import settings


def _get_blob_service_client() -> BlobServiceClient:
    return BlobServiceClient.from_connection_string(
        settings.azure_storage_connection_string
    )


def _build_blob_path(
    skill_id: int, version: str, filename: str
) -> str:
    return f"skills/{skill_id}/{version}/{filename}"


def _wrap_markdown_in_skill_zip(
    markdown_content: bytes, filename: str
) -> bytes:
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(
        zip_buffer, "w", zipfile.ZIP_DEFLATED
    ) as zip_file:
        zip_file.writestr(filename, markdown_content)
    return zip_buffer.getvalue()


def upload_skill_file(
    skill_id: int,
    version: str,
    file_content: bytes,
    filename: str,
) -> str:
    is_markdown_file = filename.lower().endswith(".md")
    if is_markdown_file:
        file_content = _wrap_markdown_in_skill_zip(
            file_content, filename
        )
        filename = filename.rsplit(".", 1)[0] + ".skill"

    blob_path = _build_blob_path(skill_id, version, filename)
    blob_service_client = _get_blob_service_client()
    container_client = blob_service_client.get_container_client(
        settings.azure_storage_container
    )
    blob_client = container_client.get_blob_client(blob_path)
    blob_client.upload_blob(file_content, overwrite=True)
    return blob_client.url


def generate_download_sas_url(blob_url: str) -> str:
    blob_service_client = _get_blob_service_client()
    account_name = blob_service_client.account_name

    url_after_container = blob_url.split(
        f"{settings.azure_storage_container}/"
    )[1]
    blob_name = url_after_container.split("?")[0]

    sas_token = generate_blob_sas(
        account_name=account_name,
        container_name=settings.azure_storage_container,
        blob_name=blob_name,
        account_key=blob_service_client.credential.account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    container_client = blob_service_client.get_container_client(
        settings.azure_storage_container
    )
    return f"{container_client.get_blob_client(blob_name).url}?{sas_token}"


def delete_blob(blob_url: str) -> None:
    blob_service_client = _get_blob_service_client()
    url_after_container = blob_url.split(
        f"{settings.azure_storage_container}/"
    )[1]
    blob_name = url_after_container.split("?")[0]

    container_client = blob_service_client.get_container_client(
        settings.azure_storage_container
    )
    blob_client = container_client.get_blob_client(blob_name)
    blob_client.delete_blob()
