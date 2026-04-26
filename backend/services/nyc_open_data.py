import re
import httpx

INSPECTION_URL = "https://data.cityofnewyork.us/resource/43nn-pn8j.json"
LL84_URL = "https://data.cityofnewyork.us/resource/usc3-8zwd.json"

# Bounding box matching our 10 allowed neighborhoods
LAT_MIN, LAT_MAX = 40.675, 40.743
LON_MIN, LON_MAX = -74.030, -73.955

# Centroids used to snap each restaurant to the nearest allowed neighborhood
NEIGHBORHOOD_CENTROIDS = [
    ('West Village',                          40.7367, -74.0093),
    ('Greenwich Village',                     40.7301, -73.9950),
    ('East Village',                          40.7236, -73.9758),
    ('SoHo-Little Italy-Hudson Square',       40.7241, -74.0043),
    ('Tribeca-Civic Center',                  40.7161, -74.0074),
    ('Lower East Side',                       40.7156, -73.9827),
    ('Chinatown-Two Bridges',                 40.7116, -73.9943),
    ('Financial District-Battery Park City',  40.7056, -74.0105),
    ('Downtown Brooklyn-DUMBO-Boerum Hill',   40.6980, -73.9861),
    ('Brooklyn Heights',                      40.6966, -73.9947),
]

# Zip codes covering our area (used to filter LL84)
AREA_ZIPS = ['10014', '10003', '10009', '10012', '10013',
             '10002', '10038', '10004', '10005', '10006', '11201']


def assign_neighborhood(lat: float, lon: float) -> str:
    best, best_dist = None, float('inf')
    for name, clat, clon in NEIGHBORHOOD_CENTROIDS:
        d = (lat - clat) ** 2 + (lon - clon) ** 2
        if d < best_dist:
            best_dist, best = d, name
    return best


def _normalize_addr(addr: str) -> str:
    if not addr:
        return ''
    addr = addr.upper().strip()
    addr = re.sub(r'[^\w\s]', '', addr)
    addr = re.sub(r'\s+', ' ', addr)
    for pattern, replacement in [
        (r'\bST\b', 'STREET'), (r'\bAVE\b', 'AVENUE'), (r'\bBLVD\b', 'BOULEVARD'),
        (r'\bDR\b', 'DRIVE'),  (r'\bPL\b',  'PLACE'),  (r'\bRD\b',   'ROAD'),
    ]:
        addr = re.sub(pattern, replacement, addr)
    return addr.strip()


def fetch_inspections() -> list:
    where = (
        f"latitude >= '{LAT_MIN}' AND latitude <= '{LAT_MAX}' "
        f"AND longitude >= '{LON_MIN}' AND longitude <= '{LON_MAX}' "
    )
    with httpx.Client(timeout=60.0) as client:
        resp = client.get(INSPECTION_URL, params={
            '$where': where,
            '$limit': 5000,
            '$order': 'inspection_date DESC',
            '$select': 'camis,dba,building,street,zipcode,latitude,longitude,'
                       'cuisine_description,score,grade,inspection_date',
        })
        resp.raise_for_status()
        return resp.json()


def fetch_ll84() -> list:
    zip_filter = ' OR '.join(f"postcode = '{z}'" for z in AREA_ZIPS)
    with httpx.Client(timeout=60.0) as client:
        resp = client.get(LL84_URL, params={
            '$where': zip_filter,
            '$limit': 2000,
            '$select': 'address_1,postcode,energy_star_score,'
                       'water_use_all_water_sources_kgal,'
                       'property_gfa_calculated_buildings_ft',
        })
        resp.raise_for_status()
        return resp.json()


def deduplicate_inspections(rows: list) -> list:
    seen = {}
    for row in rows:
        camis = row.get('camis')
        if camis and camis not in seen:
            seen[camis] = row
    return list(seen.values())


def _calc_wui(row: dict):
    """Calculate water use intensity (gal/ft²) from raw LL84 fields."""
    try:
        water_kgal = float(row.get('water_use_all_water_sources_kgal') or 0)
        gfa = float(row.get('property_gfa_calculated_buildings_ft') or 0)
        if water_kgal > 0 and gfa > 0:
            return (water_kgal * 1000) / gfa  # gal/ft²
    except (ValueError, TypeError):
        pass
    return None


def build_ll84_lookup(ll84_rows: list) -> dict:
    lookup = {}
    for row in ll84_rows:
        addr = _normalize_addr(row.get('address_1', ''))
        if not addr:
            continue
        try:
            energy = float(row.get('energy_star_score') or 0) or None
        except (ValueError, TypeError):
            energy = None
        wui = _calc_wui(row)
        lookup[addr] = (energy, wui)
    return lookup


def calculate_median_wui(ll84_rows: list) -> float:
    values = [v for row in ll84_rows if (v := _calc_wui(row)) is not None and v > 0]
    if not values:
        return 50.0
    values.sort()
    return values[len(values) // 2]


def restaurant_addr_key(row: dict) -> str:
    return _normalize_addr(f"{row.get('building', '')} {row.get('street', '')}")
