# WanderTribe - AI-Powered Group Travel Planner

A full-stack travel planning platform where groups can collaboratively plan trips with AI-powered curation, focusing on Himachal Pradesh and Kashmir destinations.

## Tech Stack

- **Backend:** Java 17 + Spring Boot 4.0 + JPA/Hibernate + H2 Database
- **Frontend:** React 19 + Vite + Tailwind CSS + React Router
- **AI:** Google Gemini API (free tier)
- **Deployment:** Render (backend) + Vercel (frontend) — completely free

## Features

- AI chatbot for travel planning (offbeat places, food, vibes, transport)
- Group idea sharing with voting system
- AI-curated day-by-day itineraries
- Hotel, cab, and driver booking
- Best season recommendations
- Mountain/nature themed responsive UI

## Running Locally

### Backend

```bash
cd Travel
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`

### Frontend

```bash
cd travel-frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

### Gemini API Key

Get a free key at https://aistudio.google.com/app/apikey and add to `Travel/src/main/resources/application.properties`:

```properties
gemini.api.key=YOUR_KEY_HERE
```

## Free Hosting

### Backend on Render

1. Push to GitHub
2. Go to render.com > New Web Service
3. Connect your repo, set root to `Travel/`
4. Build: `./mvnw clean package -DskipTests`
5. Start: `java -jar target/Travel-0.0.1-SNAPSHOT.jar`
6. Add env var `GEMINI_API_KEY`

### Frontend on Vercel

1. Go to vercel.com > Import Project
2. Set root to `travel-frontend/`
3. Framework: Vite
4. Add env var `VITE_API_URL` = your Render backend URL
