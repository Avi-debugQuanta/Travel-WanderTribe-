import requests
import json
import time

def scrape_cabs_and_offbeat(state: str):
    """
    Uses OpenStreetMap Overpass API to fetch taxi stands and offbeat accommodations (guest_house, chalet, hostel).
    """
    print(f"Scraping Cabs & Offbeat Places (Overpass API) for: {state}")
    
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    overpass_query = f"""
    [out:json][timeout:25];
    area["name"="{state}"]["admin_level"="4"]->.searchArea;
    (
      node["amenity"="taxi"](area.searchArea);
      node["tourism"~"guest_house|chalet|hostel"](area.searchArea);
    );
    out body;
    """
    
    data = []
    
    try:
        headers = {"User-Agent": "WanderTribeBot/1.1 (contact@wandertribe.local)"}
        response = requests.post(overpass_url, data={'data': overpass_query}, headers=headers, timeout=30)
        
        if response.status_code == 429:
            print("OSM Overpass Rate limited. Sleeping 10s...")
            time.sleep(10)
            return data
            
        if response.status_code == 200:
            result = response.json()
            elements = result.get('elements', [])
            
            for el in elements:
                tags = el.get('tags', {})
                name = tags.get('name')
                
                # If there's no name, we might still want it if it's a taxi stand
                if not name and "amenity" in tags and tags["amenity"] == "taxi":
                    name = f"Local Taxi Stand - {state}"
                elif not name:
                    continue
                
                place_type = "offbeat_hotel"
                if "amenity" in tags and tags["amenity"] == "taxi":
                    place_type = "cab_taxi"
                    
                data.append({
                    "source": "OpenStreetMap_Cabs",
                    "state": state,
                    "title": name,
                    "type": place_type,
                    "lat": el.get('lat'),
                    "lon": el.get('lon'),
                    "tags": tags 
                })
        else:
            print(f"OSM Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error scraping OSM for {state}: {e}")
        
    return data

if __name__ == "__main__":
    res = scrape_cabs_and_offbeat("Himachal Pradesh")
    print(f"Fetched {len(res)} cabs and offbeat places from OSM.")
