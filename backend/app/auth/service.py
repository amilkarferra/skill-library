from datetime import datetime, timedelta, timezone

import httpx
import jwt as pyjwt
from jose import jwt
from sqlalchemy.orm import Session

from app.shared.config import settings
from app.shared.constants import JWT_ALGORITHM, AZURE_AD_SIGNING_ALGORITHM
from app.auth.models.user import User

AZURE_AD_MULTI_TENANT_OPENID_CONFIG_URL = "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration"


def validate_azure_ad_token(ad_token: str) -> dict[str, str]:
    openid_config = httpx.get(AZURE_AD_MULTI_TENANT_OPENID_CONFIG_URL).json()
    jwks_uri = openid_config["jwks_uri"]
    jwks_client = pyjwt.PyJWKClient(jwks_uri)
    signing_key = jwks_client.get_signing_key_from_jwt(ad_token)
    ad_token_claims = pyjwt.decode(
        ad_token,
        signing_key.key,
        algorithms=[AZURE_AD_SIGNING_ALGORITHM],
        audience=settings.azure_ad_client_id,
        options={"verify_exp": True},
    )
    return ad_token_claims


def create_application_access_token(user_id: int) -> str:
    expiration_time = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_access_expire_minutes
    )
    token_claims = {"sub": str(user_id), "exp": expiration_time}
    return jwt.encode(token_claims, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def _generate_unique_username(database_session: Session, email_prefix: str) -> str:
    candidate = email_prefix
    username_suffix_number = 1
    is_username_taken = (
        database_session.query(User)
        .filter(User.username == candidate)
        .first()
        is not None
    )
    while is_username_taken:
        candidate = f"{email_prefix}{username_suffix_number}"
        username_suffix_number += 1
        is_username_taken = (
            database_session.query(User)
            .filter(User.username == candidate)
            .first()
            is not None
    )
    return candidate


def _extract_azure_ad_subject_identifier(
    azure_ad_token_claims: dict[str, str]
) -> str:
    azure_ad_object_id = azure_ad_token_claims.get("oid")
    has_azure_ad_object_id = azure_ad_object_id is not None and azure_ad_object_id != ""
    if has_azure_ad_object_id:
        return azure_ad_object_id

    azure_ad_subject_identifier = azure_ad_token_claims.get("sub")
    has_azure_ad_subject_identifier = (
        azure_ad_subject_identifier is not None
        and azure_ad_subject_identifier != ""
    )
    if has_azure_ad_subject_identifier:
        return azure_ad_subject_identifier

    raise KeyError("Missing stable Azure AD subject identifier")


def _extract_user_email(azure_ad_token_claims: dict[str, str]) -> str:
    preferred_username = azure_ad_token_claims.get("preferred_username")
    has_preferred_username = (
        preferred_username is not None and preferred_username != ""
    )
    if has_preferred_username:
        return preferred_username

    email = azure_ad_token_claims.get("email")
    has_email = email is not None and email != ""
    if has_email:
        return email

    user_principal_name = azure_ad_token_claims.get("upn")
    has_user_principal_name = (
        user_principal_name is not None and user_principal_name != ""
    )
    if has_user_principal_name:
        return user_principal_name

    raise KeyError("Missing Azure AD email claim")


def _extract_display_name(
    azure_ad_token_claims: dict[str, str], email_prefix: str
) -> str:
    display_name = azure_ad_token_claims.get("name")
    has_display_name = display_name is not None and display_name != ""
    if has_display_name:
        return display_name

    return email_prefix


def find_or_create_user_from_ad_claims(
    database_session: Session, azure_ad_token_claims: dict[str, str]
) -> tuple[User, bool]:
    azure_ad_subject_identifier = _extract_azure_ad_subject_identifier(
        azure_ad_token_claims
    )
    existing_user = (
        database_session.query(User)
        .filter(User.azure_ad_object_id == azure_ad_subject_identifier)
        .first()
    )

    if existing_user:
        return existing_user, False

    email = _extract_user_email(azure_ad_token_claims)
    email_prefix = email.split("@")[0] if "@" in email else email
    display_name = _extract_display_name(azure_ad_token_claims, email_prefix)
    username = _generate_unique_username(database_session, email_prefix)

    new_user = User(
        azure_ad_object_id=azure_ad_subject_identifier,
        username=username,
        email=email,
        display_name=display_name,
    )
    database_session.add(new_user)
    database_session.commit()
    database_session.refresh(new_user)
    return new_user, True
