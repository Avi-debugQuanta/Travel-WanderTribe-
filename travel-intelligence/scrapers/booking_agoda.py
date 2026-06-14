from playwright.async_api import async_playwright
import asyncio
import json

async def scrape_booking_agoda_free(state: str):
    """
    Attempts to scrape Booking.com and Agoda using Playwright.
    Extremely brittle because of Datadome/PerimeterX bot protection.
    """
    print(f"Scraping Booking/Agoda (Free/Playwright) for: {state}")
    data = []
    
    # Booking.com URL
    booking_url = f"https://www.booking.com/searchresults.html?ss={state.replace(' ', '+')}"
    
    try:
        async with async_playwright() as p:
            # We must use a realistic user agent
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={'width': 1920, 'height': 1080}
            )
            page = await context.new_page()
            
            # Booking.com
            try:
                print(f"Loading Booking.com for {state}...")
                await page.goto(booking_url, wait_until="domcontentloaded", timeout=20000)
                await page.wait_for_timeout(4000)
                
                # Check if we hit a captcha/datadome
                title = await page.title()
                if "Robot Check" in title or "Pardon Our Interruption" in title:
                    print("Blocked by Booking.com bot protection.")
                else:
                    # Generic extraction of property cards
                    cards = await page.query_selector_all('[data-testid="property-card"]')
                    for card in cards[:5]:
                        name_el = await card.query_selector('[data-testid="title"]')
                        price_el = await card.query_selector('[data-testid="price-and-discounted-price"]')
                        link_el = await card.query_selector('a[data-testid="title-link"]')
                        
                        if name_el:
                            name = await name_el.inner_text()
                            price = await price_el.inner_text() if price_el else "Unknown"
                            href = await link_el.get_attribute("href") if link_el else ""
                            
                            data.append({
                                "source": "Booking_Free",
                                "state": state,
                                "title": name.strip(),
                                "price": price.strip().replace('\n', ' '),
                                "url": href,
                                "type": "hotel"
                            })
            except Exception as e:
                print(f"Booking.com extraction failed: {e}")
                
            await browser.close()
    except Exception as e:
        print(f"Playwright error in Booking/Agoda: {e}")
        
    return data

if __name__ == "__main__":
    res = asyncio.run(scrape_booking_agoda_free("Himachal Pradesh"))
    print(json.dumps(res, indent=2))
