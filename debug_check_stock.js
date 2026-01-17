const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data/products.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(data);

    // Find Netflix Premium (4K)
    const p = products.find(prod => prod.name.includes('Netflix Premium'));

    if (!p) {
        console.log("Product not found!");
    } else {
        console.log("Product Found:", p.name);
        if (p.variants) {
            p.variants.forEach((v, i) => {
                console.log(`Variant ${i} Full Object:`, JSON.stringify(v, null, 2));
            });
        }
    }
} catch (e) {
    console.error("Error:", e);
}
