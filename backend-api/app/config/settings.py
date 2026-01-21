from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    db_host: str
    db_port: int
    db_user: str
    db_password: str
    db_name: str
    jwt_secret_key: str
    jwt_algorithm: str
    jwt_access_token_expire_days: int
    jwt_refresh_token_expire_days: int

    # Email settings
    smtp_server: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    email_from: str

    @property
    def database_url(self) -> str:
        return f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    class Config:
        env_file = ".env"


settings = Settings()
