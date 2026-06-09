# WanderTribe AI — Architecture & Learning Guide

> A complete, plain-language guide to building a Route-Aware RAG Agent for travel itinerary generation.
> Read this top-to-bottom. Every section builds on the previous one.

---

## Table of Contents

1. [The Problem We're Solving](#1-the-problem-were-solving)
2. [The Big Picture Solution](#2-the-big-picture-solution)
3. [What is an LLM and Why Does It Hallucinate?](#3-what-is-an-llm-and-why-does-it-hallucinate)
4. [RAG — The Core Technique](#4-rag--retrieval-augmented-generation)
5. [Embeddings — Teaching Computers "Meaning"](#5-embeddings--teaching-computers-meaning)
6. [Vector Similarity — Finding "Similar" Things](#6-vector-similarity--finding-similar-things)
7. [The Knowledge Graph — Our Travel Notebook](#7-the-knowledge-graph--our-travel-notebook)
8. [Retrieval Strategies — The Smart Librarian](#8-retrieval-strategies--the-smart-librarian)
9. [Graph Algorithms — Planning the Route Order](#9-graph-algorithms--planning-the-route-order)
10. [Putting It All Together — Full Architecture](#10-putting-it-all-together--full-architecture)
11. [Before vs After — The Improvement](#11-before-vs-after--the-improvement)
12. [How It Integrates With Our Existing App](#12-how-it-integrates-with-our-existing-app)
13. [The Data Pipeline — Where Knowledge Comes From](#13-the-data-pipeline--where-knowledge-comes-from)
14. [The JSON Schema — Our Notebook Format](#14-the-json-schema--our-notebook-format)
15. [Implementation Roadmap](#15-implementation-roadmap)
16. [Learning Resources](#16-learning-resources)

---

## 1. The Problem We're Solving

### What goes wrong today

When a user creates a trip to **Manali** and clicks "Generate Itinerary", here's what happens:

1. Our app sends a message to the AI: *"Plan a trip to Manali, 5 days, chill style"*
2. The AI **guesses from memory** — it has read the entire internet during training, so it vaguely knows Manali
3. Sometimes it produces good results, sometimes it says things like *"Day 3: Stay at a hotel in Rishikesh"*

**Why does this happen?**

Rishikesh and Manali are both "Himalayan destinations" in the AI's blurry memory. The AI has no map, no distance chart, no concept of "these two places are 500 km apart and in different states." It just associates words.

### The real-world analogy

Imagine hiring a brilliant tour guide who plans trips **blindfolded, from memory only.** He's traveled everywhere and knows a lot — but without a map in front of him, he sometimes mixes up places that "sound similar" or are in the "same category" in his head.

**Our fix:** Give the guide a notebook and a map. Before answering, he reads the right page. Now he can only use real, connected places.

---

## 2. The Big Picture Solution

We're building a system with these parts:

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CLICKS "GENERATE ITINERARY"          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: REGION RESOLVER                                     │
│  "Manali" → belongs to "Kullu-Manali" + "Parvati Valley"    │
│  This decides WHICH PAGES of the notebook to open            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: RETRIEVER (The Smart Librarian)                     │
│  Looks at: trip style ("chill"), ideas ("offbeat treks"),    │
│  and finds the 10-15 BEST matching places from that region   │
│  Uses: keyword matching + meaning matching (embeddings)      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: ROUTE PLANNER (The Map)                             │
│  Takes those 10-15 places and ORDERS them geographically     │
│  So Day 1 → Day 2 → Day 3 follows REAL roads                │
│  Respects: max 5-6 hours driving per day                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: GROUNDED PROMPT                                     │
│  Builds a prompt with REAL facts:                            │
│  "Here are the actual places, their ratings, distances,      │
│   and the order to visit them. Write a day-by-day plan."     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: LLM (Same AI we already use — Qwen/Groq/Gemini)    │
│  NOW the AI writes beautifully — but ONLY using the facts    │
│  we gave it. It CAN'T hallucinate wrong places.              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  OUTPUT: Perfect, geographically coherent itinerary           │
│  Manali → Kasol → Kalga → Kheerganga (real order, real km)   │
└─────────────────────────────────────────────────────────────┘
```

Each of these 5 steps is one module we build. Let's understand each piece deeply.

---

## 3. What is an LLM and Why Does It Hallucinate?

### What an LLM actually is

LLM = Large Language Model (like ChatGPT, Gemini, Qwen — the AI we use).

At its core, an LLM is a **next-word prediction machine.** You give it some text, and it predicts the most likely next word, over and over, until it has a full answer.

How it learned: during training, it read billions of web pages, books, articles. It compressed all that into patterns about "what words tend to follow other words."

### Why it "hallucinates" (makes stuff up)

The AI doesn't "know" facts the way you know your phone number. It knows **patterns.**

When you ask "plan a Manali trip", it thinks:
- "Manali" often appears near "Himalayas", "snow", "adventure"
- "Rishikesh" also appears near "Himalayas", "adventure", "spiritual"
- These patterns overlap → sometimes it grabs Rishikesh when you asked for Manali

It's not lying. It's **pattern-matching without fact-checking.** It has no internal map saying "Rishikesh is 500 km from Manali and that doesn't make sense in a 5-day trip."

### The key insight

**Whatever you put IN the prompt, the AI trusts and uses heavily.**

If your prompt says:
> "Here are the ONLY places near Manali: Kasol (75km), Kalga (90km), Tosh (82km). Plan using ONLY these."

Then the AI will use those. It physically can't say Rishikesh because Rishikesh isn't in the prompt.

**This is our entire strategy:** control what goes into the prompt, and the output becomes correct.

### Learn more
- 📺 [But what is a GPT? Visual intro to transformers (3Blue1Brown)](https://www.youtube.com/watch?v=wjZofJX0v4M) — Best visual explanation of how LLMs work, no math needed
- 📺 [How ChatGPT Works Technically (Fireship)](https://www.youtube.com/watch?v=flXrLGPY3SU) — 5-minute overview, very beginner-friendly
- 📺 [LLM Hallucinations Explained (IBM)](https://www.youtube.com/watch?v=cfqtFvWOfg0) — Why AI makes things up

---

## 4. RAG — Retrieval-Augmented Generation

### The name broken down

- **Retrieval** = fetch relevant facts from a database
- **Augmented** = add those facts to the AI's input
- **Generation** = let the AI write its answer using those facts

### The chai-shop analogy

You walk into a chai shop and ask the owner: *"What's the best route from Manali to Spiti?"*

**Without RAG (today):** The owner tries to remember from years ago. Maybe gets it right, maybe mixes up details.

**With RAG:** The owner pulls out a well-maintained diary, flips to the "Manali to Spiti" page, reads the current road conditions, and gives you a perfect answer from the diary.

The owner (AI) is the same person. The only difference is whether he has the diary (retrieved facts) in front of him or not.

### How RAG works in code (conceptually)

```
1. User asks: "Plan 5-day Manali chill trip"

2. BEFORE sending to AI, our code does:
   → Search our database for places near Manali
   → Search for "chill" type places
   → Get: [Kasol, Tosh, Kalga, Old Manali, Sethan]
   → Get distances: Manali→Kasol 75km, Kasol→Kalga 16km...

3. We BUILD the prompt:
   "You are a travel planner. Here are REAL places and routes:
    - Kasol: riverside cafes, 4.3 stars, 75km from Manali
    - Kalga: quiet village, 4.6 stars, 16km from Kasol
    - ...
    Plan a 5-day trip using THESE places. Include distances."

4. Send to AI → AI writes beautifully using ONLY our facts
```

**The AI becomes a great writer working from a fact sheet, instead of a guesser.**

### Why RAG and not "training/fine-tuning"?

| Approach | What it means | Cost | Effort | When data changes |
|----------|--------------|------|--------|-------------------|
| Fine-tuning | Change the AI's brain permanently | $$$$$ (GPU hours) | Weeks of ML work | Retrain from scratch |
| RAG | Feed facts at query time | Free (just prompting) | Days of coding | Just update the database |

For us: RAG is the right choice. We're on free tier, our data changes (new places, seasonal roads), and we don't need ML expertise.

### Learn more
- 📺 [RAG Explained in 5 Minutes (IBM)](https://www.youtube.com/watch?v=T-D1OfcDW1M) — Clearest short explanation
- 📺 [RAG from Scratch (LangChain)](https://www.youtube.com/watch?v=sVcwVQRHIc8) — Full tutorial, 14 parts
- 📺 [What is RAG? (Fireship)](https://www.youtube.com/watch?v=T-D1OfcDW1M) — Quick overview with code
- 📖 [RAG paper (original)](https://arxiv.org/abs/2005.11401) — The academic paper that started it all (optional, heavy)

---

## 5. Embeddings — Teaching Computers "Meaning"

This is the most important AI concept to understand. Take it slow.

### The problem

Computers only understand numbers. They don't understand that "chill village" and "peaceful hamlet" mean the same thing. If you search by keywords, "chill village" won't find a place described as "peaceful hamlet."

### The solution: Embeddings

An **embedding** is a way to convert text into a list of numbers that captures its **meaning.**

Think of it like GPS coordinates — but for meaning instead of geography.

**GPS for geography:**
- Delhi = [28.6, 77.2]
- Manali = [32.2, 77.1]
- Places that are CLOSE on the map have SIMILAR coordinates

**Embeddings for meaning:**
- "chill riverside cafe" = [0.2, 0.8, 0.1, 0.9, ...]  (hundreds of numbers)
- "peaceful waterside restaurant" = [0.21, 0.79, 0.12, 0.88, ...]  (very similar!)
- "extreme bungee jumping" = [0.9, 0.1, 0.8, 0.2, ...]  (very different!)

Things with **similar meaning** get **similar number lists.** Things with different meaning get different number lists.

### Where do embeddings come from?

A special AI model (not the chat AI, a different smaller one) converts text to numbers. We'll use Google's free `text-embedding-004` model.

You send: `"Kasol: peaceful riverside village with Israeli cafes and mountain views"`
It returns: `[0.12, 0.45, 0.78, 0.33, ...]` (768 numbers)

You do this ONCE for each place in your database and store the numbers. Then when a user searches, you convert their search into numbers too and find the closest matches.

### Visual intuition

Imagine a 2D map of "meaning space" (real embeddings are 768-dimensional, but the idea is the same):

```
        ADVENTURE ↑
                  |
    Bungee ●     |     ● Paragliding
                  |
    Rafting ●     |
                  |
──────────────────┼──────────────────→ CHILL
                  |
         Tosh ●  |  ● Kalga
                  |
       Kasol ●   |     ● Sethan
                  |
```

When a user says "I want chill", we convert that to coordinates pointing to the bottom-right area → we find Kasol, Kalga, Tosh, Sethan (the nearby dots).

### How we use embeddings in our project

1. **At startup:** Convert every place's description into an embedding (list of numbers). Store them.
2. **When user asks:** Convert the trip request ("chill, offbeat, 5 days near Manali") into an embedding.
3. **Find closest:** Compare the request's numbers to each place's numbers. The closest ones are the most relevant places.

### Learn more
- 📺 [Word Embeddings — Computerphile](https://www.youtube.com/watch?v=gQddtTdmG_8) — Excellent plain explanation
- 📺 [Embeddings Explained Visually (StatQuest)](https://www.youtube.com/watch?v=viZrOnJclY0) — Best visual, step by step
- 📺 [What are Vector Embeddings? (Weaviate)](https://www.youtube.com/watch?v=klTvEwg3oJ4) — Practical angle
- 📺 [Sentence Embeddings (James Briggs)](https://www.youtube.com/watch?v=OATCgQtNX2o) — More hands-on
- 📖 [Google's text-embedding-004 docs](https://ai.google.dev/gemini-api/docs/embeddings) — The specific model we'll use

---

## 6. Vector Similarity — Finding "Similar" Things

### The problem

You have 100 places, each with an embedding (list of 768 numbers). User query also has an embedding. How do you find which places are "closest in meaning"?

### Cosine Similarity — The core math

Don't worry about the formula. Here's the intuition:

Imagine two arrows pointing from the center of a circle. **Cosine similarity measures the angle between them.**

- Same direction (angle = 0°) → similarity = 1.0 (identical meaning)
- Right angle (90°) → similarity = 0.0 (unrelated)
- Opposite direction (180°) → similarity = -1.0 (opposite meaning)

```
             Similar (small angle)
            ↗ Query: "chill village"
           /
          / ← small angle = high similarity
         /
        ↗ Place: "Kasol: peaceful riverside town"


             Different (big angle)
            ↗ Query: "chill village"
           /
          /
         /
        /
       /
      ↗ Place: "Bungee jumping extreme sport" ← big angle = low similarity
```

### In practice (what the code does)

```
1. User: "chill offbeat trip"
   → Embedding: [0.2, 0.8, 0.1, 0.9, ...]

2. Compare to each place:
   Kasol [0.21, 0.79, 0.12, 0.88]  → cosine = 0.97 (very similar!)
   Kalga [0.19, 0.82, 0.08, 0.91]  → cosine = 0.95 (very similar!)
   Solang [0.7, 0.3, 0.8, 0.2]     → cosine = 0.31 (not similar)

3. Sort by similarity, take top 10 → [Kasol, Kalga, Tosh, Sethan, ...]
```

### Why this is powerful

- "snow village quiet" finds "Tosh" even though "snow", "village", "quiet" don't literally appear in Tosh's description
- It understands MEANING, not just keywords
- It works in any language conceptually

### Learn more
- 📺 [Cosine Similarity — Normalized Nerd](https://www.youtube.com/watch?v=e9U0QAFbfLI) — Short, visual, perfect
- 📺 [Vector Search Explained (Pinecone)](https://www.youtube.com/watch?v=dN0lsF2cvm4) — How it's used in practice
- 📺 [KNN and Similarity Search (StatQuest)](https://www.youtube.com/watch?v=HVXime0nQeI) — K-nearest neighbors concept

---

## 7. The Knowledge Graph — Our Travel Notebook

### What is a graph? (Not a chart!)

In computer science, a "graph" is NOT a bar chart or line chart. It means:

- **Nodes** (dots) = things (places)
- **Edges** (lines between dots) = connections (roads)

Real-world example — your metro map IS a graph:
- Stations = nodes
- Metro lines between them = edges

Our travel graph:
- Places (Manali, Kasol, Kalga...) = nodes
- Roads between them (75km, 3 hours...) = edges

```
    Manali ●────── 75km, 3hrs ──────● Kasol
                                       │
                                    16km, 0.8hrs
                                       │
                                       ● Kalga
                                       │
                                    11km, 5hrs (trek!)
                                       │
                                       ● Kheerganga
```

### Why a graph and not just a list?

A list tells you WHAT exists. A graph tells you **HOW things connect.**

- List: "Manali, Kasol, Kalga, Rishikesh" (all exist, but are they connected? No idea!)
- Graph: "Manali→Kasol→Kalga" (connected!) and Rishikesh is NOT in this graph at all

**The graph IS the geographic guardrail.** If a place isn't connected by edges to your destination, it can never appear in the itinerary. Rishikesh isn't in the Himachal graph → it's impossible to suggest it. Bug killed permanently.

### Our graph has extra info on each edge

Each road/trek connection carries data:

| Field | What it means | Why we need it |
|-------|--------------|----------------|
| km | Distance | Display to user |
| duration_hours | Time to travel | Daily planning budget |
| mode | "drive" or "trek" | Different planning logic |
| scenic | 1-5 beauty rating | Prefer prettier routes |
| seasonal | Which months open | Don't suggest closed roads |
| risk | green/amber/red | Safety info for user |
| bidirectional | Can go both ways? | Most roads yes, some loops no |

### Learn more
- 📺 [Graph Data Structure — CS Dojo](https://www.youtube.com/watch?v=gXgEDyodOJU) — Best beginner explanation
- 📺 [Graph Theory Introduction (WilliamFiset)](https://www.youtube.com/watch?v=DgXR2OWQnLc) — Full series, start with first video
- 📺 [What is a Knowledge Graph? (Google)](https://www.youtube.com/watch?v=mmQl6VGvX-c) — Google's own explanation

---

## 8. Retrieval Strategies — The Smart Librarian

### The three types of search we'll combine

When a user says "chill offbeat trip near Manali", we need to find the best matching places. There are three ways to search:

### Strategy 1: Lexical Search (Keyword Matching)

**How it works:** Look for exact words.
- User says "Kasol" → find documents containing the word "Kasol"

**Strengths:**
- Fast and simple
- Perfect when user mentions a specific place name
- Never misses an exact match

**Weaknesses:**
- "chill snowy village" won't find "Tosh" because the word "chill" isn't in Tosh's description
- Doesn't understand meaning, just words

**Algorithm: BM25** — The standard keyword search algorithm. Scores documents by how many query words they contain, weighted by rarity. (A rare word match scores higher than a common word match.)

### Strategy 2: Semantic/Dense Search (Embeddings)

**How it works:** Convert both query and documents to embeddings, find closest by cosine similarity.

**Strengths:**
- Understands meaning — "chill village" finds "peaceful hamlet"
- Captures vibes and moods
- Works even with unusual phrasings

**Weaknesses:**
- Sometimes too fuzzy — might match things that "feel" similar but are wrong
- Slower than keyword search
- Needs an embedding model (API call)

### Strategy 3: Hybrid Search (What we'll use)

**How it works:** Run BOTH searches, combine their scores.

```
Final Score = (0.3 × keyword score) + (0.7 × embedding score)
```

This gives you:
- Precision of keywords (exact names always found)
- Intelligence of embeddings (vibes and meaning)

**Plus the geographic guardrail:** Before ANY search, filter to only places in the right sub-region. This is the most important step — it eliminates all out-of-region noise before matching even starts.

```
1. User: "chill trip near Manali"
2. Region resolver: Manali → kullu_manali + parvati_valley (connected sub-regions)
3. Filter: only consider places in these sub-regions (removes Rishikesh, Goa, etc.)
4. Keyword search among filtered places → scores
5. Embedding search among filtered places → scores
6. Combine → final ranked list
7. Take top 10-15 → these go to the route planner
```

### Learn more
- 📺 [BM25 — The Most Used Search Algorithm (James Briggs)](https://www.youtube.com/watch?v=a3sg6MH8m4k) — Clear explanation
- 📺 [Hybrid Search Explained (Weaviate)](https://www.youtube.com/watch?v=lpdN3aw-yTg) — Lexical + semantic combined
- 📺 [Vector Databases Explained (Fireship)](https://www.youtube.com/watch?v=klTvEwg3oJ4) — Big picture of vector search

---

## 9. Graph Algorithms — Planning the Route Order

### The problem

The retriever gave us 10-12 great places. But in what ORDER should the user visit them? We need:
- No zig-zagging (don't go Manali → Kaza → back to Kasol → back to Kaza)
- Maximum ~5-6 hours of travel per day
- Start from the entry hub (usually where you arrive)

This is a **route optimization** problem. Two algorithms help:

### Algorithm 1: Greedy Nearest-Neighbor

**The simplest approach. Like how you'd naturally plan:**

1. Start at Manali (entry hub)
2. Look at all connected unvisited places. Go to the CLOSEST one. → Kasol (3 hrs)
3. From Kasol, look at connected unvisited places. Closest? → Kalga (0.8 hrs)
4. From Kalga, closest? → Kheerganga (5 hr trek)
5. Continue until all places visited or days run out

**Strengths:** Fast, intuitive, usually produces sensible routes
**Weakness:** Not always the absolute optimal order (but for travel, "sensible" beats "mathematically perfect")

### Algorithm 2: Dijkstra's Shortest Path

**Used for connecting legs** — when we need the shortest route between two specific places that aren't directly connected.

Example: User wants to visit both Kasol AND Kaza. These aren't directly connected in one road. Dijkstra finds: Kasol → Manali → Atal Tunnel → Sissu → Keylong → Kaza (the actual route with total km and time).

Think of Google Maps "fastest route" — that's essentially Dijkstra.

### How we combine them

```
1. Start with entry hub (Manali)
2. Group places by sub-region clusters
3. Use greedy nearest-neighbor within each cluster
4. Use Dijkstra to find connecting paths between clusters
5. Split into days: whenever cumulative hours > 5-6, start new day
6. Result: Day 1 [Manali, Solang], Day 2 [Kasol, Kalga], Day 3 [Kheerganga trek]...
```

### The daily time budget

We set a rule: **no more than 5-6 hours of travel per day** (this is configurable for "chill" vs "adventure" styles).

- Chill style → 4 hours max driving per day, more relaxation
- Adventure style → 7 hours per day, cover more ground

The algorithm keeps adding stops until the day's travel time is used up, then starts a new day.

### Learn more
- 📺 [Dijkstra's Algorithm Visualized (Computerphile)](https://www.youtube.com/watch?v=GazC3A4OQTE) — Best visual walkthrough
- 📺 [Greedy Algorithms (Abdul Bari)](https://www.youtube.com/watch?v=ARvQcqJ_-NY) — General concept
- 📺 [Shortest Path Algorithms (WilliamFiset)](https://www.youtube.com/watch?v=pSqmAO-m7Lk) — Full series
- 📺 [Travelling Salesman Problem (Reducible)](https://www.youtube.com/watch?v=GiDsjIBOVoA) — Why route ordering is hard (and when "good enough" is fine)

---

## 10. Putting It All Together — Full Architecture

Here's every piece and how data flows through the system:

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                │
│                                                                   │
│  himachal.json                                                    │
│  ├── places[] (50+ nodes with lat/lon, type, tags, ratings)      │
│  ├── edges[] (100+ connections with km, hours, mode, season)     │
│  └── treks[] (detailed multi-day trek descriptions)              │
│                                                                   │
│  Loaded at startup → in-memory graph                             │
│  Each place embedded → in-memory vector store                    │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  │ (startup, once)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER (Java/Spring Boot)            │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐      │
│  │ Dataset      │  │ Embedding    │  │ Route Planner     │      │
│  │ Loader       │  │ Service      │  │ Service           │      │
│  │              │  │              │  │                   │      │
│  │ Reads JSON   │  │ Converts     │  │ Orders stops      │      │
│  │ Builds graph │  │ text→vectors │  │ by graph distance │      │
│  │ In memory    │  │ Caches them  │  │ Respects daily    │      │
│  │              │  │              │  │ time budget       │      │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘      │
│         │                  │                   │                  │
│         └──────────────────┼───────────────────┘                  │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────┐                  │
│  │         RETRIEVAL SERVICE                    │                  │
│  │                                             │                  │
│  │  1. Resolve region from destination          │                  │
│  │  2. Filter places to that region             │                  │
│  │  3. Keyword search (BM25) → scores          │                  │
│  │  4. Embedding search (cosine) → scores       │                  │
│  │  5. Combine (hybrid) → top-k places          │                  │
│  └──────────────────────┬──────────────────────┘                  │
│                         │                                         │
│                         ▼                                         │
│  ┌─────────────────────────────────────────────┐                  │
│  │         GROUNDED PROMPT BUILDER              │                  │
│  │                                             │                  │
│  │  Takes: ordered places + edges + trip info   │                  │
│  │  Builds: "Here are REAL facts. Write plan." │                  │
│  │  Sends to: existing LLM (Qwen/Groq/Gemini) │                  │
│  └──────────────────────┬──────────────────────┘                  │
│                         │                                         │
│                         ▼                                         │
│  ┌─────────────────────────────────────────────┐                  │
│  │         GeminiService.curateItinerary()      │                  │
│  │         (already exists — we just improve    │                  │
│  │          what goes INTO the prompt)           │                  │
│  └─────────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### What changes vs what stays the same

| Component | Change? | Details |
|-----------|---------|---------|
| Frontend (React) | NO CHANGE | Same buttons, same screens, same PDF |
| API endpoints | NO CHANGE | Same `/api/trips/{id}/curate` |
| LLM provider (Qwen/Groq/Gemini) | NO CHANGE | Same AI models |
| `GeminiService.curateItinerary()` | SMALL CHANGE | We change what goes INTO the prompt |
| NEW: Data files | ADD | `himachal.json` (and later uttarakhand, kashmir, ladakh) |
| NEW: Services | ADD | DatasetLoader, EmbeddingService, RetrievalService, RoutePlanner |

The user sees ZERO UI changes. They just get dramatically better results.

---

## 11. Before vs After — The Improvement

### Before (Current System)

**Prompt sent to AI:**
```
You are WanderTribe AI. Plan a trip to Manali, 5 days, chill style, ₹25000/person.
Include routes, hotels, food...
```

**AI's response (sometimes):**
```
Day 1: Arrive Manali, visit Hadimba temple
Day 2: Drive to Rishikesh (!!), do rafting
Day 3: Visit Haridwar Ganga aarti (!!)
Day 4: Return to Manali somehow
Day 5: Departure
```

Problems: wrong places, impossible geography, no real distances.

### After (RAG System)

**Prompt sent to AI:**
```
You are WanderTribe AI. Plan a trip using ONLY these verified places and routes:

AVAILABLE PLACES (Kullu-Manali + Parvati Valley region):
- Manali: onbeat, cafes/riverside, 4.4★ (18K reviews), altitude 2050m
- Kasol: offbeat, riverside/cafes, 4.3★ (9.5K reviews), altitude 1640m
- Kalga: trek_base, quiet/apple-orchards, 4.6★ (800 reviews), altitude 2300m
- Tosh: offbeat, snow/views, 4.5★ (1200 reviews)

VERIFIED ROUTES:
- Manali → Kasol: 75 km, 3 hrs, state road, scenic 4/5, open all year, SAFE
- Kasol → Kalga: 16 km, 0.8 hrs, mountain road, scenic 5/5, Mar-Nov, MODERATE
- Kalga → Kheerganga: 11 km, 5 hrs TREK, moderate difficulty, Apr-Oct

SUGGESTED ORDER (optimized): Manali → Kasol → Kalga → Kheerganga → Tosh → Manali

Trip: 5 days, chill style, ₹25000/person.
Write a day-by-day plan using ONLY these places and distances.
```

**AI's response (always):**
```
Day 1: Arrive Manali (2050m). Explore Old Manali cafes, walk to Jogini waterfall.
       Stay: Hotel Snow View (₹1200/night, 4.2★)

Day 2: Drive Manali → Kasol (75 km, 3 hrs, beautiful riverside road).
       Lunch at riverside Israeli cafe. Evening: explore Chalal walk.
       Stay: Kasol riverside camp (₹800/night)

Day 3: Drive Kasol → Kalga (16 km, 0.8 hrs). Park car, walk 20 min
       to this car-free village (4.6★). Apple orchards, mountain views.
       Stay: Kalga guesthouse (₹600/night)

Day 4: Trek Kalga → Kheerganga (11 km, 5 hrs, moderate).
       Natural hot springs at the top! Camp overnight.
       Risk: 🟡 Moderate — carry rain gear, start early.

Day 5: Return trek. Drive Kalga → Manali. Departure.
```

**Every single place is real. Every distance is verified. The order follows actual roads. No hallucination possible.**

---

## 12. How It Integrates With Our Existing App

### Current code flow (what exists)

```
Frontend: User clicks "Generate Itinerary"
    → POST /api/trips/1/curate

Backend (ChatController.java):
    → Loads trip info (destination, dates, budget, style)
    → Loads voted ideas
    → Loads chat summary
    → Calls geminiService.curateItinerary(destination, dates, budget, style, ideas, chatSummary)

GeminiService.curateItinerary():
    → Builds prompt string (SYSTEM_PROMPT + trip details)
    → Calls AI (Qwen → Groq → Gemini fallback)
    → Returns markdown itinerary

Frontend: Displays itinerary with roadmap UI, day cards, PDF export
```

### What we change (minimal surgery)

We add ONE step before the AI call:

```
GeminiService.curateItinerary():
    → NEW: Ask retrievalService for grounded context
        → Resolves region
        → Retrieves relevant places
        → Orders them by route
        → Returns structured facts
    → Builds prompt WITH the grounded facts
    → Calls AI (same as before)
    → Returns markdown itinerary (same as before)
```

**Files that change:**
- `GeminiService.java` — add ~10 lines to call the new services and include facts in prompt
- `ChatController.java` — maybe pass `trip.destination` to a resolver (tiny change)

**Files we ADD:**
- `himachal.json` — the data
- `Place.java`, `RouteEdge.java`, `Trek.java` — simple data models
- `RouteDatasetLoader.java` — reads JSON at startup
- `EmbeddingService.java` — converts text to vectors
- `RetrievalService.java` — the smart librarian
- `RoutePlannerService.java` — orders the route

**Nothing in the frontend changes.** Same buttons, same screens, same PDF.

---

## 13. The Data Pipeline — Where Knowledge Comes From

### Our 3 data sources

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   SOURCE 1:      │     │   SOURCE 2:      │     │   SOURCE 3:      │
│   Kaggle         │     │   Google/Maps     │     │   Travel sites   │
│                  │     │                  │     │   + OpenStreetMap │
│  • Place names   │     │  • Coordinates   │     │  • Road distances│
│  • Ratings       │     │  • Ratings       │     │  • Drive times   │
│  • Review text   │     │  • Categories    │     │  • Trek info     │
│  • Photos URLs   │     │  • Opening hours │     │  • Seasonal data │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                         │
         └────────────────────────┼─────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │   NORMALIZE + MERGE     │
                    │   (manual curation)     │
                    │                         │
                    │   Deduplicate places    │
                    │   Add route edges       │
                    │   Verify distances      │
                    │   Tag onbeat/offbeat    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   himachal.json          │
                    │   (our single source     │
                    │    of truth)             │
                    └─────────────────────────┘
```

### Why manual curation matters

No dataset has "Kasol → Kalga, 16 km, 0.8 hours, mountain road, open March-November." That specific connection, with those specific attributes, exists only in the experience of people who've traveled it.

We use Kaggle/Google for the PLACES (names, ratings, coordinates). We use travel sites and OSM for the ROUTES (distances, times). Then we manually verify and connect them into our graph.

This curation is the **competitive advantage** — anyone can call an AI, but a curated knowledge graph is rare and valuable.

---

## 14. The JSON Schema — Our Notebook Format

### Complete schema with examples

```json
{
  "region": "himachal",
  "subRegions": [
    {
      "id": "kullu_manali",
      "name": "Kullu-Manali",
      "entryHub": "manali",
      "connectedTo": ["parvati_valley", "lahaul_spiti"]
    },
    {
      "id": "parvati_valley",
      "name": "Parvati Valley",
      "entryHub": "kasol",
      "connectedTo": ["kullu_manali"]
    },
    {
      "id": "lahaul_spiti",
      "name": "Lahaul & Spiti",
      "entryHub": "sissu",
      "connectedTo": ["kullu_manali"]
    }
  ],

  "places": [
    {
      "id": "manali",
      "name": "Manali",
      "subRegion": "kullu_manali",
      "lat": 32.2396,
      "lon": 77.1887,
      "altitude_m": 2050,
      "type": "onbeat",
      "tags": ["cafes", "riverside", "base-town", "mall-road"],
      "rating": 4.4,
      "reviewCount": 18000,
      "reviewSnippet": "Perfect base camp. Old Manali cafes are magical. Mall Road for shopping.",
      "bestMonths": [3, 4, 5, 6, 9, 10],
      "idealHours": 8,
      "phone": null,
      "bookingUrl": "https://www.makemytrip.com/hotels/manali"
    },
    {
      "id": "kasol",
      "name": "Kasol",
      "subRegion": "parvati_valley",
      "lat": 32.0103,
      "lon": 77.3152,
      "altitude_m": 1640,
      "type": "offbeat",
      "tags": ["riverside", "israeli-cafes", "chill", "backpacker", "trance"],
      "rating": 4.3,
      "reviewCount": 9500,
      "reviewSnippet": "Mini Israel of India. Parvati river, epic cafes, chill vibes.",
      "bestMonths": [3, 4, 5, 6, 9, 10, 11],
      "idealHours": 6,
      "phone": null,
      "bookingUrl": null
    },
    {
      "id": "kalga",
      "name": "Kalga",
      "subRegion": "parvati_valley",
      "lat": 32.0,
      "lon": 77.42,
      "altitude_m": 2300,
      "type": "trek_base",
      "tags": ["apple-orchards", "quiet", "no-roads", "wooden-houses", "offgrid"],
      "rating": 4.6,
      "reviewCount": 800,
      "reviewSnippet": "Car-free hamlet. Apple orchards, wooden homes. Gateway to Kheerganga.",
      "bestMonths": [4, 5, 6, 9, 10],
      "idealHours": 5,
      "phone": null,
      "bookingUrl": null
    }
  ],

  "edges": [
    {
      "from": "manali",
      "to": "kasol",
      "mode": "drive",
      "km": 75,
      "duration_hours": 3.0,
      "road_type": "state",
      "scenic": 4,
      "seasonal": [1,2,3,4,5,6,7,8,9,10,11,12],
      "risk": "green",
      "bidirectional": true,
      "notes": "Via Bhuntar. Beautiful Beas river valley road."
    },
    {
      "from": "kasol",
      "to": "kalga",
      "mode": "drive",
      "km": 16,
      "duration_hours": 0.8,
      "road_type": "mountain",
      "scenic": 5,
      "seasonal": [3,4,5,6,7,8,9,10,11],
      "risk": "amber",
      "bidirectional": true,
      "notes": "Narrow mountain road. Last 2km is a walk."
    },
    {
      "from": "kalga",
      "to": "kheerganga",
      "mode": "trek",
      "km": 11,
      "duration_hours": 5.0,
      "difficulty": "moderate",
      "altitude_gain_m": 660,
      "scenic": 5,
      "seasonal": [4,5,6,9,10],
      "risk": "amber",
      "bidirectional": true,
      "notes": "Famous hot spring trek. Start early. Carry rain gear."
    }
  ],

  "treks": [
    {
      "id": "kheerganga",
      "name": "Kheerganga Trek",
      "base": "kalga",
      "endpoint": "kheerganga",
      "days": 2,
      "difficulty": "moderate",
      "altitude_m": 2960,
      "season": [4, 5, 6, 9, 10],
      "highlights": "Natural hot water springs at the top. Camp under stars.",
      "permit_required": false,
      "guide_recommended": false
    }
  ]
}
```

### How each field powers the system

| Field | Used by | For what |
|-------|---------|----------|
| `subRegion` | Region Resolver | Geographic guardrail — only search within connected regions |
| `tags` + `reviewSnippet` | Embedding Service | Semantic matching ("chill" → finds "riverside, cafes") |
| `name` | Lexical Search | Exact keyword matching |
| `rating`, `reviewCount` | Prompt Builder | Show credibility to user ("4.6★, 800 reviews") |
| `altitude_m` | Risk Assessment | High altitude warnings |
| `bestMonths` | Seasonal Filter | Don't suggest closed places |
| `idealHours` | Day Planner | How much time to budget at each stop |
| `edges[].duration_hours` | Route Planner | Daily time budget (max 5-6 hrs/day) |
| `edges[].mode` | Route Planner | Different logic for "drive" vs "trek" |
| `edges[].risk` | Prompt Builder | Show risk levels to user |
| `edges[].seasonal` | Seasonal Filter | Don't suggest closed roads |
| `edges[].bidirectional` | Graph Builder | Auto-create reverse edge or not |

---

## 15. Implementation Roadmap

### Phase 1: Himachal (Proof of Concept)

We build module by module:

```
Week 1: Data
├── Define JSON schema (DONE — see above)
├── Gather places from Kaggle + Google (coordinates, ratings)
├── Gather routes from distance charts + OSM
├── Hand-curate edges (the secret sauce)
└── Create himachal.json with 50+ places, 100+ edges

Week 2: Backend Services
├── Java models (Place.java, RouteEdge.java, Trek.java)
├── RouteDatasetLoader — read JSON at startup
├── EmbeddingService — convert place descriptions to vectors
├── RetrievalService — hybrid search with region filter
└── RoutePlannerService — order stops by graph + daily budget

Week 3: Wire & Test
├── Modify GeminiService to use grounded context
├── Test with real trips (Manali chill 5d, Parvati offbeat 4d, Spiti loop 7d)
├── Verify: no out-of-region places, sensible day order
└── Deploy

Phase 2: Add Uttarakhand, Kashmir, Ladakh (data only — same pipeline)
```

---

## 16. Learning Resources

### Must-watch (in this order)

| # | Topic | Video | Duration | Why |
|---|-------|-------|----------|-----|
| 1 | How LLMs work | [3Blue1Brown: But what is a GPT?](https://www.youtube.com/watch?v=wjZofJX0v4M) | 27 min | Understand the AI brain |
| 2 | What is RAG | [IBM: RAG Explained](https://www.youtube.com/watch?v=T-D1OfcDW1M) | 6 min | The core technique we use |
| 3 | Embeddings | [StatQuest: Embeddings Explained](https://www.youtube.com/watch?v=viZrOnJclY0) | 20 min | How meaning becomes numbers |
| 4 | Vector similarity | [Normalized Nerd: Cosine Similarity](https://www.youtube.com/watch?v=e9U0QAFbfLI) | 8 min | How we find "similar" |
| 5 | Graphs | [CS Dojo: Graphs](https://www.youtube.com/watch?v=gXgEDyodOJU) | 16 min | Data structure for routes |
| 6 | Dijkstra | [Computerphile: Dijkstra's Algorithm](https://www.youtube.com/watch?v=GazC3A4OQTE) | 10 min | Finding shortest path |
| 7 | RAG in depth | [LangChain: RAG from Scratch](https://www.youtube.com/watch?v=sVcwVQRHIc8) | Series | Build RAG step by step |
| 8 | Full RAG app | [FreeCodeCamp: Build a RAG App](https://www.youtube.com/watch?v=tcqEUSNCn8I) | 2 hrs | Complete project tutorial |

### Reading (optional, for depth)

| Topic | Resource |
|-------|----------|
| RAG original paper | [arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401) |
| Google Embeddings API | [ai.google.dev/gemini-api/docs/embeddings](https://ai.google.dev/gemini-api/docs/embeddings) |
| Graph algorithms | [visualgo.net/en/sssp](https://visualgo.net/en/sssp) (interactive!) |
| BM25 scoring | [Wikipedia: BM25](https://en.wikipedia.org/wiki/Okapi_BM25) |

### Practice playgrounds

| Tool | What to try |
|------|-------------|
| [Google AI Studio](https://aistudio.google.com/) | Test embeddings API for free |
| [VisuAlgo](https://visualgo.net/) | Play with Dijkstra visually |
| [Embedding Projector](https://projector.tensorflow.org/) | See embeddings in 3D space |

---

## Summary: One paragraph to remember

We are building a **notebook** (curated JSON of real Himachal places and roads), a **smart librarian** (hybrid search with embeddings + keywords + geographic filter), and a **route planner** (graph algorithm that orders stops by real road connections). These three pieces work together to give our existing AI **real facts in the right order**, so it stops guessing and starts writing **geographically perfect, distance-aware itineraries.** The user sees no UI change — just dramatically better results.

---

*Created for the WanderTribe Hackathon project. Last updated: June 2026.*
