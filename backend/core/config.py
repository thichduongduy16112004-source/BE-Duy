from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    OPENAI_API_KEY: str
    PINECONE_API_KEY: str = ""
    PINECONE_ENV: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
