import json
import os
from services.db import get_mongo_db, get_chroma_collection

def run_embedder():
    db = get_mongo_db()
    collection = get_chroma_collection()
    
    if collection is None:
        print("ChromaDB connection failed. Ensure ChromaDB is accessible.")
        return
        
    data_cursor = []
    if db is not None:
        try:
            raw_collection = db["raw_scraped_data"]
            data_cursor = list(raw_collection.find({}))
        except Exception as e:
            print(f"MongoDB timeout. Falling back to JSON: {e}")
    
    if len(data_cursor) == 0:
        print("MongoDB not connected or empty. Falling back to scraped_backup.json...")
        backup_path = os.path.join(os.path.dirname(__file__), "scraped_backup.json")
        if os.path.exists(backup_path):
            with open(backup_path, 'r', encoding='utf-8') as f:
                data_cursor = json.load(f)
        else:
            print("No data found in MongoDB or scraped_backup.json.")
            return

    docs = []
    metadatas = []
    ids = []
    
    count = 0
    for doc in data_cursor:
        doc_id = str(doc.get("_id", f"doc_{count}"))
        source = doc.get("source", "unknown")
        state = doc.get("state", "unknown")
        title = doc.get("title", "")
        url = doc.get("url", "")
        price = doc.get("price", "")
        content = doc.get("content", "")
        item_type = doc.get("type", "unknown")
        
        # Build text for embedding
        text_to_embed = f"Title: {title}\nType: {item_type}\nState: {state}\nSource: {source}\nPrice: {price}\n"
        if content:
            text_to_embed += f"Info: {content}\n"
            
        docs.append(text_to_embed)
        # ChromaDB metadatas must not contain null/None values, filter them out
        meta = {
            "source": source or "unknown",
            "state": state or "unknown",
            "url": url or "",
            "price": price or "unknown",
            "title": title or "unknown",
            "type": item_type or "unknown"
        }
        metadatas.append(meta)
        ids.append(doc_id)
        
        count += 1
        
        # Batch insert to ChromaDB
        if len(docs) >= 50:
            print(f"Embedding batch of 50... Total processed: {count}")
            collection.upsert(
                documents=docs,
                metadatas=metadatas,
                ids=ids
            )
            docs, metadatas, ids = [], [], []
            
    # Insert remaining
    if len(docs) > 0:
        print(f"Embedding final batch of {len(docs)}...")
        collection.upsert(
            documents=docs,
            metadatas=metadatas,
            ids=ids
        )
        
    print(f"Successfully embedded {count} documents into ChromaDB.")

if __name__ == "__main__":
    run_embedder()
