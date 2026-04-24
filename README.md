# EcoBite 🌿

A sustainability-first restaurant discovery platform for NYC. Explore nearby restaurants and dishes ranked by estimated carbon footprint, powered by LLM-based menu analysis and a cuisine-type carbon scoring model.

## Overview

EcoBite works like Beli but with an environmental lens. The core insight: you don't need perfect emissions data — a defensible proxy built from menu text, Yelp category tags, and established food carbon science is enough to make the tool genuinely useful.

## Features

- **NYC Neighborhood Map** — Mapbox with GeoJSON boundary polygons, clickable neighborhoods
- **Top 5 Greenest Restaurants** — filtered and ranked by eco-score per neighborhood
- **Restaurant Cards** — eco-score badge, cuisine type, price range, "why it's green" one-liner
- **Restaurant Profile** — full dish list with green/yellow/red carbon labels per dish
- **Carbon Nutrition Label** — visual card showing overall carbon breakdown
- **Swap Suggester** — "greener option nearby" shown on profile pages
- **Optimization Sliders** — re-rank Top 5 by weighting sustainability vs. cost vs. distance
- **Menu Scanner** — upload a menu photo or paste text; Claude scores every dish live with carbon tiers

## Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | React + Vite                |
| Styling   | Tailwind CSS                |
| Maps      | Mapbox GL JS                |
| Backend   | FastAPI                     |
| Database  | SQLite                      |
| AI        | Claude (Anthropic)          |

## Project Structure

```
EcoBite/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── backend/           # FastAPI server
│   ├── routers/
│   ├── models/
│   ├── services/
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Mapbox](https://www.mapbox.com/) public token
- An [Anthropic](https://www.anthropic.com/) API key

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        # add your Mapbox token
npm run dev                 # starts on http://localhost:5173
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # add your Anthropic API key
uvicorn main:app --reload   # starts on http://localhost:8000
```

### Environment Variables

**frontend/.env**
```
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_API_URL=http://localhost:8000
```

**backend/.env**
```
ANTHROPIC_API_KEY=your_anthropic_api_key
DATABASE_URL=sqlite:///./ecobite.db
```

## Carbon Scoring Model

Eco-scores are estimated using a tiered proxy model:

| Tier   | Score | Examples                            |
|--------|-------|-------------------------------------|
| Green  | 8-10  | Salads, veggie bowls, plant-based   |
| Yellow | 4-7   | Fish, chicken, mixed dishes         |
| Red    | 1-3   | Beef burgers, lamb, heavy dairy     |

Scores are derived from menu text analysis (via Claude), Yelp cuisine category tags, and established food lifecycle emissions data.

## Menu Scanner

The Menu Scanner is the live LLM demo moment:

1. User uploads a menu photo or pastes menu text
2. Claude Vision parses it into individual dishes
3. Each dish is classified into a carbon tier
4. Results return in seconds with a full carbon breakdown

## License

MIT
