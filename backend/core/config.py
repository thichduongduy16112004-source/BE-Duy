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

    class Config:
        env_file = ".env"

settings = Settings()
