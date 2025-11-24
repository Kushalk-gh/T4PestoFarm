/*
  Simple smoke test for location endpoints.
  Usage: node location-smoke.js
  Requirements: Backend must be running on http://localhost:8080

  Notes:
  - The app uses OTP-based login. This smoke script will not attempt to obtain an OTP via email.
  - Instead the script supports two modes:
    1) TEST_TOKEN: if you set the TEST_JWT environment variable, the script will use it as the Authorization header.
    2) NO_AUTH: if no TEST_JWT is provided, the script will still call the endpoints but expect 401/403 responses.

  The script exercises:
    POST /api/users/location
    GET  /api/users/location
    POST /api/users/location-preference
    GET  /api/users/location-preference
*/

const fetch = globalThis.fetch || require('node-fetch');
const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:8080';
const TEST_JWT = process.env.TEST_JWT || null;

const headers = {
  'Content-Type': 'application/json'
};
if (TEST_JWT) headers['Authorization'] = `Bearer ${TEST_JWT}`;

async function run() {
  console.log('Smoke test target:', BASE);
  console.log('Using JWT:', TEST_JWT ? 'yes' : 'no');

  // 1) POST location
  const locPayload = {
    latitude: 28.6139,
    longitude: 77.2090,
    timestamp: Date.now()
  };

  try {
    let res = await fetch(`${BASE}/api/users/location`, {
      method: 'POST',
      headers,
      body: JSON.stringify(locPayload)
    });
    console.log('\nPOST /api/users/location ->', res.status);
    const txt = await res.text();
    console.log('Response body:', txt);
  } catch (e) {
    console.error('POST location failed:', e.message);
  }

  // 2) GET location
  try {
    let res = await fetch(`${BASE}/api/users/location`, {
      method: 'GET',
      headers
    });
    console.log('\nGET /api/users/location ->', res.status);
    const txt = await res.text();
    console.log('Response body:', txt);
  } catch (e) {
    console.error('GET location failed:', e.message);
  }

  // 3) POST location-preference
  const prefPayload = { choice: 'allowWhileVisiting' };
  try {
    let res = await fetch(`${BASE}/api/users/location-preference`, {
      method: 'POST',
      headers,
      body: JSON.stringify(prefPayload)
    });
    console.log('\nPOST /api/users/location-preference ->', res.status);
    const txt = await res.text();
    console.log('Response body:', txt);
  } catch (e) {
    console.error('POST location-preference failed:', e.message);
  }

  // 4) GET location-preference
  try {
    let res = await fetch(`${BASE}/api/users/location-preference`, {
      method: 'GET',
      headers
    });
    console.log('\nGET /api/users/location-preference ->', res.status);
    const txt = await res.text();
    console.log('Response body:', txt);
  } catch (e) {
    console.error('GET location-preference failed:', e.message);
  }

  console.log('\nSmoke test finished');
}

run().catch(err => {
  console.error('Smoke script error', err);
  process.exit(1);
});
