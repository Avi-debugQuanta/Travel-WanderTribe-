import os
from services.rag_service import rag_service

def test_rag():
    print("Testing RAG Engine for Destination: 'Manali, Himachal Pradesh'\n")
    
    # Simulate what ai_service does
    knowledge = rag_service.get_knowledge_for_destination("Manali")
    
    print("--- RAW RAG OUTPUT ---")
    print(knowledge)
    print("----------------------")
    
    if "No real-time data available" in knowledge or "Error retrieving data" in knowledge:
        print("❌ Test Failed: ChromaDB not returning data.")
    elif "HOTELS" in knowledge or "CABS" in knowledge or "ATTRACTIONS" in knowledge:
        print("✅ Test Passed: ChromaDB is returning verified data!")
    else:
        print("⚠️ Test Warning: Data returned but lacking categorized sections.")

if __name__ == "__main__":
    # Ensure working directory is correct for ChromaDB path
    test_rag()
