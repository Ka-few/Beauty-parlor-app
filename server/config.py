"""Runtime configuration for local development and deployed environments."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def _load_dotenv(dotenv_path: Path) -> None:
    if not dotenv_path.exists():
        return

    with dotenv_path.open() as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value

_load_dotenv(BASE_DIR / ".env")


def _normalise_database_url(url: str) -> str:
    """Accept legacy Heroku/Supabase-style postgres URLs used by some hosts."""
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://"):]
    return url


class Config:
    ENV = os.getenv("FLASK_ENV", "development").lower()
    IS_PRODUCTION = ENV == "production" or bool(os.getenv("RENDER"))
    _local_sqlite_url = "sqlite:///" + (BASE_DIR / "instance" / "beauty_parlour.db").as_posix()
    SQLALCHEMY_DATABASE_URI = _normalise_database_url(os.getenv("DATABASE_URL", _local_sqlite_url))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    SECRET_KEY = os.getenv("SECRET_KEY", "development-only-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "development-only-jwt-secret-key")

    @classmethod
    def validate(cls) -> None:
        if not cls.IS_PRODUCTION:
            return
        missing = [name for name in ("DATABASE_URL", "SECRET_KEY", "JWT_SECRET_KEY") if not os.getenv(name)]
        if missing:
            raise RuntimeError("Missing required production environment variable(s): " + ", ".join(missing))
        if not cls.SQLALCHEMY_DATABASE_URI.startswith(("postgresql://", "postgresql+")):
            raise RuntimeError("DATABASE_URL must be a PostgreSQL connection URL in production.")
