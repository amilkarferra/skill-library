from fastapi import APIRouter, Depends
import httpx
import jwt as pyjwt
from sqlalchemy.orm import Session

from app.shared.database import provide_database_session
from app.shared.exceptions import InvalidAzureAdTokenError, AccountDeactivatedError
from app.auth.schemas.ad_callback_request import AdCallbackRequest
from app.auth.schemas.token_response import TokenResponse
from app.auth import service as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/callback", response_model=TokenResponse)
def handle_ad_authentication_callback(
    body: AdCallbackRequest,
    database_session: Session = Depends(provide_database_session),
) -> TokenResponse:
    try:
        azure_ad_token_claims = auth_service.validate_azure_ad_token(body.ad_token)
        user, is_first_login = auth_service.find_or_create_user_from_ad_claims(
            database_session, azure_ad_token_claims
        )
    except (
        pyjwt.exceptions.DecodeError,
        pyjwt.exceptions.InvalidTokenError,
        pyjwt.exceptions.ExpiredSignatureError,
        httpx.HTTPError,
        KeyError,
        ValueError,
    ):
        raise InvalidAzureAdTokenError()

    is_account_deactivated = not user.is_active
    if is_account_deactivated:
        raise AccountDeactivatedError()

    access_token = auth_service.create_application_access_token(user.id)
    return TokenResponse(
        access_token=access_token,
        is_first_login=is_first_login,
    )
