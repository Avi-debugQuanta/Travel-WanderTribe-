from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="WanderTribe Intelligence Engine")

# Allow Spring Boot / React to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from services.ai_service import ai_service
from services.models import ChatRequest, CurateRequest, SeasonRequest

@app.post("/ai/chat/stream")
def chat_stream(request: ChatRequest):
    return ai_service.chat_stream(request)

@app.post("/ai/chat")
def chat_sync(request: ChatRequest):
    return {"response": ai_service.chat_sync(request)}

@app.post("/ai/curate")
def curate_itinerary(request: CurateRequest):
    return ai_service.curate(request)

@app.post("/ai/season")
def get_season(request: SeasonRequest):
    return {"response": ai_service.season(request)}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "travel-intelligence"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
