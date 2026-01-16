const { readLocalJSON, writeLocalJSON } = require('../data/db');

// --- HELPER: Process Auto-Delivery (Stock & Variants) ---
async function processAutoDelivery(order) {
    try {
        let allProducts = await readLocalJSON('products.json');
        let deliveryMsg = order.deliveryInfo || "";
        let productsUpdated = false;
        let allDelivered = true;
        let hasAutoItems = false;

        if (!order.items || !Array.isArray(order.items)) return { status: order.status, deliveryInfo: deliveryMsg };

        for (const item of order.items) {
            const productIndex = allProducts.findIndex(p => String(p.id) === String(item.id) || p.name === item.name);
            if (productIndex === -1) {
                if (item.quantity > 0) allDelivered = false;
                continue;
            }

            const product = allProducts[productIndex];
            let deliveryForThisItem = "";
            let itemDelivered = false;

            // 1. Check Variant Stock
            if (product.variants && Array.isArray(product.variants)) {
                // Find variant logic (Label match)
                const variantIndex = product.variants.findIndex(v => v.label === item.plan || v.label === item.variantName || v.label === (item.variant && item.variant.label));

                if (variantIndex !== -1) {
                    const variant = product.variants[variantIndex];
                    if (variant.stock && Array.isArray(variant.stock) && variant.stock.length > 0) {
                        const qty = parseInt(item.quantity) || 1;
                        const deliveredItems = [];

                        // Filter AVAILABLE items (Legacy String support + New Object support)
                        // Map indices to avoid modifying array length while iterating if we were splicing (but we are not anymore)
                        const availableStockIndices = [];
                        variant.stock.forEach((s, idx) => {
                            // Support legacy string or new object
                            const isAvail = (typeof s === 'string') || (s.status === 'available' || !s.status);
                            if (isAvail) availableStockIndices.push(idx);
                        });

                        // Consume IDs FIFO
                        for (let i = 0; i < qty; i++) {
                            if (i < availableStockIndices.length) {
                                const stockIdx = availableStockIndices[i];
                                const stockItem = variant.stock[stockIdx];

                                // Update Status
                                if (typeof stockItem === 'string') {
                                    // Upgrade legacy string to object
                                    const codeText = stockItem;
                                    variant.stock[stockIdx] = {
                                        text: codeText,
                                        status: 'delivered',
                                        orderId: order.id,
                                        date: new Date().toISOString()
                                    };
                                    deliveredItems.push(codeText);
                                } else {
                                    stockItem.status = 'delivered';
                                    stockItem.orderId = order.id;
                                    stockItem.date = new Date().toISOString();

                                    let txt = stockItem.text || "";
                                    if (stockItem.image) txt += `\n[Reference Image]: ${stockItem.image}`;
                                    deliveredItems.push(txt);
                                }
                                productsUpdated = true;
                            }
                        }

                        if (deliveredItems.length > 0) {
                            deliveryForThisItem = `\n[${item.name} - ${variant.label}]:\n${deliveredItems.join('\n\n')}`;
                            hasAutoItems = true;
                            if (deliveredItems.length >= qty) itemDelivered = true;
                            else allDelivered = false; // Partial
                        } else {
                            allDelivered = false; // Stock Empty
                        }
                    }
                }
            }

            // 2. Fallback: Global Auto Delivery Info
            if (!itemDelivered && !deliveryForThisItem && product.autoDeliveryInfo) {
                // Only if stock logic didn't work (or no stock defined)
                deliveryForThisItem = `\n[${item.name}]: ${product.autoDeliveryInfo}`;
                hasAutoItems = true;
                itemDelivered = true;
            }

            if (deliveryForThisItem) {
                deliveryMsg += deliveryForThisItem + "\n";
            } else {
                if (!itemDelivered) allDelivered = false;
            }
        }

        if (productsUpdated) {
            await writeLocalJSON('products.json', allProducts);
        }

        let pStatus = order.status;
        if (hasAutoItems) {
            pStatus = allDelivered ? 'Completed' : 'Processing';
        }

        return { status: pStatus, deliveryInfo: deliveryMsg.trim() };

    } catch (e) {
        console.error("AutoDelivery Error:", e);
        return { status: order.status, deliveryInfo: order.deliveryInfo };
    }
}

module.exports = { processAutoDelivery };
