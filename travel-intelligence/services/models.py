from pydantic import BaseModel, Field
from typing import List, Optional

class Idea(BaseModel):
    id: Optional[str] = None
    title: str

class Place(BaseModel):
    id: str
    name: str
    subRegion: str
    lat: float
    lon: float
    altitude_m: int
    type: str
    tags: List[str]
    rating: float
    reviewCount: int
    reviewSnippet: str
    bestMonths: List[int]
    idealHours: int

class SubRegion(BaseModel):
    id: str
    name: str
    entryHub: str
    connectedTo: List[str]

class RouteEdge(BaseModel):
    from_node: str = Field(alias="from")
    to: str
    mode: str
    km: float
    duration_hours: float
    road_type: Optional[str] = None
    difficulty: Optional[str] = None
    altitude_gain_m: Optional[int] = None
    scenic: int
    seasonal: List[int]
    risk: str
    bidirectional: bool

class TrekInfo(BaseModel):
    id: str
    name: str
    base: str
    endpoint: str
    days: int
    difficulty: str
    altitude_m: int
    season: List[int]
    highlights: str
    permit_required: bool
    guide_recommended: bool

class RegionData(BaseModel):
    subRegions: List[SubRegion]
    places: List[Place]
    edges: List[RouteEdge]
    treks: List[TrekInfo]

class ChatRequest(BaseModel):
    prompt: str
    history: List[dict] = []
    tripContext: Optional[dict] = None

class CurateRequest(BaseModel):
    destination: str
    startDate: str
    endDate: str
    budget: str
    travelStyle: str
    ideas: str
    chatSummary: str

class SeasonRequest(BaseModel):
    destination: str
