from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    MONGODB_URI: str
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    OPENAI_API_KEY: str
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL_NAME: str = "gemini-2.5-flash"
    GEMINI_MAX_OUTPUT_TOKENS: int = 4096
    GEMINI_ROUTER_MAX_OUTPUT_TOKENS: int = 512
    GEMINI_THINKING_BUDGET: int = 0
    LLM_TIMEOUT_SECONDS: float = 30.0
    PINECONE_API_KEY: str = ""
    PINECONE_ENV: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@historyalive.vn"
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    PAYOS_CLIENT_ID: str = ""
    PAYOS_API_KEY: str = ""
    PAYOS_CHECKSUM_KEY: str = ""
    RAG_SERVICE_URL: str = "http://localhost:8001"
    RAG_TIMEOUT_SECONDS: float = 60.0
    FREE_DAILY_CHAT_LIMIT: int = 8


settings = Settings()
