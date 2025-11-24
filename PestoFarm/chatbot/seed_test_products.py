#!/usr/bin/env python3
"""
Seed test products into the PestoFarm database via the seller API.
This allows testing the chatbot product recommendation feature.
"""

import requests
import json
import time

# Configuration
BACKEND_BASE = "http://localhost:5454"
SELLER_EMAIL = "seller@example.com"
SELLER_PASSWORD = "seller123"
ADMIN_EMAIL = "admin@pestofarm.com"
ADMIN_PASSWORD = "admin123"

# Test products to create
TEST_PRODUCTS = [
    {
        "name": "Tomato Seeds - Premium Hybrid",
        "description": "High-yield tomato seeds resistant to common diseases",
        "price": 299,
        "category": "Vegetables",
        "imageUrl": "https://via.placeholder.com/300x300?text=Tomato+Seeds",
        "stock": 100
    },
    {
        "name": "Drumstick Plant Sapling",
        "description": "Drumstick (Moringa) plant saplings, ready for plantation",
        "price": 450,
        "category": "Plants",
        "imageUrl": "https://via.placeholder.com/300x300?text=Drumstick",
        "stock": 50
    },
    {
        "name": "Carrot Seeds - Orange Wonder",
        "description": "Sweet and crunchy orange carrots, fast-growing variety",
        "price": 199,
        "category": "Vegetables",
        "imageUrl": "https://via.placeholder.com/300x300?text=Carrot+Seeds",
        "stock": 150
    },
    {
        "name": "Capsicum Seeds - Bell Pepper Mix",
        "description": "Colorful bell pepper seeds - red, yellow, green varieties",
        "price": 349,
        "category": "Vegetables",
        "imageUrl": "https://via.placeholder.com/300x300?text=Capsicum",
        "stock": 75
    },
    {
        "name": "Cucumber Seeds - Organic",
        "description": "Organic cucumber seeds, pesticide-free, high germination rate",
        "price": 249,
        "category": "Vegetables",
        "imageUrl": "https://via.placeholder.com/300x300?text=Cucumber+Seeds",
        "stock": 120
    }
]

def authenticate(email, password):
    """Authenticate and get JWT token"""
    print(f"🔐 Authenticating as {email}...")
    try:
        response = requests.post(
            f"{BACKEND_BASE}/api/auth/login",
            json={"email": email, "password": password}
        )
        if response.status_code == 200:
            token = response.json().get("token")
            print(f"✅ Authentication successful")
            return token
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return None

def create_product(token, product_data):
    """Create a product via seller API"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_BASE}/api/sellers/products",
            json=product_data,
            headers=headers
        )
        if response.status_code in [200, 201]:
            product = response.json()
            print(f"✅ Created: {product.get('name')} (ID: {product.get('id')})")
            return True
        else:
            print(f"⚠️  Failed to create {product_data['name']}: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error creating product: {e}")
        return False

def verify_products():
    """Verify products were created by checking /products endpoint"""
    print("\n📊 Verifying products...")
    try:
        response = requests.get(f"{BACKEND_BASE}/api/products")
        if response.status_code == 200:
            data = response.json()
            # Handle both paginated and direct list responses
            if isinstance(data, dict) and "content" in data:
                products = data["content"]
            elif isinstance(data, list):
                products = data
            else:
                products = []
            
            print(f"✅ Found {len(products)} products in database")
            for product in products[:5]:
                print(f"   - {product.get('name', 'Unknown')} (₹{product.get('price', 0)})")
            return len(products) > 0
        else:
            print(f"⚠️  Could not verify products: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

def main():
    print("🌱 PestoFarm Test Data Seeding\n")
    print("=" * 50)
    
    # Authenticate as seller
    token = authenticate(SELLER_EMAIL, SELLER_PASSWORD)
    if not token:
        print("\n❌ Failed to authenticate. Cannot proceed with seeding.")
        print("Note: Ensure seller@example.com exists in the database")
        return
    
    # Create products
    print(f"\n📦 Creating {len(TEST_PRODUCTS)} test products...\n")
    created_count = 0
    for product in TEST_PRODUCTS:
        if create_product(token, product):
            created_count += 1
        time.sleep(0.5)  # Avoid rate limiting
    
    print(f"\n✅ Created {created_count}/{len(TEST_PRODUCTS)} products\n")
    
    # Verify
    time.sleep(1)
    verify_products()
    
    print("\n" + "=" * 50)
    print("✅ Seeding complete!")
    print("\nYou can now test the chatbot recommendations:")
    print("  - Try: 'Recommend me vegetable seeds'")
    print("  - Try: 'What plants should I grow?'")
    print("  - Try: 'Show me tomato products'")

if __name__ == "__main__":
    main()
