import os
import chromadb
from pymongo import MongoClient

# MongoDB Setup
# Defaulting to local if not provided
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
try:
    mongo_client = MongoClient(MONGO_URI)
    mongo_db = mongo_client["wandertribe_db"]
    raw_data_collection = mongo_db["raw_scraped_data"]
    places_collection = mongo_db["places"]
    hotels_collection = mongo_db["hotels"]
except Exception as e:
    print(f"Warning: MongoDB connection failed - {e}")
    mongo_db = None

# ChromaDB Setup
# Storing vectors in a local directory
CHROMA_DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_data")
try:
    chroma_client = chromadb.PersistentClient(path=CHROMA_DATA_PATH)
    travel_collection = chroma_client.get_or_create_collection(name="travel_knowledge")
except Exception as e:
    print(f"Warning: ChromaDB connection failed - {e}")
    chroma_client = None
    travel_collection = None

def get_mongo_db():
    return mongo_db

def get_chroma_collection():
    return travel_collection
