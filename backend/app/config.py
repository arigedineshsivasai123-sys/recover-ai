import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "RecoverAI API"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/recover_ai.db" if os.getenv("VERCEL") else "sqlite:///./recover_ai.db"
    )
    
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_recoverai_demo")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "demo_secret_key_12345")
    
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
