const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data/products.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let products = JSON.parse(data);
    let modified = false;

    products = products.map(p => {
        if (p.variants && Array.isArray(p.variants)) {
            p.variants = p.variants.map(v => {
                // If stock is missing or not an array, set it to []
                if (!v.hasOwnProperty('stock') || !Array.isArray(v.stock)) {
                    console.log(`Fixing missing stock for ${p.name} - ${v.label}`);
                    v.stock = [];
                    modified = true;
                }
                return v;
            });
        }
        return p;
    });

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
        console.log("products.json repaired successfully.");
    } else {
        console.log("No repair needed.");
    }

} catch (e) {
    console.error("Error repairing DB:", e);
}
