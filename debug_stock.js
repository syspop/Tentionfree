const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(p, 'utf8'));

const prod = products.find(p => p.id == 12);

if (!prod) {
    console.log("Product 12 NOT FOUND in " + p);
    console.log("IDs found:", products.map(p => p.id).join(', '));
} else {
    console.log("Product 12 Found: " + prod.name);
    if (prod.variants) {
        prod.variants.forEach((v, i) => {
            console.log(`Variant ${i} (${v.label}):`);
            console.log(JSON.stringify(v.stock, null, 2));
        });
    }
}
