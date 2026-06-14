import json
from services.db import get_mongo_db, get_chroma_collection

def run_embedder():
    db = get_mongo_db()
    collection = get_chroma_collection()
    
    if db is None or collection is None:
        print("DB connection failed. Ensure Mongo and Chroma are accessible.")
        return
        
    raw_collection = db["raw_scraped_data"]
    data_cursor = raw_collection.find({})
    
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
        
        # Build text for embedding
        text_to_embed = f"Title: {title}\nState: {state}\nSource: {source}\nPrice: {price}\n"
        if content:
            text_to_embed += f"Info: {content}\n"
            
        docs.append(text_to_embed)
        metadatas.append({
            "source": source,
            "state": state,
            "url": url,
            "price": price,
            "title": title
        })
        ids.append(doc_id)
        
        count += 1
        
        # Batch insert to ChromaDB
        if len(docs) >= 50:
            print(f"Embedding batch of 50... Total processed: {count}")
            collection.add(
                documents=docs,
                metadatas=metadatas,
                ids=ids
            )
            docs, metadatas, ids = [], [], []
            
    # Insert remaining
    if len(docs) > 0:
        print(f"Embedding final batch of {len(docs)}...")
        collection.add(
            documents=docs,
            metadatas=metadatas,
            ids=ids
        )
        
    print(f"Successfully embedded {count} documents into ChromaDB.")

if __name__ == "__main__":
    run_embedder()
