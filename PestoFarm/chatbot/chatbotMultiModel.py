import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
import requests
import os
import random
import json
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re
import ssl
import certifi
from deep_translator import GoogleTranslator
from langdetect import detect
import io
from PIL import Image
from typing import List, Dict, Any

# --- ⚠️ New Imports for Gemini API ⚠️ ---
# You need to install the library: pip install google-generativeai
import google.generativeai as genai

# --- 1️⃣ Download necessary NLTK data ---
try:
    nltk.data.find('corpora/wordnet')
    nltk.data.find('tokenizers/punkt')
except LookupError:
    try:
        import ssl
        # Fix for Python 3.13 SSL issue
        if hasattr(ssl, '_create_default_https_context'):
            ssl._create_default_https_context = ssl.create_default_context(cafile=certifi.where())
        nltk.download('wordnet')
        nltk.download('punkt')
    except Exception as e:
        print(f"⚠️ NLTK download failed: {e}. Please download manually: nltk.download('wordnet') and nltk.download('punkt')")
        # Continue without raising error, as data might be downloaded already
        pass

lemmatizer = WordNetLemmatizer()

# --- 2️⃣ Define JSON files and categories ---
CATEGORIES = ['intents', 'fruits', 'flowers', 'vegetables']
DATA_FILES = {
    'intents': 'intents.json',
    'fruits': 'fruits.json',
    'flowers': 'flowers.json',
    'vegetables': 'vegetables.json'
}

# --- 3️⃣ Load category data ---
def load_json(filename):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    filepath = os.path.join(script_dir, filename)
    if not os.path.exists(filepath):
        print(f"⚠️ {filename} not found, skipping.")
        return []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get("intents", [])
    except json.JSONDecodeError:
        print(f"❌ Error reading {filename}: Invalid JSON format.")
        return []

data_by_category = {cat: load_json(file) for cat, file in DATA_FILES.items()}

# --- 4️⃣ Initialize SentenceTransformer model ---
print("Loading sentence transformer model...")
semantic_model = SentenceTransformer('all-MiniLM-L6-v2')

# --- 5️⃣ Precompute embeddings for all patterns ---
intent_embeddings = {}
intent_tags = {}

for category, intents in data_by_category.items():
    cat_embeddings = []
    cat_tags = []
    for intent_info in intents:
        for pattern in intent_info.get('patterns', []):
            emb = semantic_model.encode(pattern)
            cat_embeddings.append(emb)
            cat_tags.append(intent_info['tag'])
    intent_embeddings[category] = np.array(cat_embeddings)
    intent_tags[category] = cat_tags

# --- 6️⃣ Known plant names ---
known_plants = set()
for category, intents in data_by_category.items():
    for intent_info in intents:
        plant_name = intent_info.get('plant')
        if plant_name:
            known_plants.add(plant_name.lower())

# --- 7️⃣ API Keys ---
API_KEY = "679d9c1c1328528d15a01854c367e37e"  # OpenWeatherMap Key

# ⚠️ PLACEHOLDER: Replace with your actual Gemini API Key
GEMINI_API_KEY = "AIzaSyCfhoTukYG-nubrxcLGFTbEJWDFKeqckLo" 
# --- Initialize Gemini Client ---
genai.configure(api_key=GEMINI_API_KEY)

# --- 🔗 Backend product API integration ---
BACKEND_BASE = os.environ.get('BACKEND_BASE', 'http://localhost:5454')

def get_products_from_backend(category: str = None, limit: int = 5) -> List[Dict[str, Any]]:
    """Fetches products from backend. Returns list of product dicts (may be empty).
    Uses /api/products endpoint which returns a paged response with 'content'.
    """
    url = f"{BACKEND_BASE}/api/products"
    params = {}
    if category:
        params['category'] = category
    try:
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code != 200:
            print(f"[chatbot] Backend products request failed: {resp.status_code}")
            return []
        data = resp.json()
        # Handle either paged response (with 'content') or a simple list
        products = data.get('content') if isinstance(data, dict) and 'content' in data else data
        if not isinstance(products, list):
            return []
        # Simplify product fields
        simplified = []
        for p in products[:limit]:
            simplified.append({
                'id': p.get('id'),
                'title': p.get('title') or p.get('name') or p.get('title'),
                'price': p.get('sellingPrice') or p.get('currentPrice') or p.get('selling_price'),
                'seller': (p.get('seller') or {}).get('fullName') if isinstance(p.get('seller'), dict) else None,
                'category': (p.get('category') or {}).get('name') if isinstance(p.get('category'), dict) else p.get('category')
            })
        return simplified
    except requests.RequestException as e:
        print(f"[chatbot] Error fetching products from backend: {e}")
        return []

def format_product_recommendations(products: List[Dict[str, Any]], host_frontend: str = 'http://localhost:3000') -> str:
    if not products:
        return "I couldn't find matching products right now. Try again later."
    lines = []
    for p in products:
        title = p.get('title') or 'Unnamed Product'
        price = p.get('price')
        pid = p.get('id')
        link = f"{host_frontend}/product/{pid}" if pid else host_frontend
        price_txt = f" - ₹{price}" if price is not None else ''
        lines.append(f"• {title}{price_txt} — {link}")
    return "Here are some products you might consider:\n" + "\n".join(lines)

def search_products_backend(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    try:
        url = f"{BACKEND_BASE}/api/products/search"
        resp = requests.get(url, params={'query': query}, timeout=5)
        if resp.status_code != 200:
            return []
        data = resp.json()
        if isinstance(data, list):
            products = data
        elif isinstance(data, dict) and 'content' in data:
            products = data.get('content', [])
        else:
            products = data
        simplified = []
        for p in products[:limit]:
            simplified.append({
                'id': p.get('id'),
                'title': p.get('title') or p.get('name'),
                'price': p.get('sellingPrice') or p.get('currentPrice')
            })
        return simplified
    except Exception as e:
        print(f"[chatbot] search_products_backend error: {e}")
        return []


# --- ✅ Safe Language Detection ---
def detect_language_safe(text):
    text = text.strip().lower()
    english_defaults = [
        "hi", "hii", "hiii", "hello", "hey", "ok", "okay", "thanks", "thank you",
        "bye", "goodbye", "tata", "good bye", "see you", "later", "apple", "rotten",
        "scrub", "what", "are", "you", "doing", "how", "weather", "in", "delhi",
        "checking", "yes", "no", "please", "sorry", "excuse", "me", "help", "yes",
        "no", "maybe", "sure", "fine", "great", "awesome", "cool", "nice", "good",
        "bad", "sad", "happy", "angry", "love", "hate", "like", "dislike", "yes",
        "no", "okay", "alright", "sure", "fine", "great", "awesome", "cool", "nice",
        "apple scrub", "rotten apple due to scrub", "weather in delhi"
    ]
    if text in english_defaults or len(text) < 3:
        return "en"
    try:
        return detect(text)
    except Exception:
        return "en"

# --- 🌍 Translation Utilities ---
def translate_to_english(text):
    try:
        translator = GoogleTranslator(source='auto', target='en')
        return translator.translate(text)
    except Exception as e:
        print("⚠️ Translation to English failed:", e)
        return text

def translate_from_english(text, target_lang):
    if target_lang == 'en':
        return text
    try:
        translator = GoogleTranslator(source='en', target=target_lang)
        return translator.translate(text)
    except Exception as e:
        print("⚠️ Translation to user language failed:", e)
        return text

# --- 🔎 Extract plant name ---
def extract_plant(user_input):
    user_input_lower = user_input.lower()
    sorted_known_plants = sorted(list(known_plants), key=len, reverse=True)
    for plant in sorted_known_plants:
        if re.search(r'\b' + re.escape(plant) + r'\b', user_input_lower):
            return plant
    return None

# --- 🌦️ Weather API ---
def get_weather(city_name):
    if not city_name:
        return {"error": "Please provide a city name to get the weather."}

    url = f"https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}&units=metric"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            return {"error": f"Couldn't fetch weather for '{city_name}'. Please check the city name."}

        data = response.json()
        main = data['main']
        weather = data['weather'][0]
        rain_expected = any(desc in weather['description'].lower() for desc in ['rain', 'drizzle', 'shower'])
        return {
            "temp": main['temp'],
            "feels_like": main['feels_like'],
            "humidity": main['humidity'],
            "description": weather['description'],
            "rain_expected": rain_expected
        }
    except requests.exceptions.RequestException:
        return {"error": "⚠️ Weather service not reachable right now."}

# --- 🤖 Intent Prediction ---
def predict_intent(user_input, category):
    if category not in intent_embeddings or len(intent_embeddings[category]) == 0:
        return "unknown"
    user_emb = semantic_model.encode(user_input)
    similarities = cosine_similarity([user_emb], intent_embeddings[category])[0]
    max_index = np.argmax(similarities)
    if similarities[max_index] > 0.4:
        return intent_tags[category][max_index]
    else:
        return "unknown"

# --- 💬 Main Chatbot Logic ---
def get_response(user_input, category=None, city_name=None, user_lang='en'):
    detected_lang = detect_language_safe(user_input)
    user_input_translated = translate_to_english(user_input)

    print("\n===============================")
    print("Original text:", user_input)
    print("Detected language:", detected_lang)
    print("Translated text:", user_input_translated)
    print("Category:", category)
    print("City:", city_name)
    print("===============================\n")

    if category not in CATEGORIES:
        return translate_from_english("Please select a valid category: flowers, fruits, or vegetables.", detected_lang)

    if "weather" in user_input_translated.lower() or "temperature" in user_input_translated.lower():
        weather_data = get_weather(city_name)
        if "error" in weather_data:
            return translate_from_english(weather_data["error"], detected_lang)
        temp = weather_data["temp"]
        desc = weather_data["description"]
        feels_like = weather_data["feels_like"]
        humidity = weather_data["humidity"]
        rain_info = "☔ Rain expected soon." if weather_data["rain_expected"] else "🌤️ No rain expected today."
        eng_response = f"Weather in {city_name.title()}: {desc}, Temp: {temp}°C (feels like {feels_like}°C), Humidity: {humidity}%. {rain_info}"
        return translate_from_english(eng_response, detected_lang)

    # Product recommendation trigger - check for recommendation intents
    rec_keywords = ["recommend", "suggest", "which", "what should i plant", "what to plant", "best", "which seeds", "buy seeds", "available products"]
    low = user_input_translated.lower()
    
    # Check if user is asking for product recommendations
    predicted_tag_early = predict_intent(user_input_translated, category)
    is_product_rec = predicted_tag_early in ["product_recommendation", "plant_recommendations"]
    
    if any(k in low for k in rec_keywords) or is_product_rec:
        # Use category if provided, else fall back to provided category param
        cat = category if category in ["flowers", "fruits", "vegetables"] else None
        products = get_products_from_backend(cat, limit=5)
        rec_text = format_product_recommendations(products)
        return translate_from_english(rec_text, detected_lang)

    predicted_tag = predict_intent(user_input_translated, category)
    extracted_plant = extract_plant(user_input_translated)

    relevant_intents = data_by_category.get(category, []) + data_by_category.get("intents", [])
    for intent_info in relevant_intents:
        if intent_info["tag"] == predicted_tag:
            response_obj = random.choice(intent_info.get("responses", [{"message": "I'm not sure I got that."}]))
            message = response_obj.get("message", "")
            details = response_obj.get("details", "")
            if "plant" in intent_info and extracted_plant and intent_info["plant"].lower() == extracted_plant.lower():
                full_response = message
                if details:
                    full_response += f"\n\n**Pesticide Info:** {details}"
                return translate_from_english(full_response, detected_lang)
            elif "plant" not in intent_info:
                full_text = message + (f"\n\n{details}" if details else "")
                return translate_from_english(full_text, detected_lang)

    # If user mentioned a plant name but no intent matched, attempt product search
    if extracted_plant:
        # Search backend products by plant name
        products = search_products_backend(extracted_plant, limit=5)
        if products:
            rec_text = format_product_recommendations(products)
            return translate_from_english(rec_text, detected_lang)

    unknown_response = "I'm not sure I understand. Could you please rephrase?"
    return translate_from_english(unknown_response, detected_lang)

# --- 🌿 Image Detection (New Gemini Integration) ---
def analyze_image_gemini(image_bytes):
    """
    Sends image bytes to the Gemini API for plant disease detection.
    Returns a readable string with the detected disease information.
    """
    try:
        # 1. Convert image bytes to PIL Image object for the API
        image = Image.open(io.BytesIO(image_bytes))

        # 2. Define the prompt for the vision model
        prompt = (
            "Analyze this image of a plant leaf/part. "
            "Identify the plant type (if possible) and any signs of disease, pests, or nutrient deficiencies. "
            "Respond concisely with the potential disease/issue and recommended first steps for treatment. "
            "Format the response: 'Issue: [Disease/Deficiency]. Treatment: [Recommendation].'"
        )

        # 3. Call the Gemini API
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content([prompt, image])
        
        # 4. Process the response
        if response.text:
            return f"🌿 **Plant Health Report :**\n{response.text.strip()}"
        else:
            return "🤔 Chatbot couldn't provide a specific analysis for this image."

    except Exception as e:
        print(f"⚠️ Exception in analyze_image_: {e}")
        return "⚠️ Unable to process the image for analysis."

# --- 📦 Utility ---
def get_available_categories():
    return CATEGORIES

# --- 🧠 CLI for Testing ---
if __name__ == "__main__":
    print("🌿 Multi-Language Chatbot Ready! (flowers, fruits, vegetables)")
    print("Type 'exit' to quit. Type 'analyze_image' to test the image detection.")
    print("Note: Image analysis requires a real image file path.\n")

    current_category = None
    user_lang = input("Enter your language code (en, hi, te, ta, kn, fr, es, etc.): ").strip().lower() or 'en'

    while True:
        if not current_category:
            current_category = input("Select category (flowers/fruits/vegetables): ").strip().lower()
            if current_category not in CATEGORIES:
                print("Invalid category. Try again.")
                current_category = None
                continue

        user_input = input(f"You ({current_category}): ").strip()
        if user_input.lower() in ["exit", "quit", "bye"]:
            print("Bot:", translate_from_english("Goodbye! 👋", user_lang))
            break
        
        if user_input.lower() == "analyze_image":
            image_path = input("Enter the path to the image file (e.g., leaf.jpg): ").strip()
            if os.path.exists(image_path):
                try:
                    with open(image_path, 'rb') as f:
                        image_bytes = f.read()
                    response = analyze_image_gemini(image_bytes)
                    print("Bot:", response)
                except Exception as e:
                    print(f"Bot: ❌ Could not read the image file. Error: {e}")
            else:
                print("Bot: ⚠️ Image file not found at the specified path.")
            continue


        response = get_response(user_input, category=current_category, city_name="London", user_lang=user_lang)
        print("Bot:", response)