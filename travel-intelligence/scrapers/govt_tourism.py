import requests
from bs4 import BeautifulSoup

def scrape_govt_tourism(state: str):
    """
    Scrapes basic info from Govt Tourism sites depending on the state.
    """
    print(f"Scraping Govt Tourism for state: {state}")
    data = []
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    }
    
    url = ""
    if state.lower() == "himachal pradesh":
        url = "https://himachaltourism.gov.in/"
    elif state.lower() == "kashmir":
        url = "https://www.jktdc.co.in/"
    elif state.lower() == "uttarakhand":
        url = "https://uttarakhandtourism.gov.in/"
    else:
        return data

    try:
        response = requests.get(url, headers=headers, timeout=10, verify=False) # Govt sites often have SSL issues
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Govt sites are unstructured, so we extract generic paragraphs for RAG
            paragraphs = soup.find_all("p")
            text_content = " ".join([p.text.strip() for p in paragraphs if len(p.text.strip()) > 30])
            
            data.append({
                "source": "GovtTourism",
                "state": state,
                "title": f"Official Guidelines and Info for {state}",
                "url": url,
                "content": text_content[:5000], # Keep it reasonable
                "type": "info"
            })
        else:
            print(f"Failed to fetch {url}: {response.status_code}")
            
    except Exception as e:
        print(f"Error scraping Govt Tourism for {state}: {e}")
        
    return data

if __name__ == "__main__":
    import urllib3
    urllib3.disable_warnings()
    res = scrape_govt_tourism("Himachal Pradesh")
    import json
    print(json.dumps(res, indent=2))
