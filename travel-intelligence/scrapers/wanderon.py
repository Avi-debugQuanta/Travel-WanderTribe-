from playwright.async_api import async_playwright
import asyncio
from bs4 import BeautifulSoup
import json

async def scrape_wanderon(state: str):
    """
    Scrapes packages for a given state from WanderOn using Playwright.
    Returns a list of dictionaries with package details.
    """
    print(f"Scraping WanderOn for state: {state}")
    data = []
    
    # Example URL structure, though we might need to search via their UI
    # WanderOn usually has state-specific pages, e.g., /trips/himachal-pradesh
    state_slug = state.lower().replace(" ", "-")
    url = f"https://wanderon.in/trips/{state_slug}"
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            # Go to the URL
            response = await page.goto(url, wait_until="networkidle")
            
            # If 404 or page not found, maybe search instead
            if response.status == 404:
                print(f"Page not found for {url}. Might need to search instead.")
                await browser.close()
                return data

            # Get the page content
            content = await page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # WanderOn package cards usually have specific classes, 
            # we'll look for generic link structures or card structures
            # *This is a generic extractor as exact classes change*
            cards = soup.find_all("a", href=True)
            
            for card in cards:
                href = card['href']
                if "/trip/" in href or "packages/" in href:
                    title_elem = card.find("h3") or card.find("h2")
                    title = title_elem.text.strip() if title_elem else href.split("/")[-1]
                    
                    price_elem = card.find(string=lambda t: t and '₹' in t)
                    price = price_elem.strip() if price_elem else "Price not found"
                    
                    if len(title) > 3 and title not in [d['title'] for d in data]:
                        data.append({
                            "source": "WanderOn",
                            "state": state,
                            "title": title,
                            "url": f"https://wanderon.in{href}" if href.startswith("/") else href,
                            "price": price,
                            "type": "package"
                        })
            
            await browser.close()
            
    except Exception as e:
        print(f"Error scraping WanderOn for {state}: {e}")
        
    return data

if __name__ == "__main__":
    # Test
    res = asyncio.run(scrape_wanderon("Himachal Pradesh"))
    print(json.dumps(res, indent=2))
