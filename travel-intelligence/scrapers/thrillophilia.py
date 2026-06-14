from bs4 import BeautifulSoup
import requests

def scrape_thrillophilia(state: str):
    """
    Scrapes packages for a given state from Thrillophilia using requests and BeautifulSoup.
    """
    print(f"Scraping Thrillophilia for state: {state}")
    data = []
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    
    # Example URL structure: https://www.thrillophilia.com/states/himachal-pradesh
    state_slug = state.lower().replace(" ", "-")
    url = f"https://www.thrillophilia.com/states/{state_slug}"
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find elements that contain packages
            # Thrillophilia classes often change, looking for a tag with href
            links = soup.find_all("a", href=True)
            for link in links:
                href = link['href']
                if "/tours/" in href:
                    title_elem = link.find("h3") or link.find("div", class_=lambda x: x and "title" in x.lower())
                    title = title_elem.text.strip() if title_elem else href.split("/")[-1].replace("-", " ").title()
                    
                    price_elem = link.find(string=lambda t: t and 'INR' in t)
                    price = price_elem.strip() if price_elem else "Price not found"
                    
                    if len(title) > 3 and title not in [d['title'] for d in data]:
                        data.append({
                            "source": "Thrillophilia",
                            "state": state,
                            "title": title,
                            "url": f"https://www.thrillophilia.com{href}" if href.startswith("/") else href,
                            "price": price,
                            "type": "package"
                        })
        else:
            print(f"Failed to fetch Thrillophilia: {response.status_code}")
            
    except Exception as e:
        print(f"Error scraping Thrillophilia for {state}: {e}")
        
    return data

if __name__ == "__main__":
    res = scrape_thrillophilia("Himachal Pradesh")
    import json
    print(json.dumps(res, indent=2))
