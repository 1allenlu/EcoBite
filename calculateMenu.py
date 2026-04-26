import os
import re
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CARBON_FACTORS = {
    # High Impact Proteins
    "beef_premium": 99.0,   # Wagyu, grass-fed, specialized cuts
    "beef": 60.0,           # Industrial standard
    "lamb": 39.0,           # Sheep and goat
    "chocolate": 25.0,      # Dark/Cacao (high deforestation risk)
    "cheese": 21.0,         
    "shrimp": 18.0,         # Farmed/Trawled
    "coffee": 17.0,         # Roasted beans
    
    # Mid-High Impact
    "butter": 12.0,
    "pork": 10.0,
    "fish_farmed": 8.0,     # Salmon, tilapia
    "poultry": 6.0,         # Chicken, turkey, duck
    "egg": 4.8,
    "rice": 4.5,            # High methane production
    
    # Mid Impact
    "olive_oil": 4.5,
    "cream": 4.0,
    "tofu_tempeh": 3.5,
    "sugar": 3.2,
    "milk_dairy": 3.0,
    "avocado": 2.5,         # High water/transport impact
    "nuts": 2.5,            # Almonds, cashews, etc.
    
    # Low Impact
    "pasta_dry": 1.8,
    "bread": 1.6,
    "pulses": 1.2,          # Beans, lentils, chickpeas
    "fruit": 1.1,
    "vegetables_brassica": 0.8, # Broccoli, cauliflower
    "vegetables_root": 0.5,     # Potatoes, carrots, onions
    "vegetables_leafy": 0.4,    # Lettuce, spinach
    "milk_plant": 0.9,      # Oat, soy, almond milk
    "fungi": 0.7,           # Mushrooms
    "unknown": 2.0
}

ALIASES = {
    # --- BEEF & RED MEAT ---
    "steak": "beef", "burger": "beef", "ground beef": "beef", "chuck": "beef",
    "sirloin": "beef", "ribeye": "beef", "fillet": "beef", "t-bone": "beef",
    "brisket": "beef", "short rib": "beef", "corned beef": "beef", "pastrami": "beef",
    "wagyu": "beef_premium", "kobe": "beef_premium", "veal": "beef", 
    "lamb": "lamb", "mutton": "lamb", "goat": "lamb", "rack of lamb": "lamb",
    "venison": "lamb", "bison": "beef", "elk": "beef",

    # --- PORK ---
    "pork": "pork", "bacon": "pork", "ham": "pork", "sausage": "pork", 
    "pepperoni": "pork", "prosciutto": "pork", "chorizo": "pork", "salami": "pork",
    "pork belly": "pork", "pancetta": "pork", "guanciale": "pork", "lard": "pork",
    "gammon": "pork", "bratwurst": "pork",

    # --- POULTRY ---
    "chicken": "poultry", "turkey": "poultry", "duck": "poultry", "goose": "poultry",
    "quail": "poultry", "pheasant": "poultry", "wings": "poultry", "thighs": "poultry",
    "drumstick": "poultry", "breast": "poultry",

    # --- SEAFOOD ---
    "shrimp": "shrimp", "prawn": "shrimp", "lobster": "shrimp", "crab": "shrimp",
    "scallop": "shrimp", "mussels": "shrimp", "clams": "shrimp", "oysters": "shrimp",
    "squid": "shrimp", "calamari": "shrimp", "octopus": "shrimp",
    "salmon": "fish_farmed", "tuna": "fish_farmed", "cod": "fish_farmed", 
    "sea bass": "fish_farmed", "trout": "fish_farmed", "halibut": "fish_farmed",
    "snapper": "fish_farmed", "tilapia": "fish_farmed", "sardines": "fish_farmed",
    "anchovy": "fish_farmed", "mackerel": "fish_farmed",

    # --- DAIRY ---
    "cheese": "cheese", "mozzarella": "cheese", "cheddar": "cheese", "parmesan": "cheese",
    "feta": "cheese", "paneer": "cheese", "ricotta": "cheese", "halloumi": "cheese",
    "gouda": "cheese", "brie": "cheese", "camembert": "cheese", "pecorino": "cheese",
    "blue cheese": "cheese", "burrata": "cheese", "mascarpone": "cheese",
    "butter": "butter", "ghee": "butter", "margarine": "vegetables_root",
    "cream": "cream", "heavy cream": "cream", "sour cream": "cream", "creme fraiche": "cream",
    "milk": "milk_dairy", "yogurt": "milk_dairy", "yoghurt": "milk_dairy", "kefir": "milk_dairy",
    "ice cream": "cream", "gelato": "cream",

    # --- EGGS & MAYO ---
    "egg": "egg", "eggs": "egg", "mayo": "egg", "mayonnaise": "egg", "aioli": "egg",

    # --- GRAINS & STARCHES ---
    "rice": "rice", "risotto": "rice", "basmati": "rice", "jasmine": "rice", "paella": "rice",
    "pasta": "pasta_dry", "spaghetti": "pasta_dry", "penne": "pasta_dry", "fusilli": "pasta_dry",
    "noodle": "pasta_dry", "ramen": "pasta_dry", "udon": "pasta_dry", "soba": "pasta_dry",
    "couscous": "pasta_dry", "quinoa": "pulses", "bread": "bread", "bun": "bread",
    "bagel": "bread", "naan": "bread", "pita": "bread", "tortilla": "bread", "brioche": "bread",
    "sourdough": "bread", "focaccia": "bread", "ciabatta": "bread", "pizza dough": "bread",
    "potato": "vegetables_root", "fries": "vegetables_root", "chips": "vegetables_root",
    "sweet potato": "vegetables_root", "yam": "vegetables_root", "gnocchi": "potato",

    # --- VEGETABLES ---
    "tomato": "fruit", "lettuce": "vegetables_leafy", "spinach": "vegetables_leafy",
    "kale": "vegetables_leafy", "arugula": "vegetables_leafy", "rocket": "vegetables_leafy",
    "onion": "vegetables_root", "garlic": "vegetables_root", "shallot": "vegetables_root",
    "carrot": "vegetables_root", "beetroot": "vegetables_root", "radish": "vegetables_root",
    "mushroom": "fungi", "shiitake": "fungi", "portobello": "fungi", "truffle": "fungi",
    "pepper": "vegetables_brassica", "capsicum": "vegetables_brassica", "chili": "vegetables_brassica",
    "broccoli": "vegetables_brassica", "cauliflower": "vegetables_brassica", "cabbage": "vegetables_brassica",
    "brussels sprouts": "vegetables_brassica", "asparagus": "vegetables_brassica", "zucchini": "vegetables_brassica",
    "eggplant": "vegetables_brassica", "cucumber": "vegetables_leafy", "corn": "vegetables_root",
    "avocado": "avocado", "guacamole": "avocado",

    # --- FRUIT & NUTS ---
    "apple": "fruit", "banana": "fruit", "orange": "fruit", "lemon": "fruit", "lime": "fruit",
    "strawberry": "fruit", "blueberry": "fruit", "raspberry": "fruit", "mango": "fruit",
    "pineapple": "fruit", "grapes": "fruit", "almond": "nuts", "walnut": "nuts",
    "cashew": "nuts", "peanut": "nuts", "pistachio": "nuts", "hazelnut": "nuts",

    # --- VEGAN ALTERNATIVES ---
    "tofu": "tofu_tempeh", "tempeh": "tofu_tempeh", "seitan": "pasta_dry", 
    "oat milk": "milk_plant", "soy milk": "milk_plant", "almond milk": "milk_plant",
    "coconut milk": "milk_plant", "impossible meat": "tofu_tempeh", "beyond meat": "tofu_tempeh",

    # --- LEGUMES ---
    "beans": "pulses", "chickpeas": "pulses", "lentils": "pulses", "peas": "pulses",
    "black beans": "pulses", "kidney beans": "pulses", "hummus": "pulses", "edamame": "pulses",

    # --- PANTRY & SWEETS ---
    "olive oil": "olive_oil", "vegetable oil": "olive_oil", "canola oil": "olive_oil",
    "sunflower oil": "olive_oil", "sesame oil": "olive_oil", "coconut oil": "olive_oil",
    "sugar": "sugar", "honey": "sugar", "maple syrup": "sugar", "agave": "sugar",
    "chocolate": "chocolate", "cocoa": "chocolate", "cacao": "chocolate",
    "coffee": "coffee", "espresso": "coffee", "tea": "fruit"
}

FISH_FACTOR = 5.0


_SECTION_HEADERS = re.compile(
    r'^(menu|appetizers?|starters?|mains?|main\s+courses?|entrees?|desserts?|beverages?|drinks?|sides?|side\s+dishes?|salads?|soups?|specials?|sandwiches?|burgers?|pizzas?|pastas?|seafood|grills?|small\s+plates?|large\s+plates?|snacks?|bites?|share?|extras?|add\s*ons?)$',
    re.IGNORECASE
)

def split_menu(menu_text):
    lines = [line.strip() for line in menu_text.split("\n") if line.strip()]
    dishes = []

    for line in lines:
        # Remove prices
        clean = re.sub(r"\$?\d+(\.\d{2})?", "", line).strip()
        # Normalize whitespace
        clean = re.sub(r"\s+", " ", clean)
        # Remove OCR artifact characters — keep only chars valid in food names
        clean = re.sub(r"[^a-zA-Z0-9\s'\-&,.]", " ", clean)
        # Normalize whitespace again after cleanup
        clean = re.sub(r"\s+", " ", clean).strip()

        # Skip too short or empty
        if len(clean) < 5:
            continue

        # Skip ALL CAPS lines — section headers, not dish names
        if clean.replace(" ", "").isupper():
            continue

        # Skip common section header words
        if _SECTION_HEADERS.match(clean):
            continue

        dishes.append(clean)

    return dishes

def normalize_category(ingredient_name):
    name = ingredient_name.lower().strip()

    for alias, category in ALIASES.items():
        if re.search(r"\b" + re.escape(alias) + r"\b", name):
            return category

    return classify_unknown_ingredient_with_llm(ingredient_name)

def get_factor(category):
    if category == "fish":
        return FISH_FACTOR
    return CARBON_FACTORS.get(category, CARBON_FACTORS["unknown"])


def infer_ingredients_with_llm(dish_name):
    prompt = f"""
You are estimating the ingredients in a restaurant dish for carbon scoring.

Dish:
{dish_name}

Return ONLY valid JSON in this format:
{{
  "dish": "...",
  "ingredients": [
    {{
      "name": "ingredient name",
      "estimated_weight_kg": 0.0,
      "confidence": "high|medium|low"
    }}
  ]
}}

Rules:
- Include likely major ingredients only.
- Estimate realistic restaurant portion weights in kilograms.
- Do not include tiny spices unless they are central.
- If an ingredient is explicitly named in the dish, confidence is high.
- If inferred from a common recipe, confidence is medium or low.
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        response_format={"type": "json_object"}
    )

    content = response.choices[0].message.content or ""
    content = content.strip()

    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\s*", "", content)
        content = re.sub(r"\s*```$", "", content)

    return json.loads(content)

def calculate_dish_score(inferred):
    total = 0
    breakdown = []

    for item in inferred["ingredients"]:
        ingredient = item["name"]
        weight = float(item["estimated_weight_kg"])
        confidence = item["confidence"]

        category = normalize_category(ingredient)
        factor = get_factor(category)
        score = weight * factor

        breakdown.append({
            "ingredient": ingredient,
            "category": category,
            "weight": round(weight, 3),
            "factor": factor,
            "score": round(score, 3),
            "confidence": confidence
        })

        total += score

    return round(total, 3), breakdown

def label_score(score):
    if score < 1:
        return "Low"
    elif score < 3:
        return "Medium"
    elif score < 7:
        return "High"
    return "Very High"

def score_menu(menu_text):
    dishes = split_menu(menu_text)
    results = []

    for dish in dishes:
        inferred = infer_ingredients_with_llm(dish)
        score, breakdown = calculate_dish_score(inferred)

        results.append({
            "dish": dish,
            "carbon_score_kg_co2e": score,
            "label": label_score(score),
            "breakdown": breakdown
        })

    return results

def print_menu_scores(results):
    for result in results:
        print("=" * 60)
        print(f"{result['dish']}")
        print(f"Carbon Score: {result['carbon_score_kg_co2e']} kg CO2e")
        print(f"Label: {result['label']}")
        print()
        print("Ingredient Breakdown:")

        for item in result["breakdown"]:
            print(
                f"- {item['ingredient']} "
                f"({item['category']}): "
                f"{item['weight']} kg × {item['factor']} = "
                f"{item['score']} kg CO2e "
                f"[{item['confidence']}]"
            )

        print()

def classify_unknown_ingredient_with_llm(ingredient_name):
    categories = list(CARBON_FACTORS.keys())

    prompt = f"""
Classify this restaurant ingredient into the closest carbon category.

Ingredient:
{ingredient_name}

Allowed categories:
{categories}

Return ONLY valid JSON:
{{
  "category": "one_allowed_category",
  "reason": "short reason"
}}

Rules:
- Use only one of the allowed categories.
- Pick the closest category by food type and carbon impact.
- Do not invent a new category.
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        response_format={"type": "json_object"}
    )

    data = json.loads(response.choices[0].message.content)

    category = data.get("category", "unknown")

    if category not in CARBON_FACTORS:
        return "unknown"

    return category

def print_restaurant_summary(results):
    if not results:
        print("No dishes found.")
        return

    avg_score = sum(item["carbon_score_kg_co2e"] for item in results) / len(results)

    print("=" * 60)
    print("RESTAURANT CARBON SUMMARY")
    print(f"Average Menu Carbon Score: {round(avg_score, 3)} kg CO2e")
    print(f"Restaurant Label: {label_score(avg_score)}")
    print()

    top_5 = sorted(results, key=lambda x: x["carbon_score_kg_co2e"])[:5]

    print("Top 5 Lowest-Carbon Items to Eat:")
    for i, item in enumerate(top_5, start=1):
        print(
            f"{i}. {item['dish']} - "
            f"{item['carbon_score_kg_co2e']} kg CO2e "
            f"({item['label']})"
        )

    print()

if __name__ == "__main__":
    menu = """
    Pizza Margherita
    Spaghetti Carbonara
    Lasagna
    Kung Pao Chicken
    Mapo Tofu
    Peking Duck
    Biryani
    Chicken Tikka Masala
    Tonkatsu Ramen
    Birria Tacos
    Chicken Pad Thai
    Cheeseburger
    Fish and Chips
    """ 

    results = score_menu(menu)
    print_menu_scores(results)
    print_restaurant_summary(results)