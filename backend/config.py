import os
from dotenv import load_dotenv
from sqlalchemy.engine import URL

# Load .env from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


class Settings:
    """Application configuration loaded from environment variables."""

    def __init__(self):
        self.database_url_env = os.getenv("DATABASE_URL", "").strip()
        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_port = int(os.getenv("DB_PORT", "5432"))
        self.db_user = os.getenv("DB_USER", "postgres")
        self.db_password = os.getenv("DB_PASSWORD", "")
        self.db_name = os.getenv("DB_NAME", "wild")

        self.roboflow_api_key = os.getenv("ROBOFLOW_API_KEY", "")
        self.roboflow_model_id = os.getenv("ROBOFLOW_MODEL_ID", "wild-animal-x055y/1")

        self.smtp_email = os.getenv("SMTP_EMAIL", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")

        self.jwt_secret = os.getenv("JWT_SECRET", "wildguard-secret-key-change-in-production")
        self.jwt_algorithm = "HS256"
        self.jwt_expiration_minutes = 60 * 24  # 24 hours

    @property
    def database_url(self) -> str:
        """
        Returns DATABASE_URL if set (e.g. Neon PostgreSQL),
        otherwise builds connection string safely using URL.create() for local DB_* config.
        """
        if self.database_url_env:
            url = self.database_url_env
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            return url

        # Safe URL creation for local development (properly encodes special chars in passwords)
        return URL.create(
            drivername="postgresql+psycopg2",
            username=self.db_user,
            password=self.db_password,
            host=self.db_host,
            port=self.db_port,
            database=self.db_name,
        ).render_as_string(hide_password=False)


settings = Settings()
