import os
import requests
import json
from fastapi.responses import StreamingResponse
from .rag_service import rag_service
from .models import ChatRequest, CurateRequest, SeasonRequest

CHAT_SYSTEM_PROMPT = """You are WanderTribe AI, a profoundly intuitive, innovative, and conversational travel companion.
You speak like a world-class travel expert mixed with a supportive friend. Your responses must be incredibly engaging, interactive, and beautifully structured.
DO NOT use dry, rigid tables or data dumps unless specifically asked. Instead, use:
- Engaging storytelling, evocative descriptions, and warm, inspiring language.
- Beautiful, modern markdown formatting (e.g., emojis, blockquotes for tips, bolded highlights, and clean bulleted lists).
- Thought-provoking questions at the end to keep the user excited and talking.
Weave your deep knowledge of Indian routes, hidden gems, and local culture seamlessly into the conversation.
Present recommendations as curated, vivid experiences rather than cold statistics.
CRITICAL: Output ONLY the final response. Do NOT show reasoning or meta-commentary."""

PLANNER_SYSTEM_PROMPT = """You are WanderTribe AI — the world's most detailed Indian road-trip planner.
You know every highway, dhaba, scenic viewpoint, Google-reviewed hotel, km marker, local guide, and hidden gem on Indian routes.
ALWAYS include: real place names, Google ratings (X.X★, N reviews), prices in ₹, distances in km, drive times, risk/adventure levels (🟢Safe 🟡Moderate 🔴Risky),
restaurant phone numbers for reservation (format: 📞+91-XXXXX-XXXXX), hotel booking links (MakeMyTrip/Goibibo), and local guide recommendations.
Format in rich markdown with emojis for visual appeal.
CRITICAL: Output ONLY the final answer. Do NOT show your reasoning, planning, thoughts, or any meta commentary like 'We need to' or 'Let me'."""

class AIService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.url = "https://api.groq.com/openai/v1/chat/completions"

    def _build_chat_system_prompt(self, destination: str, trip_context: dict) -> str:
        knowledge = rag_service.get_knowledge_for_destination(destination)
        prompt = f"{CHAT_SYSTEM_PROMPT}\n\nUse the following context to ground your answers:\n{knowledge}\n"
        if trip_context:
            prompt += f"\n\nCURRENT TRIP CONTEXT:\n{json.dumps(trip_context, indent=2)}\n"
        return prompt

    def _call_groq_sync(self, messages, json_mode=False) -> str:
        payload = {
            "model": "llama-3.3-70b-versatile",
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
            "model": "llama-3.3-70b-versatile",
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
                                    yield f"data: {json.dumps({'text': ''})}\n\n"
                                    return
                                try:
                                    data_json = json.loads(data_str)
                                    if "choices" in data_json and len(data_json["choices"]) > 0:
                                        delta = data_json["choices"][0].get("delta", {})
                                        text_chunk = delta.get("content", "")
                                        if text_chunk:
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

        return self._call_groq_sync(messages)

    def curate(self, request: CurateRequest) -> dict:
        knowledge = rag_service.get_knowledge_for_destination(request.destination)
        prompt = f"""ROAD-TRIP ITINERARY for: {request.destination} | {request.startDate}→{request.endDate} | ₹{request.budget}/person | Style: {request.travelStyle}
Group ideas: {request.ideas}
Notes: {request.chatSummary}

=== VERIFIED ROUTE DATA (use ONLY these towns/stops, distances & ratings) ===
{knowledge}

RULES:
1. Follow the verifiable data exactly. Never add a town/village that is not in the verified data.
2. You MAY name real hotels, cafes, dhabas and guides that are physically located IN these verified towns.

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
