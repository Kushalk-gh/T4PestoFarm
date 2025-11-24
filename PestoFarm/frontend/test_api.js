const axios = require('axios');

// API Base URL - backend is running on localhost:5454
const BASE_URL = 'http://localhost:5454/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

const testProduct = {
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  category: 'Test Category'
};

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Get Products (no auth required)
    console.log('1. Testing Get Products...');
    try {
      const productsResponse = await axios.get(`${BASE_URL}/products`);
      console.log('✅ Get Products: PASS');
      console.log('   Products count:', productsResponse.data.content ? productsResponse.data.content.length : productsResponse.data.length);
    } catch (error) {
      console.log('❌ Get Products: FAIL');
      console.log('   Error:', error.message);
    }

    // Test 2: User Authentication (Login)
    console.log('\n2. Testing User Login...');
    let token = null;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/users/auth/login`, testUser);
      console.log('✅ User Login: PASS');
      console.log('   Token received:', !!loginResponse.data.jwt);
      // Store token for authenticated requests
      token = loginResponse.data.jwt;
    } catch (error) {
      console.log('❌ User Login: FAIL');
      console.log('   Error:', error.message);
      // Try signup first
      try {
        console.log('   Trying signup first...');
        const signupResponse = await axios.post(`${BASE_URL}/users/auth/signup`, {
          email: testUser.email,
          password: testUser.password,
          fullname: 'Test User'
        });
        console.log('   Signup successful, trying login again...');
        const loginResponse = await axios.post(`${BASE_URL}/users/auth/login`, testUser);
        token = loginResponse.data.jwt;
        console.log('✅ User Login: PASS (after signup)');
      } catch (signupError) {
        console.log('❌ Signup also failed:', signupError.message);
      }
    }

    if (token) {
      // Test 3: Get User Profile (requires authentication)
      console.log('\n3. Testing Get User Profile...');
      try {
        const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Get User Profile: PASS');
        console.log('   User:', profileResponse.data.email);
      } catch (error) {
        console.log('❌ Get User Profile: FAIL');
        console.log('   Error:', error.message);
      }

      // Test 4: Get Wishlist
      console.log('\n4. Testing Get Wishlist...');
      try {
        const wishlistResponse = await axios.get(`${BASE_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Get Wishlist: PASS');
        console.log('   Wishlist items:', wishlistResponse.data.wishlistItems ? wishlistResponse.data.wishlistItems.length : 0);
      } catch (error) {
        console.log('❌ Get Wishlist: FAIL');
        console.log('   Error:', error.message);
      }

      // Test 5: Get Orders
      console.log('\n5. Testing Get Orders...');
      try {
        const ordersResponse = await axios.get(`${BASE_URL}/orders/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Get Orders: PASS');
        console.log('   Orders count:', ordersResponse.data.length);
      } catch (error) {
        console.log('❌ Get Orders: FAIL');
        console.log('   Error:', error.message);
      }
    } else {
      console.log('\n❌ Skipping authenticated tests - no token available');
    }

  } catch (error) {
    console.log('❌ General Error:', error.message);
  }

  console.log('\n🏁 API Testing Complete!');
}

// Run the tests
testAPI();
