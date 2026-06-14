import scrapetube
import json

def scrape_youtube_vlogs(state: str):
    """
    Uses scrapetube to find top travel vlogs and itineraries for a given state
    without needing an API key.
    """
    print(f"Scraping YouTube for state: {state}")
    data = []
    
    query = f"{state} travel vlog itinerary tips"
    try:
        # fetch top 10 videos for the search query
        videos = scrapetube.get_search(query, limit=10, sort_by="view_count")
        
        for video in videos:
            # scrapetube returns complex dictionaries depending on YT's current structure
            try:
                title = video.get('title', {}).get('runs', [{}])[0].get('text', 'Unknown Title')
                video_id = video.get('videoId', '')
                url = f"https://www.youtube.com/watch?v={video_id}"
                
                # Try to extract the description snippet
                description = ""
                desc_runs = video.get('detailedMetadataSnippets', [{}])[0].get('snippetText', {}).get('runs', [])
                if desc_runs:
                    description = "".join([run.get('text', '') for run in desc_runs])
                
                data.append({
                    "source": "YouTube_Free",
                    "state": state,
                    "title": title,
                    "url": url,
                    "content": description,
                    "type": "vlog"
                })
            except Exception as e:
                # Youtube dict structure can change
                continue
    except Exception as e:
        print(f"Error scraping YouTube for {state}: {e}")
        
    return data

if __name__ == "__main__":
    res = scrape_youtube_vlogs("Himachal Pradesh")
    print(json.dumps(res[:2], indent=2))
