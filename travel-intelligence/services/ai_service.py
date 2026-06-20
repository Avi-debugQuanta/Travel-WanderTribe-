import os
import requests
import json
from fastapi.responses import StreamingResponse
from .rag_service import rag_service
from .models import ChatRequest, CurateRequest, SeasonRequest

OFFICIAL_INVENTORY = """
[HOTELS]
- Mountain View Resort (Manali) | ₹3500 | ⭐ 4.5 | Vibe: Cozy & Warm
- Pine Valley Homestay (Kasol) | ₹1200 | ⭐ 4.2 | Vibe: Rustic & Authentic
- Snow Peak Lodge (Shimla) | ₹5000 | ⭐ 4.8 | Vibe: Luxury Heritage
- Riverside Camp (Rishikesh) | ₹800 | ⭐ 4.0 | Vibe: Adventure & Wild
- Dal Lake Houseboat (Srinagar) | ₹4000 | ⭐ 4.7 | Vibe: Royal & Serene
- Apple Orchard Cottage (Naggar) | ₹2000 | ⭐ 4.3 | Vibe: Peaceful & Green
- The Village Cafe & Stay (Tosh) | ₹1500 | ⭐ 4.4 | Vibe: Hippie & Relaxed
- Zostel (Spiti) | ₹1000 | ⭐ 4.6 | Vibe: Backpacker & Social
- Solang Ski Resort (Manali) | ₹6000 | ⭐ 4.7 | Vibe: Luxury & Adventure
- Backpacker Panda (Manali) | ₹800 | ⭐ 4.4 | Vibe: Backpacker & Social
[CABS]
- Mountain Wheels - Innova Crysta | ₹3000 | ⭐ 4.6 | Best for families
- Hill Taxi - Swift Dzire | ₹1800 | ⭐ 4.3 | Budget friendly sedan
- Valley Rides - Tempo Traveller | ₹4500 | ⭐ 4.5 | Perfect for large groups
- Adventure Jeep - Thar 4x4 | ₹3500 | ⭐ 4.8 | Offroad beast
[FOOD STALLS]
- Sharma Dhaba (Manali) | ₹300 | ⭐ 4.6 | Authentic & Rustic
- Evergreen Cafe (Kasol) | ₹400 | ⭐ 4.5 | Hippie & Chill
- Lhasa Kitchen (Dharamshala) | ₹350 | ⭐ 4.7 | Peaceful & Authentic
- Wazwan House (Srinagar) | ₹500 | ⭐ 4.8 | Royal & Traditional
- Chacha Chai (Spiti Valley) | ₹200 | ⭐ 4.4 | Roadside & Raw
"""

CHAT_SYSTEM_PROMPT = """You are WanderTribe AI, an incredibly knowledgeable, intuitive, and interactive travel companion.
You speak like a real human travel buddy, but you possess EXTENSIVE, IN-DEPTH knowledge about every destination, hidden gem, dhaba, and hotel.
Your responses must be engaging, interactive, and deeply informative.
DO NOT use dry, rigid tables or data dumps unless specifically asked.
DO NOT write long, exhausting paragraphs. Keep your messages structured and punchy.
Instead, use:
- Deep, specific facts (exact prices, distances, local secrets, specific dish names at restaurants).
- Engaging storytelling and warm language.
- Beautiful, modern markdown formatting (e.g., emojis, blockquotes for tips).
- Thought-provoking questions at the end to keep the user excited and talking.

CRITICAL HOTEL/CAB/FOOD RULE: You MUST ONLY recommend Hotels, Cabs, Drivers, or Food Stalls from the OFFICIAL PLATFORM INVENTORY provided below in the prompt. Do NOT invent or suggest anything outside this inventory.
Whenever you mention an item from the inventory, you MUST provide:
1. Its exact Name and Location.
2. Its unique Vibe/Aesthetic.
3. Its Google Rating (e.g., ⭐ 4.5).
4. A markdown link that EXACTLY matches this format to open the Bookings tab inside WanderTribe: [Book {Name}](#bookings)
NEVER use external links or godaddy links!

Weave your deep knowledge of Indian routes and hidden gems seamlessly into the conversation.
CRITICAL: Output ONLY the final response. Do NOT show reasoning or meta-commentary."""

PLANNER_SYSTEM_PROMPT = """You are WanderTribe AI — the world's most detailed and passionate Indian road-trip planner.
You know every highway, dhaba, scenic viewpoint, hotel, km marker, local guide, and hidden gem on Indian routes.
Write the itinerary with a WARM, PERSONALIZED, AND EXCLUSIVE VIBE, making the user feel like this is a handcrafted journey just for them. Use vivid descriptions.
ALWAYS include: real place names, Google ratings (X.X★, N reviews), prices in ₹, distances in km, drive times, risk/adventure levels (🟢Safe 🟡Moderate 🔴Risky),
restaurant phone numbers for reservation (format: 📞+91-XXXXX-XXXXX).
CRITICAL: You MUST ONLY recommend hotels, cabs, and food stalls from the OFFICIAL PLATFORM INVENTORY provided below.
All hotel links MUST be branded to open the internal bookings tab: [Book {Hotel Name}](#bookings). NEVER mention MakeMyTrip, Goibibo, or external sites.
Format in rich markdown with emojis for visual appeal.
CRITICAL: Output ONLY the final answer. Do NOT show your reasoning, planning, thoughts, or any meta commentary like 'We need to' or 'Let me'."""

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.url = "https://api.groq.com/openai/v1/chat/completions"
        self.training_log_file = "chat_training_data.jsonl"

    def _log_interaction(self, prompt: str, response: str, context: dict = None):
        try:
            import datetime
            entry = {
                "timestamp": datetime.datetime.now().isoformat(),
                "prompt": prompt,
                "response": response,
                "context": context or {}
            }
            with open(self.training_log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            print(f"Failed to log training data: {e}")

    def _build_chat_system_prompt(self, destination: str, trip_context: dict) -> str:
        knowledge = rag_service.get_knowledge_for_destination(destination)
        prompt = f"{CHAT_SYSTEM_PROMPT}\n\nOFFICIAL PLATFORM INVENTORY (ONLY RECOMMEND FROM THIS LIST):\n{OFFICIAL_INVENTORY}\n\nUse the following context to ground your answers:\n{knowledge}\n"
        if trip_context:
            prompt += f"\n\nCURRENT TRIP CONTEXT:\n{json.dumps(trip_context, indent=2)}\n"
        return prompt

    def _call_groq_sync(self, messages, json_mode=False) -> str:
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 4096,
            "stream": False
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        try:
            response = requests.post(self.url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return self._clean_ai_text(content)
            else:
                return f"Error: LLM returned {response.status_code} - {response.text}"
        except Exception as e:
            return f"Error connecting to LLM: {str(e)}"

    def _clean_ai_text(self, content: str) -> str:
        # Strip reasoning blocks if any
        import re
        c = re.sub(r'(?s)<think>.*?</think>', '', content)
        c = re.sub(r'(?s)<reasoning>.*?</reasoning>', '', c)
        c = re.sub(r'```json', '', c)
        c = re.sub(r'```', '', c)
        return c.strip()

    def chat_stream(self, request: ChatRequest):
        destination = request.tripContext.get("destination", "manali") if request.tripContext else "manali"
        system_instruction = self._build_chat_system_prompt(destination, request.tripContext)
        
        messages = [{"role": "system", "content": system_instruction}]
        for msg in request.history:
            role = "assistant" if msg.get("role") == "ASSISTANT" else "user"
            messages.append({"role": role, "content": msg.get("content", "")})
        messages.append({"role": "user", "content": request.prompt})

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1024,
            "stream": True
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        def event_stream():
            full_response = ""
            try:
                with requests.post(self.url, json=payload, headers=headers, stream=True) as response:
                    if response.status_code != 200:
                        yield f"data: {json.dumps({'error': f'Failed to fetch from LLM: {response.text}'})}\n\n"
                        return
                    for line in response.iter_lines():
                        if line:
                            decoded_line = line.decode('utf-8')
                            if decoded_line.startswith("data: "):
                                data_str = decoded_line[6:]
                                if data_str.strip() == "[DONE]":
                                    # Log the complete interaction once the stream is done
                                    self._log_interaction(request.prompt, full_response, request.tripContext)
                                    yield f"data: {json.dumps({'text': ''})}\n\n"
                                    return
                                try:
                                    data_json = json.loads(data_str)
                                    if "choices" in data_json and len(data_json["choices"]) > 0:
                                        delta = data_json["choices"][0].get("delta", {})
                                        text_chunk = delta.get("content", "")
                                        if text_chunk:
                                            full_response += text_chunk
                                            yield f"data: {json.dumps({'text': text_chunk})}\n\n"
                                except json.JSONDecodeError:
                                    pass
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    def chat_sync(self, request: ChatRequest) -> str:
        destination = request.tripContext.get("destination", "manali") if request.tripContext else "manali"
        system_instruction = self._build_chat_system_prompt(destination, request.tripContext)
        
        messages = [{"role": "system", "content": system_instruction}]
        for msg in request.history:
            role = "assistant" if msg.get("role") == "ASSISTANT" else "user"
            messages.append({"role": role, "content": msg.get("content", "")})
        messages.append({"role": "user", "content": request.prompt})

        result = self._call_groq_sync(messages)
        self._log_interaction(request.prompt, result, request.tripContext)
        return result

    def curate(self, request: CurateRequest) -> dict:
        # 1. Ambiguity Check (Middleware)
        # If the user hasn't already provided clarification answers, check if we need them
        if not request.clarificationAnswers:
            ambiguity_prompt = f"""Review the following travel request:
Destination: {request.destination}
Dates: {request.startDate} to {request.endDate}
Budget: {request.budget}
Style: {request.travelStyle}
User Notes: {request.chatSummary}

Is this request too vague to build a highly detailed itinerary? For example, if it lacks details on group composition (solo/family/friends), specific interests (adventure/relaxation/culture), or preferred transport.
If it is TOO VAGUE, return JSON with "needs_clarification": true and a "questions" array of 2-3 specific questions to ask the user.
If it is CLEAR ENOUGH, return "needs_clarification": false.
Output ONLY valid JSON."""

            ambiguity_messages = [
                {"role": "system", "content": "You are a travel ambiguity checker. Output ONLY valid JSON."},
                {"role": "user", "content": ambiguity_prompt}
            ]
            
            ambiguity_res = self._call_groq_sync(ambiguity_messages, json_mode=True)
            try:
                ambiguity_data = json.loads(ambiguity_res)
                if ambiguity_data.get("needs_clarification") and ambiguity_data.get("questions"):
                    return {
                        "type": "clarification",
                        "questions": ambiguity_data["questions"]
                    }
            except Exception as e:
                print(f"[Ambiguity Check Failed] {e}")

        # 2. Proceed to generation
        knowledge = rag_service.get_knowledge_for_destination(request.destination)
        
        clarifications_text = f"\nUser's Clarifications: {request.clarificationAnswers}\n" if request.clarificationAnswers else ""
        
        prompt = f"""ROAD-TRIP ITINERARY for: {request.destination} | {request.startDate}→{request.endDate} | ₹{request.budget}/person | Style: {request.travelStyle}
Group ideas: {request.ideas}
Notes: {request.chatSummary}{clarifications_text}

=== VERIFIED ROUTE DATA (use ONLY these towns/stops, distances & ratings) ===
{knowledge}

=== OFFICIAL PLATFORM INVENTORY (ONLY RECOMMEND FROM THIS LIST) ===
{OFFICIAL_INVENTORY}

RULES:
1. Follow the verified route data exactly. Never add a town/village that is not in the verified data.
2. For Hotels, Cabs, and Food Stalls, you MUST ONLY use items from the OFFICIAL PLATFORM INVENTORY above.

For EACH day include:
## Day X: [Title]
**Route:** A→B→C
**Scenic:** ★★★★☆
Route stops table: | Km | Stop | Activity | Duration |
Hour-by-hour schedule (6AM-10PM)
Hotel: name, ⭐rating (reviews), ₹price, 📞phone, booking link
Food table: | Meal | Place | Dish | ₹Cost | ⭐ | 📞Phone |
Risk table: | Activity | 🟢Safe/🟡Moderate/🔴Risky | Tip |
Guide: name, 📞phone, ₹cost/day
Day budget table
3 insider tips

MUST OUTPUT IN STRICT JSON ONLY.
Format required:
{{
  "days": [
    {{
      "day": 1,
      "title": "Title",
      "route": "A -> B",
      "scenicRating": "★★★★☆",
      "stops": ["Km 10: Stop 1 - Activity (1 hr)"],
      "schedule": ["08:00 AM - Breakfast at X (₹200) ⭐4.5 📞+91-XXXXX"],
      "hotel": "Hotel Name ⭐4.5 ₹2000 📞+91-XXXXX",
      "food": ["Lunch at Y - Dish (₹300) ⭐4"],
      "risks": ["Activity - 🟢Safe - Tip"],
      "guide": "Name 📞+91-XXXXX ₹1000/day",
      "budget": "₹3000 total",
      "tips": ["Tip 1", "Tip 2", "Tip 3"]
    }}
  ],
  "tips": ["Global Tip 1"],
  "packingList": ["Item 1", "Item 2"]
}}"""
        messages = [
            {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        result = self._call_groq_sync(messages, json_mode=True)
        try:
            return json.loads(result)
        except:
            # Fallback wrapper if parsing fails
            return {"days": [], "tips": ["Failed to parse AI response. " + result], "packingList": []}

    def season(self, request: SeasonRequest) -> str:
        prompt = f"""Create a DETAILED month-by-month travel guide for {request.destination}:
For EACH month include:
- Temperature range & weather
- Road conditions (🟢Open 🟡Risky 🔴Closed)
- Crowd level (1-5)
- Festivals/Events happening
- Best activities for that month
- Risk level for travel

End with:
## 🏆 TOP RECOMMENDATION
[Best month with reasons]

## ❌ AVOID
[Worst months with reasons]

Use tables and rich markdown."""
        messages = [
            {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        return self._call_groq_sync(messages)

ai_service = AIService()
