# EcoBite

A sustainability-first restaurant discovery platform for NYC. Explore restaurants ranked by estimated carbon footprint, powered by NYC Open Data, building energy records, and LLM-based menu analysis.

## What It Does

EcoBite maps 10 NYC neighborhoods (West Village → Downtown Brooklyn) and ranks ~1,000 restaurants by a 4-factor **Green Score** (0–100). Users can search for specific restaurants, filter by category, scan a menu photo for dish-level carbon scores, bookmark favorites, and track their personal CO₂ savings over time.

## Features

| Feature | Description |
|---------|-------------|
| **Neighborhood Map** | Mapbox GL with 10 clickable NYC neighborhood polygons, hover states, fly-to on search |
| **Top 5 Greenest** | Sidebar shows top restaurants per neighborhood ranked by eco-score |
| **Category Filter** | Toggle between Restaurants and Sips & Sweets (cafés, juice bars, ice cream) |
| **Restaurant Detail** | Full eco-score breakdown across all 4 components with visual progress bars |
| **Search** | Live search across all ~1,000 restaurants with score badges and neighborhood context |
| **Menu Scanner** | Upload a menu photo → OpenAI Vision extracts dishes → carbon-scores each one |
| **Profile & Bookmarks** | Save restaurants, log orders, track kg CO₂ saved |
| **Plant Avatar** | Gamified avatar that grows through 5 stages as you accumulate CO₂ savings |

## Green Score Model

**Green Score = Energy (50) + Water (20) + Cuisine (20) + Health (10)**

| Component | Max | Data Source | Logic |
|-----------|-----|-------------|-------|
| Energy Efficiency | 50 | NYC LL84 Building Energy | `(Energy Star Score / 100) × 50`, default 25 if building not in dataset |
| Water Efficiency | 20 | NYC LL84 Building Energy | Water use intensity vs. median: ≤0.5× → 20 pts, ≤0.75× → 15, ≤1× → 10, ≤1.5× → 5, higher → 0 |
| Cuisine Type | 20 | DOHMH Inspection `cuisine_description` | Vegan/Vegetarian = 20, Japanese/Mediterranean = 14, Chinese/Thai/Indian = 10, American/Pizza = 6, Steakhouse/Burgers = 2 |
| Health Grade | 10 | DOHMH Inspection `grade` + `score` | Grade A / score ≤13 = 10 pts, Grade B / score ≤27 = 5 pts, else 0 |

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
| AI (Menu Scanner) | OpenAI GPT-4o-mini Vision |
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
