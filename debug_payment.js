
const axios = require('axios');
const qs = require('querystring');
require('dotenv').config();

const API_KEY = process.env.NEXORA_API_KEY;
const SECRET_KEY = process.env.NEXORA_SECRET_KEY || API_KEY;
const BRAND_KEY = process.env.NEXORA_BRAND_KEY || API_KEY;

const URL = "https://pay.nexorapay.top/api/payment/create";

async function runTests() {
    const payload = {
        api_key: API_KEY,
        secret_key: SECRET_KEY,
        brand_key: BRAND_KEY,
        order_id: "TEST_" + Date.now(),
        amount: "10.00",
        currency: "BDT",
        cus_name: "Test",
        cus_email: "test@test.com",
        cus_phone: "01700000000",
        product_name: "Test",
        success_url: "https://a.com",
        cancel_url: "https://a.com",
        fail_url: "https://a.com",
        desc: "Test"
    };

    console.log("Testing Content-Types...");

    // Test 1: URL Encoded
    console.log(`\n--- Testing: x-www-form-urlencoded ---`);
    try {
        const res = await axios.post(URL, qs.stringify(payload), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            validateStatus: () => true
        });
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, JSON.stringify(res.data));
    } catch (e) {
        console.log("Error:", e.message);
    }

    // Test 2: JSON (again, just to be sure)
    console.log(`\n--- Testing: JSON ---`);
    try {
        const res = await axios.post(URL, payload, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true
        });
        console.log(`Status: ${res.status}`);
        console.log(`Body:`, JSON.stringify(res.data));
    } catch (e) {
        console.log("Error:", e.message);
    }
}

runTests();
