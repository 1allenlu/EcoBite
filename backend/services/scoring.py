CUISINE_SCORES = {
    # High sustainability — 20 pts
    'Vegetarian': 20,
    'Vegan': 20,
    'Juice, Smoothies, Fruit Salads': 20,
    # Medium-high — 14 pts
    'Japanese': 14,
    'Mediterranean': 14,
    'Salads': 14,
    # Medium — 10 pts
    'Chinese': 10,
    'Thai': 10,
    'Vietnamese': 10,
    'Korean': 10,
    'Indian': 10,
    'Middle Eastern': 10,
    'Greek': 10,
    # Medium-low — 6 pts
    'Seafood': 6,
    'American': 6,
    'Pizza': 6,
    'Italian': 6,
    'Mexican': 6,
    'Sandwiches/Salads/Mixed Buffet': 6,
    'Bakery Products/Desserts': 6,
    'Bakery': 6,
    'Cafe/Coffee/Tea': 6,
    # Low sustainability — 2 pts
    'Steakhouse': 2,
    'Hamburgers': 2,
    'Barbecue': 2,
    'Chicken': 3,
}

_DEFAULT_CUISINE = 5

_CAFE_DESSERT_CUISINES = {
    'Juice, Smoothies, Fruit Salads',
    'Cafe/Coffee/Tea',
    'Coffee/Tea',
    'Ice Cream, Gelato, Yogurt, Ices',
    'Frozen Desserts',
    'Bakery Products/Desserts',
    'Bakery',
    'Bottled Beverages, Water, Juices',
    'Bottled Beverages',
    'Donuts',
    'Dessert',
}

def get_category(cuisine: str) -> str:
    return 'cafe_dessert' if cuisine in _CAFE_DESSERT_CUISINES else 'restaurant'


def cuisine_score(cuisine: str) -> float:
    return CUISINE_SCORES.get(cuisine, _DEFAULT_CUISINE)


def health_score(grade: str, inspection_score) -> float:
    try:
        s = int(inspection_score or 0)
    except (ValueError, TypeError):
        s = None

    if grade == 'A' or (s is not None and s <= 13):
        return 10.0
    if grade == 'B' or (s is not None and s <= 27):
        return 5.0
    return 0.0


def energy_score(energy_star) -> float:
    if not energy_star:
        return 25.0  # neutral default
    return round((float(energy_star) / 100) * 50, 2)


def water_score(wui, median_wui: float) -> float:
    if not wui or not median_wui or float(median_wui) <= 0:
        return 10.0  # neutral default
    ratio = float(wui) / float(median_wui)
    if ratio <= 0.5:
        return 20.0
    if ratio <= 0.75:
        return 15.0
    if ratio <= 1.0:
        return 10.0
    if ratio <= 1.5:
        return 5.0
    return 0.0


def calculate_green_score(energy_star, wui, median_wui: float, cuisine: str, grade: str, inspection_score) -> dict:
    e = energy_score(energy_star)
    w = water_score(wui, median_wui)
    c = cuisine_score(cuisine)
    h = health_score(grade, inspection_score)
    return {
        'energy_component': round(e, 2),
        'water_component': round(w, 2),
        'cuisine_component': round(c, 2),
        'health_component': round(h, 2),
        'green_score': round(e + w + c + h, 2),
    }
