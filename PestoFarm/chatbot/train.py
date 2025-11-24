import json
import nltk
import numpy as np
import pickle
import ssl
import certifi
import os
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# --- 1️⃣ Ensure NLTK data is available ---
try:
    nltk.data.find('corpora/wordnet')
    nltk.data.find('tokenizers/punkt')
except LookupError:
    try:
        # Fix SSL issue for Python 3.13
        if hasattr(ssl, '_create_default_https_context'):
            original_context = ssl._create_default_https_context
            ssl._create_default_https_context = ssl.create_default_context(cafile=certifi.where())
        nltk.download('wordnet')
        nltk.download('punkt')
        # Restore original context if needed
        if 'original_context' in locals():
            ssl._create_default_https_context = original_context
    except Exception as e:
        print(f"⚠️ NLTK download failed: {e}. Please download manually: nltk.download('wordnet') and nltk.download('punkt')")
        # Continue without raising error, as data might be downloaded already
        pass

lemmatizer = WordNetLemmatizer()

# --- 2️⃣ Define your JSON categories ---
CATEGORIES = ['intents', 'fruits', 'flowers', 'vegetables']

# --- 3️⃣ Helper function to load and process JSON data ---
def load_json_file(filename):
    """Load and parse a JSON file."""
    if not os.path.exists(filename):
        print(f"⚠️ Warning: {filename} not found. Skipping...")
        return []
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            data = json.load(file)
            return data.get("intents", [])
    except json.JSONDecodeError:
        print(f"❌ Error: Could not parse {filename}. Invalid JSON format.")
        return []

# --- 4️⃣ Train model for each category ---
for category in CATEGORIES:
    filename = f"{category}.json"
    print(f"\n🔹 Processing category: {category}")

    intents = load_json_file(filename)
    if not intents:
        print(f"⚠️ No valid intents found in {filename}, skipping this category.")
        continue

    corpus = []
    labels = []
    classes = []

    # --- Preprocess patterns ---
    for intent in intents:
        tag = intent.get("tag")
        patterns = intent.get("patterns", [])
        if not tag or not patterns:
            continue

        for pattern in patterns:
            tokens = nltk.word_tokenize(pattern)
            tokens = [lemmatizer.lemmatize(w.lower()) for w in tokens]
            corpus.append(" ".join(tokens))
            labels.append(tag)

        if tag not in classes:
            classes.append(tag)

    if not corpus:
        print(f"⚠️ No training data in {filename}, skipping...")
        continue

    # --- Vectorize text data ---
    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(corpus).toarray()
    y = np.array(labels)

    # --- Train the model ---
    model = MultinomialNB()
    model.fit(X, y)

    # --- Save trained model files ---
    model_filename = f"model_{category}.pkl"
    vectorizer_filename = f"vectorizer_{category}.pkl"
    classes_filename = f"classes_{category}.pkl"

    with open(model_filename, "wb") as model_file:
        pickle.dump(model, model_file)
    with open(vectorizer_filename, "wb") as vectorizer_file:
        pickle.dump(vectorizer, vectorizer_file)
    with open(classes_filename, "wb") as classes_file:
        pickle.dump(classes, classes_file)

    print(f"✅ Training complete for '{category}'. Files saved:")
    print(f"   ├── {model_filename}")
    print(f"   ├── {vectorizer_filename}")
    print(f"   └── {classes_filename}")

print("\n🏁 All category models trained successfully!")
