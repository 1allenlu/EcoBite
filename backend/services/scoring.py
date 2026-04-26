def health_score(grade: str, inspection_score) -> float:
    """0–25 pts based on inspection grade/score."""
    try:
        s = int(inspection_score or 0)
    except (ValueError, TypeError):
        s = None

    if grade == 'A' or (s is not None and s <= 13):
        return 25.0
    if grade == 'B' or (s is not None and s <= 27):
        return 12.5
    return 0.0


def energy_score(energy_star) -> float:
    """0–50 pts from Energy Star Score."""
    if not energy_star:
        return 25.0  # neutral default
    return round((float(energy_star) / 100) * 50, 2)


def water_score(wui, median_wui: float) -> float:
    """0–25 pts based on water use intensity vs. area median."""
    if not wui or not median_wui or float(median_wui) <= 0:
        return 12.5  # neutral default
    ratio = float(wui) / float(median_wui)
    if ratio <= 0.5:
        return 25.0
    if ratio <= 0.75:
        return 18.75
    if ratio <= 1.0:
        return 12.5
    if ratio <= 1.5:
        return 6.25
    return 0.0


def calculate_green_score(energy_star, wui, median_wui: float, cuisine: str, grade: str, inspection_score) -> dict:
    e = energy_score(energy_star)
    w = water_score(wui, median_wui)
    h = health_score(grade, inspection_score)
    return {
        'energy_component': round(e, 2),
        'water_component': round(w, 2),
        'cuisine_component': 0.0,
        'health_component': round(h, 2),
        'green_score': round(e + w + h, 2),
    }


def get_category(cuisine: str) -> str:
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
    return 'cafe_dessert' if cuisine in _CAFE_DESSERT_CUISINES else 'restaurant'
