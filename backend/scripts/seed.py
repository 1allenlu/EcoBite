"""
Run once to populate the SQLite database with restaurant data.

Usage (from backend/):
    python scripts/seed.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
from models.restaurant import Restaurant
from services.nyc_open_data import (
    fetch_inspections, fetch_ll84, deduplicate_inspections,
    build_ll84_lookup, calculate_median_wui,
    assign_neighborhood, restaurant_addr_key,
)
from services.scoring import calculate_green_score, get_category


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Fetching restaurant inspections from DOHMH...")
    raw = fetch_inspections()
    restaurants = deduplicate_inspections(raw)
    print(f"  {len(restaurants)} unique restaurants in area")

    print("Fetching LL84 building energy data...")
    try:
        ll84_rows = fetch_ll84()
        print(f"  {len(ll84_rows)} buildings found")
    except Exception as e:
        print(f"  LL84 unavailable ({e}), using defaults for all buildings")
        ll84_rows = []

    ll84_lookup = build_ll84_lookup(ll84_rows)
    median_wui = calculate_median_wui(ll84_rows)
    print(f"  Median WUI: {median_wui:.1f}")
    print(f"  LL84 address matches available: {len(ll84_lookup)}")

    print("Computing green scores and saving...")
    db.query(Restaurant).delete()

    matched, total = 0, 0
    for r in restaurants:
        try:
            lat = float(r.get('latitude') or 0)
            lon = float(r.get('longitude') or 0)
            if not lat or not lon:
                continue

            addr_key = restaurant_addr_key(r)
            energy_star, wui = ll84_lookup.get(addr_key, (None, None))
            if energy_star or wui:
                matched += 1

            cuisine = r.get('cuisine_description', '')
            grade = r.get('grade', '')
            try:
                insp_score = int(r.get('score') or 0)
            except (ValueError, TypeError):
                insp_score = None

            scores = calculate_green_score(energy_star, wui, median_wui, cuisine, grade, insp_score)

            db.add(Restaurant(
                camis=r.get('camis'),
                name=(r.get('dba') or 'Unknown').title(),
                address=f"{r.get('building', '')} {r.get('street', '')}".strip().title(),
                neighborhood=assign_neighborhood(lat, lon),
                category=get_category(cuisine),
                latitude=lat,
                longitude=lon,
                cuisine=cuisine,
                grade=grade,
                inspection_score=insp_score,
                energy_star_score=energy_star,
                water_use_intensity=wui,
                **scores,
            ))
            total += 1

        except Exception as e:
            continue

    db.commit()
    db.close()
    print(f"Done — {total} restaurants seeded, {matched} matched to LL84 buildings.")
    print("\nTop 5 per neighborhood preview:")
    _preview()


def _preview():
    db = SessionLocal()
    from sqlalchemy import func
    neighborhoods = [r[0] for r in db.query(Restaurant.neighborhood).distinct().all()]
    for n in sorted(neighborhoods):
        top = (db.query(Restaurant)
               .filter(Restaurant.neighborhood == n)
               .order_by(Restaurant.green_score.desc())
               .limit(5).all())
        print(f"\n  {n}")
        for r in top:
            print(f"    {r.green_score:5.1f}  {r.name}  ({r.cuisine})")
    db.close()


if __name__ == '__main__':
    seed()
