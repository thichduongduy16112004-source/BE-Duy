from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

client = None

async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    print("[DB] Connected to MongoDB Atlas")

async def close_db():
    global client
    if client:
        client.close()

def get_database():
    return client["historyalive"]
