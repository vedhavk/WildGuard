import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load .env from the same directory as this file
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))


class Settings:
    """Application configuration loaded from environment variables."""

    def __init__(self):
        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_port = int(os.getenv("DB_PORT", "5432"))
        self.db_user = os.getenv("DB_USER", "postgres")
        self.db_password = os.getenv("DB_PASSWORD", "Vyshnav@2004")
        self.db_name = os.getenv("DB_NAME", "wild")

        self.roboflow_api_key = os.getenv("ROBOFLOW_API_KEY", "")
        self.roboflow_model_id = os.getenv("ROBOFLOW_MODEL_ID", "wild-animal-x055y/1")

        self.smtp_email = os.getenv("SMTP_EMAIL", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")

        self.jwt_secret = os.getenv("JWT_SECRET", "wildguard-secret-key")
        self.jwt_algorithm = "HS256"
        self.jwt_expiration_minutes = 60 * 24  # 24 hours

    @property
    def database_url(self) -> str:
        # URL-encode the password to handle special characters like @
        password = quote_plus(self.db_password)
        return f"postgresql://{self.db_user}:{password}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings()
