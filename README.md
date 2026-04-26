# EcoBite

EcoBite is a new and improved social networking app that promotes sustainable eating! EcoBite is branded for NYU students to make more thoughtful choices when selecting and ordering at restaurants. The platform allows users to view restaurants ranked by carbon footprint and by food-sourcing data, powered by OpenAI.

## What It Does

EcoBite maps and ranks restaurants in Lower Manhattan and several Brooklyn neighborhoods. It ranks all the restaurants by a green score and allows users to upload a menu to calculate an ingredient score. Users can search for specific restaurants, bookmark favorites, and track personal CO2 savings. 


## Features

| Feature | Description |
|---------|-------------|
| **Neighborhood Map** | Mapbox GL with 10 clickable NYC neighborhood polygons, hover states, fly-to on search |
| **Top 5 Greenest** | Sidebar shows top restaurants per neighborhood ranked by eco-score |
| **Category Filter** | Toggle between Restaurants and Sips & Sweets (cafés, juice bars, ice cream) |
| **Restaurant Detail** | Full eco-score breakdown across all 3 components with visual progress bars |
| **Search** | Live search across thousands of restaurants with score badges and neighborhood context |
| **Menu Scanner** | Upload a menu photo → OpenAI Vision extracts dishes → carbon-scores each one |
| **Profile & Bookmarks** | Save restaurants, log orders, track kg CO₂ saved |
| **Plant Avatar** | Gamified avatar that grows through 5 stages as you accumulate CO₂ savings |

## Green Score Model

**Green Score = Energy (50) + Water (25) + Health (25)**

| Component | Max | Data Source | Logic |
|-----------|-----|-------------|-------|
| Energy Efficiency | 50 | NYC LL84 Building Energy | `(Energy Star Score / 100) × 50`, default 25 if building not in dataset |
| Water Efficiency | 25 | NYC LL84 Building Energy | Water use intensity vs. median: ≤0.5× → 20 pts, ≤0.75× → 15, ≤1× → 10, ≤1.5× → 5, higher → 0 |
| Health Grade | 25 | DOHMH Inspection `grade` + `score` | Grade A / score ≤13 = 10 pts, Grade B / score ≤27 = 5 pts, else 0 |

**Score tiers:** ≥70 green · 50–69 yellow · <50 red

## Data Sources

- **DOHMH Restaurant Inspections** (`43nn-pn8j`) — restaurant names, addresses, cuisine types, inspection grades and scores
- **LL84 Building Energy Disclosure** (`usc3-8zwd`) — Energy Star scores, water use, building floor area
- **NYC Neighborhood Boundaries** — 2020 NTA GeoJSON served locally from `frontend/public/neighborhoods.geojson`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Maps | Mapbox GL 3 |
| Routing | React Router 6 |
| Backend | FastAPI + Uvicorn |
| Database | SQLite via SQLAlchemy |
| AI| OpenAI GPT-4o-mini Vision |
| Data Fetching | httpx |

## Project Structure

```
EcoBite/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── MapPage.jsx          # Main map + sidebar + search
│   │   ├── components/
│   │   │   ├── NeighborhoodMap.jsx  # Mapbox integration
│   │   │   ├── SearchBar.jsx        # Live restaurant search
│   │   │   ├── MenuUpload.jsx       # Menu scanner modal
│   │   │   ├── UserProfile.jsx      # Profile + bookmarks + orders
│   │   │   └── WateringAvatar.jsx   # Gamified plant avatar
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth + saved restaurants state
│   │   └── utils/
│   │       └── mapConfig.js         # Neighborhood bounds + centroids
│   └── public/
│       └── neighborhoods.geojson    # NYC NTA boundary polygons
└── backend/
    ├── models/
    │   └── restaurant.py            # SQLAlchemy Restaurant model
    ├── routers/
    │   ├── restaurants.py           # /neighborhoods/* endpoints
    │   └── menu.py                  # /menu/scan endpoint
    ├── services/
    │   ├── nyc_open_data.py         # Data fetching + address matching
    │   ├── scoring.py               # Green score calculation
    │   └── menu_scanner.py          # OpenAI Vision integration
    ├── scripts/
    │   └── seed.py                  # One-time DB population script
    ├── main.py
    ├── database.py
    └── requirements.txt
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+ (not 3.14 — some dependencies incompatible)
- [Mapbox](https://mapbox.com) public token (free)
- [OpenAI](https://platform.openai.com) API key (for menu scanner)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in OPENAI_API_KEY
python scripts/seed.py          # fetch data + populate SQLite (~2 min)
uvicorn main:app --reload       # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env            # fill in VITE_MAPBOX_TOKEN
npm run dev                     # http://localhost:3000
```

### Environment Variables

**`backend/.env`**
```
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=sqlite:///./ecobite.db
```

**`frontend/.env`**
```
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_API_URL=http://localhost:8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/neighborhoods/{name}/restaurants` | Top 5 restaurants, filterable by `category` |
| GET | `/neighborhoods/search?q=query` | Search restaurants by name |
| GET | `/neighborhoods/all/stats` | Aggregate stats by neighborhood |
| POST | `/menu/scan` | Upload menu image, returns dish carbon scores |

## Covered Neighborhoods

West Village · Greenwich Village · East Village · SoHo-Little Italy-Hudson Square · Tribeca-Civic Center · Lower East Side · Chinatown-Two Bridges · Financial District-Battery Park City · Downtown Brooklyn-DUMBO-Boerum Hill · Brooklyn Heights

## License

MIT
