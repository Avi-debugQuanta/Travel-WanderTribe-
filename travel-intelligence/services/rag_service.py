import json
import os
from .db import get_chroma_collection

class RAGService:
    def __init__(self):
        self.collection = get_chroma_collection()

    def get_knowledge_for_destination(self, destination: str, top_k: int = 15) -> str:
        """
        Queries ChromaDB for the destination to retrieve the best matched real scraped data 
        (hotels, restaurants, attractions, cabs).
        """
        if not destination or self.collection is None:
            return "No real-time data available. Proceed with general knowledge."
            
        try:
            # Query the vector DB
            results = self.collection.query(
                query_texts=[f"Travel information, hotels, cabs, offbeat places, and restaurants in {destination}"],
                n_results=top_k
            )
            
            if not results or not results.get("documents") or len(results["documents"][0]) == 0:
                return f"No specific local data found in DB for '{destination}'."
                
            knowledge = f"\n\n=== VERIFIED RAG DATA FOR {destination.upper()} ===\n"
            
            # Group by type if possible
            hotels = []
            attractions = []
            cabs = []
            others = []
            
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            
            for doc, meta in zip(docs, metas):
                item_type = meta.get("type", "")
                title = meta.get("title", "")
                price = meta.get("price", "N/A")
                source = meta.get("source", "")
                
                info_str = f"- {title} "
                if price and price != "N/A" and price != "unknown":
                    info_str += f"(Price: {price}) "
                info_str += f"[{source}]"
                
                if item_type == "hotel" or item_type == "offbeat_hotel":
                    hotels.append(info_str)
                elif item_type == "attraction" or item_type == "place":
                    attractions.append(info_str)
                elif item_type == "cab_taxi":
                    cabs.append(info_str)
                else:
                    others.append(info_str)
            
            if hotels:
                knowledge += "\n**HOTELS & STAY:**\n" + "\n".join(hotels)
            if attractions:
                knowledge += "\n\n**ATTRACTIONS & RESTAURANTS:**\n" + "\n".join(attractions)
            if cabs:
                knowledge += "\n\n**CAB & TAXI STANDS:**\n" + "\n".join(cabs)
            if others:
                knowledge += "\n\n**OTHER INFO:**\n" + "\n".join(others)
                
            knowledge += "\n\n=== GENERAL TIPS ===\n"
            knowledge += "- Road conditions: Mountain roads are narrow. Travel in daylight only.\n"
            knowledge += "- Payment: UPI works mostly everywhere except remote areas.\n"
            
            return knowledge
            
        except Exception as e:
            print(f"[RAGService] Error querying ChromaDB: {e}")
            return "Error retrieving data. Proceed with general knowledge."

rag_service = RAGService()
