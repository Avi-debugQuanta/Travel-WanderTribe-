package com.hackathon.travel.Travel.service;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.LinkedHashMap;

@Component
public class DestinationKnowledgeBase {

    private static final Map<String, String> DESTINATIONS = new LinkedHashMap<>();

    static {
        DESTINATIONS.put("manali", """
            MANALI (Altitude: 6,726 ft, District: Kullu, Himachal Pradesh)
            
            TOP PLACES:
            - Old Manali: Bohemian cafes, backpacker hub, try Lazy Dog Cafe, Drifters Inn
            - Solang Valley: Paragliding (₹1500-2500), skiing in winter, zorbing, ropeway
            - Rohtang Pass: Open Jun-Nov, permit needed (₹550/person online at rohtangpermits.hp.gov.in), 51km from Manali
            - Sethan Village: Hidden gem 12km from Manali, igloo stays in winter (₹2000-3000/night)
            - Jogini Waterfall: Easy 3km trek from Vashisht, no entry fee
            - Vashisht Hot Springs: Free natural hot water baths, ancient temple
            - Hidimba Temple: Iconic wooden temple in cedar forest, no entry fee
            - Naggar Castle: Heritage stay option (₹2000-4000/night), Roerich Art Gallery nearby
            - Hampta Pass Trek: 4-day trek, best Jun-Oct, guide mandatory (₹8000-12000 packages)
            - Beas Kund Trek: 3-day beginner trek, source of River Beas
            
            FOOD & RESTAURANTS:
            - Siddhu (steamed wheat bread with filling): Try at any local dhaba, ₹30-50
            - Trout Fish: Rainbow trout at riverside restaurants, ₹300-500/plate
            - Dham (Himachali feast): Traditional meal served on leaves, ₹200-300
            - Lazy Dog Cafe (Old Manali): Pasta, coffee, riverside seating
            - Johnson's Cafe: Colonial-era restaurant, continental food, ₹800-1200 for two
            - Il Forno: Best pizza in Manali, wood-fired, ₹400-600
            - Chopsticks (Mall Road): Chinese/Tibetan, momos ₹120-200
            - Fat Plate Cafe: Breakfast spot, pancakes and smoothies
            
            HOTELS BY BUDGET:
            - Budget (₹500-1500): Zostel Manali, The Hosteller, Old Manali guesthouses
            - Mid-range (₹1500-4000): Hotel Beas, Snow Valley Resorts, Apple Country Resort
            - Luxury (₹4000-10000): The Himalayan, Span Resorts, Solang Valley Resort
            
            TRANSPORT:
            - Delhi to Manali: Volvo bus ₹1200-1800 (12hrs), flight to Kullu Bhuntar ₹4000-8000 then 1hr taxi
            - Local: Auto ₹100-200 within town, taxi to Solang ₹800-1200 round trip
            - Bike rental: Royal Enfield ₹1200-1800/day, Activa ₹500-700/day
            
            PAYMENT TIPS:
            - Mall Road and Old Manali: UPI widely accepted
            - Remote areas (Solang, Sethan): Carry cash, ATMs unreliable
            - Hotels: Online booking 10-15% cheaper, most accept cards
            - Rohtang permits: Online payment only
            
            BEST SEASON: Dec-Feb for snow, Mar-Jun for pleasant weather, Oct-Nov for autumn colors
            AVOID: Jul-Aug heavy monsoon, landslides common on Manali-Leh highway
            """);

        DESTINATIONS.put("kashmir", """
            KASHMIR / SRINAGAR (Altitude: 5,200 ft, Jammu & Kashmir)
            
            TOP PLACES:
            - Dal Lake: Shikara ride ₹500-800/hr, houseboat stay ₹2000-8000/night
            - Nigeen Lake: Quieter alternative to Dal, luxury houseboats
            - Mughal Gardens: Nishat Bagh, Shalimar Bagh, Chashme Shahi (₹24 entry each)
            - Gulmarg: 50km from Srinagar, Gondola ride Phase 1 ₹740 + Phase 2 ₹920, skiing Dec-Mar
            - Pahalgam: 95km from Srinagar, Betaab Valley, Aru Valley, Chandanwari
            - Sonmarg: 80km from Srinagar, Thajiwas Glacier trek, horse riding ₹500-1500
            - Shankaracharya Temple: Hilltop Shiva temple, panoramic views of Srinagar
            - Dachigam National Park: Hangul deer sanctuary, permit from Wildlife Dept
            - Pari Mahal: Terraced garden overlooking Dal Lake, sunset spot
            
            FOOD & RESTAURANTS:
            - Wazwan (36-course Kashmiri feast): Rogan Josh, Yakhni, Gushtaba, ₹500-1500 per person
            - Kahwa: Kashmiri green tea with saffron and almonds, ₹50-100
            - Noon Chai (pink salt tea): Available everywhere, ₹20-40
            - Ahdoo's Restaurant (Residency Road): Legendary since 1918, Wazwan thali ₹400-700
            - Mughal Darbar: Best Rogan Josh in Srinagar, ₹300-500
            - Lhasa Restaurant: Tibetan food, momos ₹150-250
            - Stream Restaurant (Mughal Gardens): Garden setting, ₹600-1000 for two
            - Krishna Vaishno Dhaba: Pure veg near Dal Gate, ₹150-300
            
            HOTELS BY BUDGET:
            - Budget (₹800-2000): Houseboat standard rooms, Hotel Swiss, guesthouses on Boulevard
            - Mid-range (₹2000-5000): Deluxe houseboats, Hotel Grand Mumtaz, Vivanta
            - Luxury (₹5000-15000): The LaLiT Grand Palace, Taj Vivanta Dal View, premium houseboats
            
            TRANSPORT:
            - Delhi to Srinagar: Flight ₹3000-7000 (1.5hrs), train to Jammu then taxi 8hrs
            - Local: Auto ₹50-150, day taxi ₹2000-3000, shikara hourly
            - Srinagar-Gulmarg: Shared taxi ₹300/person, private ₹2000
            - Srinagar-Pahalgam: Shared ₹400/person, private ₹3000
            
            PAYMENT TIPS:
            - Srinagar city: UPI and cards widely accepted
            - Houseboats: Negotiate 20-30% off listed price in off-season, cash preferred
            - Gulmarg/Pahalgam: UPI works, but carry backup cash
            - Saffron/Pashmina shopping: ALWAYS pay in cash for better prices, haggle 40-50% off
            
            BEST SEASON: Mar-May spring tulips, Jun-Aug pleasant summer, Sep-Nov autumn golden chinar
            AVOID: Dec-Feb extreme cold (unless skiing in Gulmarg), Jan can see -10°C
            SAFETY: Absolutely safe for tourists, military presence ensures security
            """);

        DESTINATIONS.put("spiti", """
            SPITI VALLEY (Altitude: 12,500 ft, District: Lahaul-Spiti, Himachal Pradesh)
            
            TOP PLACES:
            - Key Monastery: 1000-year-old Buddhist monastery, ₹30 entry, stunning cliff-top location
            - Chandratal Lake: "Moon Lake" at 14,100 ft, camping beside the lake (₹800-1500/tent)
            - Kaza: Main town, base for all Spiti exploration, highest ATM in Asia
            - Kibber Village: One of highest inhabited villages (14,200 ft), snow leopard territory
            - Tabo Monastery: "Ajanta of the Himalayas", 1000+ years old, UNESCO candidate
            - Dhankar Monastery: Perched on cliff, panoramic confluence view
            - Pin Valley: Red foxes, ibex, snow leopard sightings, Pin Valley National Park
            - Kunzum Pass: 15,060 ft, gateway to Spiti from Manali side, open Jun-Oct
            - Chicham Bridge: Asia's highest suspension bridge, vertigo-inducing views
            - Langza Village: Giant Buddha statue at 14,500 ft, marine fossils from ancient Tethys Sea
            
            FOOD:
            - Thukpa (Tibetan noodle soup): ₹80-150 everywhere
            - Momos: ₹60-120, every dhaba serves them
            - Butter tea (Po Cha): Salty, yak butter tea, local specialty
            - Chhang: Local barley beer, served warm
            - The German Bakery (Kaza): Breads, pastries, ₹200-400
            - Sol Cafe (Kaza): Best coffee in Spiti, traveler hangout
            - Taste of Spiti (Kaza): Local Spitian thali ₹200-300
            
            HOTELS BY BUDGET:
            - Budget (₹500-1200): Zostel Spiti, homestays in Kibber/Langza (most authentic)
            - Mid-range (₹1200-3000): Hotel Deyzor (Kaza), Spiti Valley homestays
            - Camping: Chandratal camps ₹800-2000/night with meals
            NOTE: No luxury hotels exist in Spiti — that's the charm
            
            TRANSPORT:
            - Manali to Kaza: Via Rohtang-Kunzum (280km, 10-12hrs), road open Jun-Oct only
            - Shimla to Kaza: Via Kinnaur-Nako (400km, 2 days recommended), open year-round
            - Local: Shared jeeps, bikes (Royal Enfield essential for offroad)
            - Fuel: Only 2 petrol pumps (Kaza, Tabo), fill up whenever possible
            
            PAYMENT TIPS:
            - CARRY CASH — most places are cash-only
            - Only ATM in Kaza, often out of cash
            - No card machines in 90% of Spiti
            - UPI works intermittently (Jio/Airtel spotty above 12,000 ft)
            - Budget ₹1500-2500/day per person all-inclusive
            
            BEST SEASON: Jun-Sep for clear roads and blue skies
            AVOID: Oct-May (Kunzum Pass closed, extreme cold, limited supply)
            HEALTH: AMS (altitude sickness) risk — acclimatize 1 day in Kaza, carry Diamox
            """);

        DESTINATIONS.put("kasol", """
            KASOL & PARVATI VALLEY (Altitude: 5,177 ft, District: Kullu, Himachal Pradesh)
            
            TOP PLACES:
            - Kasol Village: "Mini Israel", riverside cafes, backpacker paradise
            - Kheerganga Trek: 12km trek, natural hot springs at top, camp overnight ₹500-1000
            - Tosh Village: Quieter than Kasol, mountain views, hippie cafes
            - Malana Village: Ancient democracy, unique culture (respectful visit only, don't touch anything)
            - Manikaran: Sikh gurudwara with natural hot springs, free langar (meal)
            - Chalal Village: 30-min walk from Kasol across the river, quieter alternative
            - Rasol Village: Trek from Kasol (3-4 hrs), stunning 360° views
            - Grahan Village: Hidden gem trek, 4-5 hrs from Kasol, magical meadows
            
            FOOD:
            - Israeli food: Shakshuka, hummus, falafel — Kasol specialty, ₹200-400
            - Evergreen Cafe: Legendary, riverside, Israeli + Italian, ₹300-500
            - Jim Morrison Cafe: Psychedelic decor, great music, pasta ₹250-400
            - Bhoj Cafe: Indian thali ₹150-200, reliable and filling
            - Moon Dance Cafe (Tosh): Mountain view, pancakes, ₹200-350
            - Mama's Cafe: Italian food, wood-fired pizza
            - Trout fishing: Catch and cook at riverside, ₹300-500
            
            HOTELS BY BUDGET:
            - Budget (₹300-1000): Tents along river, dormitories, Kasol has dozens
            - Mid-range (₹1000-2500): Parvati Woods, Hotel Alpine, stone cottages in Tosh
            - Homestay: Best experience, ₹800-1500 with meals, local Himachali families
            
            TRANSPORT:
            - Delhi to Kasol: Volvo to Bhuntar ₹1000-1500, then local bus ₹80 or taxi ₹800
            - Kasol to Tosh: Taxi ₹300 or walk 1hr
            - Local: Walking is primary mode, narrow mountain roads
            
            BEST SEASON: Mar-Jun pleasant, Sep-Nov clear skies and fewer crowds
            AVOID: Jul-Aug heavy monsoon and leeches on treks
            """);

        DESTINATIONS.put("shimla", """
            SHIMLA (Altitude: 7,238 ft, Capital of Himachal Pradesh)
            
            TOP PLACES:
            - The Ridge: Central promenade, Christ Church, sunset views, free
            - Mall Road: Shopping street, British colonial architecture
            - Jakhoo Temple: Hanuman temple at highest point, monkey-filled trek or ropeway ₹250
            - Toy Train (Kalka-Shimla): UNESCO Heritage, ₹300-600, 5-6 hour scenic journey
            - Kufri: 16km from Shimla, horse riding ₹500, yak rides, winter skiing
            - Chadwick Falls: 7km trek from Shimla, monsoon waterfall
            - Scandal Point: Historic meeting spot on The Ridge
            - Indian Institute of Advanced Study: Stunning viceregal lodge, ₹40 entry
            - Annandale: Former cricket ground, army museum
            - Green Valley: On Shimla-Kufri road, pine forest views
            
            FOOD:
            - Baljee's: Since 1950, Indian snacks and sweets, ₹200-400
            - Indian Coffee House (Mall Road): Iconic, filter coffee ₹50, dosa ₹80-150
            - Cafe Simla Times: Continental, good ambiance, ₹400-700
            - Ashiana & Goofa: Two restaurants in same building, ₹300-600
            - Cecil's: Fine dining at Oberoi Cecil, ₹2000+ for two
            - Wake & Bake: Trendy cafe, waffles and shakes, ₹300-500
            
            HOTELS BY BUDGET:
            - Budget (₹800-2000): YMCA, Hotel Dreamland, hotels on Cart Road
            - Mid-range (₹2000-5000): Hotel Combermere, Clarkes Hotel, Radisson
            - Luxury (₹5000-20000): Oberoi Wildflower Hall, Oberoi Cecil, Taj Theog
            
            TRANSPORT:
            - Delhi to Shimla: Volvo bus ₹800-1200 (8hrs), toy train from Kalka, flight ₹4000-7000
            - Local: Walking on Mall Road (no cars), local buses ₹10-30, taxis ₹200-500
            
            BEST SEASON: Mar-Jun pleasant, Dec-Feb snowfall
            """);

        DESTINATIONS.put("dharamshala", """
            DHARAMSHALA / MCLEODGANJ (Altitude: 6,831 ft, District: Kangra, Himachal Pradesh)
            
            TOP PLACES:
            - McLeodganj: Dalai Lama's residence, Tibetan colony, cafes and monasteries
            - Tsuglagkhang Complex: Main temple of Dalai Lama, Tibet Museum, free entry
            - Triund Trek: 9km, most popular day trek in HP, camping ₹500-1000, sunset views of Dhauladhar
            - Bhagsu Nag Waterfall: 2km walk from McLeodganj, temple and waterfall, free
            - St. John in the Wilderness: Gothic church from 1852, peaceful cedar forest
            - Naddi View Point: Panoramic Dhauladhar range, best at sunrise
            - Dharamkot: Quiet hilltop village, yoga retreats, hippie community
            - Kareri Lake Trek: 2-day trek, alpine lake at 9,500 ft
            - HPCA Cricket Stadium: Most beautiful cricket ground in India, Dhauladhar backdrop
            - Norbulingka Institute: Tibetan art and culture center, ₹50 entry
            
            FOOD:
            - Tibetan food everywhere: Thukpa ₹80-150, Momos ₹60-120, Tingmo
            - Nick's Italian Kitchen: Best pasta in McLeodganj, ₹200-400
            - Lung Ta Japanese Restaurant: Japanese + Tibetan fusion, ₹300-500
            - Jimmy's Italian Kitchen: Pizza and pasta, traveler favorite
            - Tibet Kitchen: Authentic Tibetan, ₹150-300
            - Moonpeak Espresso: Best coffee in town, ₹150-250
            - Namgyal Monastery cafe: Simple Tibetan food, cheapest in area
            
            HOTELS BY BUDGET:
            - Budget (₹400-1200): Zostel, Pink House, guesthouses in Dharamkot
            - Mid-range (₹1200-3500): Hotel Tibet, Chonor House, Norbu House
            - Luxury (₹3500-10000): Hyatt Regency Dharamshala, Fortune Park Moksha
            
            BEST SEASON: Mar-Jun pre-monsoon clear skies, Sep-Nov post-monsoon crisp air, Dec-Feb snow
            """);

        DESTINATIONS.put("gulmarg", """
            GULMARG (Altitude: 8,694 ft, District: Baramulla, Jammu & Kashmir)
            
            TOP PLACES:
            - Gulmarg Gondola: World's 2nd highest cable car, Phase 1 ₹740, Phase 2 ₹920 (to 13,780 ft)
            - Skiing: Dec-Mar, equipment rental ₹1500-3000/day, lessons available
            - Apharwat Peak: Via Gondola Phase 2, snow year-round, views of Nanga Parbat
            - Alpather Lake: Frozen lake trek from Gondola Phase 2 top station
            - Strawberry Valley: Meadows with wild strawberries in summer
            - Gulmarg Golf Course: World's highest green golf course, 18-hole
            - Maharani Temple: Hindu temple near bus stand
            - Seven Springs: Natural spring water source, picnic spot
            - Khilanmarg: Meadow at 10,500 ft, ski training area, wildflower meadows in summer
            
            TRANSPORT:
            - Srinagar to Gulmarg: 50km, taxi ₹2000-2500, shared taxi ₹300-400
            - No flights to Gulmarg — fly to Srinagar first
            
            BEST SEASON: Dec-Mar for skiing and snow, Jun-Aug for meadows and gondola
            """);

        DESTINATIONS.put("leh", """
            LEH / LADAKH (Altitude: 11,562 ft, Leh District, UT of Ladakh)
            
            TOP PLACES:
            - Pangong Tso: Turquoise lake on India-China border, camping ₹1000-3000/night
            - Nubra Valley: Bactrian camels at Hunder sand dunes, ₹300/ride
            - Khardung La: 17,982 ft, one of highest motorable passes
            - Magnetic Hill: Optical illusion, cars appear to roll uphill
            - Leh Palace: Mini Potala Palace, ₹15 entry, city views
            - Hemis Monastery: Largest monastery in Ladakh, famous for Hemis Festival (Jun/Jul)
            - Thiksey Monastery: "Mini Potala", morning prayer at 6am, stunning
            - Shanti Stupa: Japanese peace pagoda, best sunset spot in Leh
            - Tso Moriri: Less crowded alternative to Pangong, stunning at 15,000 ft
            - Zanskar Valley: Remote, frozen river trek in winter (Chadar Trek)
            
            TRANSPORT:
            - Delhi to Leh: Flight ₹4000-10000 (1.5hrs), Manali-Leh highway (2 days, open Jun-Sep)
            - Inner Line Permits: Required for Pangong, Nubra (₹0 for Indians, apply online)
            - Local: Rented bikes (RE ₹1500-2500/day), shared taxis, private SUVs
            
            PAYMENT TIPS:
            - Leh town: UPI and some cards work
            - Pangong/Nubra: CASH ONLY, no ATMs, no network
            - Fuel: Fill up in Leh, no petrol pumps for 300+ km stretches
            
            BEST SEASON: Jun-Sep for all passes open
            HEALTH: Serious AMS risk — rest 2 days in Leh before any excursion
            """);

        DESTINATIONS.put("rishikesh", """
            RISHIKESH (Altitude: 1,115 ft, District: Dehradun, Uttarakhand)
            
            TOP PLACES:
            - Laxman Jhula: Iconic hanging bridge (currently under renovation, view from below)
            - Ram Jhula: Walking bridge, temples on both sides
            - Beatles Ashram (Chaurasi Kutia): Where Beatles stayed 1968, ₹150 entry, graffiti art
            - River Rafting: 16km/26km rapids, ₹600-1500 depending on stretch
            - Bungee Jumping: Jumping Heights, 83m, ₹3500 per jump
            - Triveni Ghat: Evening Ganga Aarti at 6pm, free, deeply spiritual
            - Neelkanth Mahadev Temple: 30km uphill drive/trek, ancient Shiva temple
            - Camping by Ganges: Beach camping ₹800-2000/night with bonfires and meals
            
            FOOD:
            - Chotiwala Restaurant: Landmark since 1958, thali ₹200-350
            - Beatles Cafe: Near the ashram, traveler vibe, ₹200-400
            - Little Buddha Cafe: Overlooking Ganges, ₹250-400
            - Freedom Cafe: Organic food, yoga crowd, ₹200-350
            NOTE: Rishikesh is 100% vegetarian city — no meat/eggs served anywhere
            
            BEST SEASON: Sep-Nov pleasant, Feb-May for rafting
            """);
    }

    public String getKnowledgeForDestination(String destination) {
        if (destination == null || destination.isBlank()) return "";

        String lower = destination.toLowerCase().trim();
        StringBuilder knowledge = new StringBuilder();
        knowledge.append("\n\n=== LOCAL DESTINATION KNOWLEDGE BASE ===\n");

        boolean found = false;
        for (Map.Entry<String, String> entry : DESTINATIONS.entrySet()) {
            if (lower.contains(entry.getKey()) || entry.getKey().contains(lower)) {
                knowledge.append(entry.getValue()).append("\n");
                found = true;
            }
        }

        if (!found) {
            knowledge.append("No specific local data for '").append(destination).append("'. ");
            knowledge.append("Use your general knowledge but mention that real-time prices may vary.\n");
        }

        knowledge.append("\n=== GENERAL HIMACHAL & KASHMIR TIPS ===\n");
        knowledge.append("""
            - Road conditions: Mountain roads are narrow, hairpin bends. Travel in daylight only.
            - Permits: Inner Line Permit needed for Spiti (non-HP residents), Ladakh restricted areas.
            - Phone network: Jio works best in most areas. BSNL for very remote areas. No network in many high-altitude zones.
            - Medical: Carry basic first aid, Diamox for altitude, hospitals only in district HQs.
            - ATMs: Withdraw cash in major towns. ATMs in remote areas are often empty or non-functional.
            - Bargaining: Always haggle for taxis, handicrafts, and local guides. Start at 50% of asking price.
            - Online vs Cash payment for hotels: Online booking on MakeMyTrip/Goibibo is 10-20% cheaper than walk-in. In off-season, walk-in and negotiate is cheaper.
            - Credit cards: Accepted only in 3-star+ hotels and city restaurants. Everywhere else is cash/UPI.
            - Best time for budget travel: Shoulder seasons (Mar-Apr, Sep-Oct) — low crowd, low prices, decent weather.
            """);

        knowledge.append("\n=== TRANSPORT QUICK REFERENCE (INCLUDE IN ITINERARY) ===\n");
        knowledge.append("""
            MAJOR BUS ROUTES (HRTC / HPTDC):
            - Delhi ISBT Kashmere Gate → Manali: HRTC Volvo departs 5:00 PM, 7:00 PM, 8:30 PM (₹1200-1800, 12-14 hrs)
            - Delhi → Shimla: HRTC Volvo departs 8:00 PM, 9:00 PM, 10:00 PM (₹800-1200, 8-9 hrs)
            - Delhi → Dharamshala/McLeodganj: HRTC Volvo 7:00 PM, 8:30 PM (₹1100-1600, 10-12 hrs)
            - Delhi → Kullu/Bhuntar: Same buses as Manali route, drop at Bhuntar for Kasol
            - Chandigarh → Manali: HRTC buses from Sector 43, 8:00 AM, 9:00 PM (₹600-1000)
            - Shimla → Manali: HPTDC Volvo 8:00 AM (₹700-1000, 8 hrs via Mandi)
            - Manali → Kaza (Spiti): HRTC daily 5:00 AM Jun-Oct only (₹350, 10-12 hrs via Rohtang/Kunzum)
            - Shimla → Reckong Peo → Kaza: HRTC daily 7:00 AM (₹600, 2-day journey recommended overnight at Peo)

            HPTDC DELUXE COACHES:
            - Delhi → Manali Super Deluxe: ₹1500-1800, evening departures
            - Delhi → Shimla Super Deluxe: ₹1000-1300, evening departures
            - Manali → Leh HPTDC (seasonal Jun-Sep): ₹2500, 2-day journey via Keylong

            RAILWAY STATIONS:
            - Kalka: Gateway to Shimla (UNESCO Toy Train, ₹300-600, 5-6 hrs, 102 tunnels)
            - Chandigarh: For Manali, Dharamshala, Kasol — then bus/taxi
            - Pathankot: For Dharamshala (90km bus ₹200, taxi ₹2000)
            - Jammu Tawi: For Srinagar/Kashmir (300km, taxi/bus ₹600-2000)
            - Haridwar/Dehradun: For Rishikesh (30km, bus ₹40, auto ₹150)
            - Una Himachal: Small station, buses to Dharamshala/Shimla

            KEY TRAINS FROM DELHI:
            - Kalka Shatabdi (12011): Delhi 7:40 AM → Kalka 11:45 AM (₹700-1500)
            - Himalayan Queen (14095): Delhi 6:00 AM → Kalka 11:30 AM (₹200-800)
            - Jammu Rajdhani (12425): Delhi 8:30 PM → Jammu 6:00 AM (₹1200-3000)
            - Jan Shatabdi Haridwar (12055): Delhi 3:15 PM → Haridwar 7:30 PM (₹300-800)
            - Pathankot Express: Delhi 9:00 PM → Pathankot 7:00 AM (₹300-600)

            AIRPORTS:
            - Kullu-Manali (Bhuntar): Flights from Delhi (₹4000-8000), then taxi to Manali 50km (₹1000-1500)
            - Shimla (Jubbarhatti): Limited flights, small airport
            - Kangra (Gaggal): For Dharamshala, flights from Delhi (₹3500-7000), taxi 15km (₹500)
            - Srinagar (Sheikh ul-Alam): Major airport, Delhi flights ₹3000-7000, 1.5 hrs
            - Leh (Kushok Bakula): Delhi flights ₹4000-10000, only morning flights due to winds
            - Dehradun (Jolly Grant): For Rishikesh, flights from Delhi (₹3000-6000), taxi 35km (₹800)

            LOCAL TRANSPORT TIPS:
            - Shared taxis/jeeps: Available at most bus stands, 50-70% cheaper than private
            - BlaBlaCar: Works for Delhi-Manali, Delhi-Shimla routes
            - Zoomcar/Revv: Self-drive rentals from Delhi, Chandigarh (₹2000-4000/day)
            - Local buses: HRTC local ₹20-100, frequent but crowded, great for budget travel
            
            EMERGENCY NUMBERS:
            - Police: 100
            - Ambulance: 102 / 108
            - HRTC helpline: 0177-2658765
            - Himachal Tourism: 0177-2652369
            - J&K Tourism: 0194-2452690
            """);

        return knowledge.toString();
    }
}
