import os

class Settings:
    SERVICE_NAME: str = "eauction-ai-service"
    VERSION: str = "1.0.0"
    PORT: int = int(os.getenv("PORT", "8000"))

    # Database Configuration (Exclusively Read-Replica for zero master load)
    POSTGRES_REPLICA_HOST: str = os.getenv("POSTGRES_REPLICA_HOST", "eauction-postgres-replica")
    POSTGRES_MASTER_HOST: str = os.getenv("POSTGRES_MASTER_HOST", "eauction-postgres")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "eauction_db")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgrespassword")

    # Redis Cache & Live Broadcast Pub/Sub
    REDIS_HOST: str = os.getenv("REDIS_HOST", "eauction-redis")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))

    # On-Premises Ollama Cluster
    OLLAMA_HOST: str = os.getenv("OLLAMA_HOST", "http://192.168.2.40:11434")
    MODEL_REASONING: str = os.getenv("MODEL_REASONING", "qwen2.5:7b-instruct")
    MODEL_VISION: str = os.getenv("MODEL_VISION", "qwen2.5vl:7b")
    MODEL_CHAT: str = os.getenv("MODEL_CHAT", "llama3.2:latest")
    MODEL_EMBEDDING: str = os.getenv("MODEL_EMBEDDING", "qwen3-embedding:latest")

settings = Settings()
