import asyncio
import json
from services.db import get_mongo_db

from scrapers.wanderon import scrape_wanderon
from scrapers.thrillophilia import scrape_thrillophilia
from scrapers.govt_tourism import scrape_govt_tourism
from scrapers.google_makemytrip_free import scrape_google_places_free, scrape_makemytrip_free
from scrapers.osm_free_api import scrape_osm_places
from scrapers.youtube import scrape_youtube_vlogs
from scrapers.booking_agoda import scrape_booking_agoda_free
from scrapers.cabs_offbeat import scrape_cabs_and_offbeat

STATES = ["Himachal Pradesh", "Kashmir", "Uttarakhand"]

async def run_pipeline():
    db = get_mongo_db()
    if db is None:
        print("MongoDB not connected. Data will only be saved to scraped_backup.json locally.")
        
    all_data = []

    for state in STATES:
        print(f"\n{'='*40}\n--- Processing {state} ---\n{'='*40}")
        
        # Sync Scrapers (Fast)
        print("-> Running Thrillophilia...")
        thrillophilia_data = scrape_thrillophilia(state)
        
        print("-> Running Govt Tourism...")
        govt_data = scrape_govt_tourism(state)
        
        print("-> Running OpenStreetMap API...")
        osm_data = scrape_osm_places(state)
        
        print("-> Running OpenStreetMap Cabs & Offbeat API...")
        cabs_data = scrape_cabs_and_offbeat(state)
        
        print("-> Running YouTube Vlogs...")
        yt_data = scrape_youtube_vlogs(state)
        
        # Async Scrapers (Slow / Headless Browsers)
        print("-> Running WanderOn...")
        wanderon_data = await scrape_wanderon(state)
        
        print("-> Running Google Places (Playwright)...")
        google_data = await scrape_google_places_free(state)
        
        print("-> Running MakeMyTrip (Playwright)...")
        mmt_data = await scrape_makemytrip_free(state)
        
        print("-> Running Booking.com (Playwright)...")
        booking_data = await scrape_booking_agoda_free(state)
        
        state_data = (
            thrillophilia_data + govt_data + osm_data + cabs_data + yt_data + 
            wanderon_data + google_data + mmt_data + booking_data
        )
        
        print(f"✅ Extracted {len(state_data)} items for {state}")
        all_data.extend(state_data)
        
        # Insert into Mongo if available
        if db is not None and len(state_data) > 0:
            try:
                collection = db["raw_scraped_data"]
                collection.insert_many(state_data)
                print(f"Saved to MongoDB for {state}")
            except Exception as e:
                print(f"Failed to save to MongoDB (is it running?): {e}")

    print("\nPipeline complete. Total items:", len(all_data))
    
    # Always save to JSON as backup
    with open("scraped_backup.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, default=str)
    print("Data saved to scraped_backup.json")

if __name__ == "__main__":
    asyncio.run(run_pipeline())
