import math
import heapq
from typing import List
from .models import Place
from .rag_service import rag_service

class Leg:
    def __init__(self, from_place: Place, to_place: Place, km: float, hours: float, risk: str, mode: str, via_names: List[str]):
        self.from_place = from_place
        self.to_place = to_place
        self.km = km
        self.hours = hours
        self.risk = risk
        self.mode = mode
        self.via_names = via_names

class DayPlan:
    def __init__(self, day: int):
        self.day = day
        self.places: List[Place] = []
        self.legs: List[Leg] = []
        self.drive_km = 0.0
        self.drive_hours = 0.0
        self.activity_hours = 0.0

class PathResult:
    def __init__(self):
        self.found = False
        self.km = 0.0
        self.hours = 0.0
        self.risk = "green"
        self.via_names: List[str] = []
        self.mode = "drive"

class RoutePlanner:
    def haversine_km(self, a: Place, b: Place) -> float:
        R = 6371
        d_lat = math.radians(b.lat - a.lat)
        d_lon = math.radians(b.lon - a.lon)
        s = math.sin(d_lat / 2)**2 + math.cos(math.radians(a.lat)) * math.cos(math.radians(b.lat)) * math.sin(d_lon / 2)**2
        return R * 2 * math.atan2(math.sqrt(s), math.sqrt(1 - s))

    def shortest_path(self, from_id: str, to_id: str) -> PathResult:
        result = PathResult()
        if from_id == to_id:
            result.found = True
            return result

        edges_from = {}
        for edge in rag_service.data.edges:
            if edge.from_node not in edges_from:
                edges_from[edge.from_node] = []
            edges_from[edge.from_node].append(edge)

        dist = {from_id: 0.0}
        prev_edge = {}
        prev_node = {}
        visited = set()
        pq = [(0.0, from_id)]

        while pq:
            d, u = heapq.heappop(pq)
            if u in visited:
                continue
            visited.add(u)
            if u == to_id:
                break
            
            for e in edges_from.get(u, []):
                nd = dist.get(u, float('inf')) + e.duration_hours
                if nd < dist.get(e.to, float('inf')):
                    dist[e.to] = nd
                    prev_edge[e.to] = e
                    prev_node[e.to] = u
                    heapq.heappush(pq, (nd, e.to))

        if to_id not in dist:
            return result

        path = []
        cur = to_id
        while cur in prev_edge:
            e = prev_edge[cur]
            path.insert(0, e)
            cur = prev_node[cur]

        result.found = True
        risk_rank = 0
        any_trek = False
        any_drive = False

        for i, e in enumerate(path):
            result.km += e.km
            result.hours += e.duration_hours
            rank = {"red": 2, "amber": 1, "green": 0}.get(e.risk.lower(), 0)
            risk_rank = max(risk_rank, rank)
            if e.mode.lower() == "trek":
                any_trek = True
            else:
                any_drive = True
            
            if i < len(path) - 1:
                via = rag_service.places_by_id.get(e.to)
                if via:
                    result.via_names.append(via.name)

        result.risk = ["green", "amber", "red"][risk_rank]
        if any_trek and any_drive:
            result.mode = "drive+trek"
        elif any_trek:
            result.mode = "trek"
        else:
            result.mode = "drive"
            
        return result

route_planner = RoutePlanner()
