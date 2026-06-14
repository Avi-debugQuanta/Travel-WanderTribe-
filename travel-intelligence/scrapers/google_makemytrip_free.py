from playwright.async_api import async_playwright
import asyncio
import json

async def scrape_google_places_free(state: str):
    """
    Attempts to scrape Google Maps places using Playwright for free.
    WARNING: This is highly brittle and can get blocked by Google.
    """
    print(f"Scraping Google Places (Free/Playwright) for: {state}")
    data = []
    
    url = f"https://www.google.com/maps/search/top+tourist+attractions+in+{state.replace(' ', '+')}"
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle")
            
            # Wait for some results to load
            await page.wait_for_timeout(3000)
            
            # This is a very generic extraction since Google Maps DOM changes frequently
            elements = await page.query_selector_all("a[href*='/maps/place/']")
            for el in elements[:10]: # Limit to top 10 for safety
                name = await el.get_attribute("aria-label")
                href = await el.get_attribute("href")
                if name and href:
                    data.append({
                        "source": "GooglePlaces_Free",
                        "state": state,
                        "title": name,
                        "url": href,
                        "type": "place"
                    })
                    
            await browser.close()
    except Exception as e:
        print(f"Error scraping Google Places for {state}: {e}")
        
    return data

async def scrape_makemytrip_free(state: str):
    """
    Attempts to scrape MakeMyTrip hotels using Playwright for free.
    WARNING: MMT has strict anti-bot measures. This might fail.
    """
    print(f"Scraping MakeMyTrip (Free/Playwright) for: {state}")
    data = []
    url = f"https://www.makemytrip.com/hotels/hotel-listing/?city={state.split()[0].upper()}"
    
    try:
        async with async_playwright() as p:
            # Need to pass custom user agent to avoid immediate block
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            await page.goto(url, wait_until="networkidle", timeout=15000)
            
            await page.wait_for_timeout(3000)
            
            # Basic extraction
            hotel_elements = await page.query_selector_all(".listingRow")
            for el in hotel_elements[:5]:
                name_el = await el.query_selector("span[id^='htl_id_name']")
                price_el = await el.query_selector("p[id^='hlistpg_hotel_shown_price']")
                
                if name_el:
                    name = await name_el.inner_text()
                    price = await price_el.inner_text() if price_el else "Unknown"
                    data.append({
                        "source": "MakeMyTrip_Free",
                        "state": state,
                        "title": name,
                        "price": price,
                        "type": "hotel"
                    })
            
            await browser.close()
    except Exception as e:
        print(f"Error scraping MakeMyTrip for {state}: {e}")
        
    return data

if __name__ == "__main__":
    res = asyncio.run(scrape_google_places_free("Himachal Pradesh"))
    print(json.dumps(res, indent=2))
