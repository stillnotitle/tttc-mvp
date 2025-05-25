from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # API設定
    APP_NAME: str = "Talk to the City MVP"
    DEBUG: bool = False
    
    # OpenAI設定
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    
    # ファイルパス
    UPLOAD_DIR: str = "data/uploads"
    OUTPUT_DIR: str = "data/outputs"
    LOG_DIR: str = "logs"
    
    # 制限
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    MAX_COMMENTS_PER_ANALYSIS: int = 5000
    
    # Pipeline設定
    EXTRACTION_WORKERS: int = 3
    DEFAULT_CLUSTERS: int = 8
    LABEL_SAMPLE_SIZE: int = 20
    TAKEAWAY_SAMPLE_SIZE: int = 50
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
