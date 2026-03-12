import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    return application


def run_backend_server() -> None:
    uvicorn.run("main:app", host=BACKEND_SERVER_HOST, port=BACKEND_SERVER_PORT, reload=True)


app = create_application()


if __name__ == "__main__":
    run_backend_server()
