import json
from pymongo import MongoClient

MONGO_URI = "mongodb+srv://thichduongduy:16112004@cluster0.7gukzfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGO_URI)

db = client["history_alive"]
collection = db["historical_figures"]

with open(r"D:\AntiGravity\history_alive\history-alive\backend\upload_mongo\seed_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

collection.insert_many(data)

print(f"Đã import {len(data)} documents")