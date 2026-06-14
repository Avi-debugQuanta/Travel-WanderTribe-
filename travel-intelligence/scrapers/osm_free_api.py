import requests
import json
import time

def scrape_osm_places(state: str):
    """
    Uses the free OpenStreetMap Overpass API to fetch authentic restaurants, 
    hotels, and tourist attractions for a given state.
    """
    print(f"Scraping OpenStreetMap (Overpass API) for: {state}")
    
    # Overpass QL query to find places in the given state
    # We look for tourism=attraction, amenity=restaurant, tourism=hotel
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    overpass_query = f"""
    [out:json][timeout:25];
    area["name"="{state}"]["admin_level"="4"]->.searchArea;
    (
      node["tourism"="attraction"](area.searchArea);
      node["amenity"="restaurant"](area.searchArea);
      node["tourism"="hotel"](area.searchArea);
    );
    out body limit 100;
    """
    
    data = []
    
    try:
        response = requests.post(overpass_url, data={'data': overpass_query}, timeout=30)
        
        # Overpass has strict rate limiting
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
                if not name:
                    continue
                
                place_type = "place"
                if "amenity" in tags and tags["amenity"] == "restaurant":
                    place_type = "restaurant"
                elif "tourism" in tags and tags["tourism"] == "hotel":
                    place_type = "hotel"
                elif "tourism" in tags and tags["tourism"] == "attraction":
                    place_type = "attraction"
                    
                data.append({
                    "source": "OpenStreetMap_Free",
                    "state": state,
                    "title": name,
                    "type": place_type,
                    "lat": el.get('lat'),
                    "lon": el.get('lon'),
                    "tags": tags # includes opening_hours, cuisine, website if available
                })
        else:
            print(f"OSM Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error scraping OSM for {state}: {e}")
        
    return data

if __name__ == "__main__":
    res = scrape_osm_places("Himachal Pradesh")
    print(f"Fetched {len(res)} places from OSM.")
    print(json.dumps(res[:3], indent=2))
