import traceback

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.shared.config import settings

from app.auth.router import router as auth_router
from app.skills.router import router as skills_router
from app.versions.router import router as versions_router
from app.downloads.router import router as downloads_router
from app.social.likes_router import router as likes_router
from app.social.comments_router import router as comments_router
from app.collaboration.collaborators_router import router as collaborators_router
from app.collaboration.requests_router import (
    skill_requests_router,
    me_requests_router,
)
from app.users.me_router import router as me_router
from app.users.users_router import router as users_router

BACKEND_SERVER_HOST = "127.0.0.1"
BACKEND_SERVER_PORT = 8000
APPLICATION_ROUTERS = (
    auth_router,
    skills_router,
    versions_router,
    downloads_router,
    likes_router,
    comments_router,
    collaborators_router,
    skill_requests_router,
    me_requests_router,
    me_router,
    users_router,
)


def check_health_status() -> dict[str, str]:
    return {"status": "ok"}


def create_application() -> FastAPI:
    application = FastAPI(title="Skill Library API")
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    for router in APPLICATION_ROUTERS:
        application.include_router(router)

    application.add_api_route("/health", check_health_status, methods=["GET"])
    _register_development_exception_handler(application)
    return application


def _build_development_error_detail(exception: Exception) -> str:
    exception_type = type(exception).__name__
    exception_message = str(exception)
    stack_trace = traceback.format_exc()
    return f"{exception_type}: {exception_message}\n\n{stack_trace}"


def _handle_unhandled_exception(request: Request, exception: Exception) -> JSONResponse:
    error_detail = _build_development_error_detail(exception)
    origin = request.headers.get("origin", "*")
    cors_headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
    }
    return JSONResponse(status_code=500, content={"detail": error_detail}, headers=cors_headers)


def _build_validation_error_detail(exception: ValidationError) -> str:
    field_errors = exception.errors()
    error_messages = [
        f"{error['loc'][-1]}: {error['msg']}" for error in field_errors
    ]
    return "; ".join(error_messages)


def _handle_validation_error(request: Request, exception: ValidationError) -> JSONResponse:
    error_detail = _build_validation_error_detail(exception)
    origin = request.headers.get("origin", "*")
    cors_headers = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
    }
    return JSONResponse(status_code=422, content={"detail": error_detail}, headers=cors_headers)


def _register_development_exception_handler(application: FastAPI) -> None:
    application.add_exception_handler(ValidationError, _handle_validation_error)
    is_development = settings.environment == "development"
    if not is_development:
        return
    application.add_exception_handler(Exception, _handle_unhandled_exception)


def run_backend_server() -> None:
    uvicorn.run("main:app", host=BACKEND_SERVER_HOST, port=BACKEND_SERVER_PORT, reload=True)


app = create_application()


if __name__ == "__main__":
    run_backend_server()
