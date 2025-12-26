const { writeLocalJSON, readLocalJSON } = require('./data/sync');
const fs = require('fs');
const path = require('path');

async function testSync() {
    console.log("Testing writeLocalJSON...");
    const testData = [{ id: 1, name: "Test Product" }];
    await writeLocalJSON('test_products.json', testData);

    console.log("Testing readLocalJSON (Should hit cache if logic works, or disk)");
    const data = await readLocalJSON('test_products.json');
    console.log("Read Data:", JSON.stringify(data));

    if (data[0].name === "Test Product") {
        console.log("✅ Read/Write Success");
    } else {
        console.error("❌ Read mismatch");
    }
}

testSync().catch(console.error);
