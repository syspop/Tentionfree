
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
const adminToken = localStorage.getItem('adminToken');

let currentProduct = null;
let currentVariantIndex = -1;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (!adminToken) {
        window.location.href = '../chodir-vai';
        return;
    }
    if (!productId) {
        alert("No Product ID Provided");
        window.close();
        return;
    }

    // Reveal Body (Auth Checked)
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';

    loadProductData();
});

function showLoader(show) {
    document.getElementById('loader').style.display = show ? 'flex' : 'none';
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const div = document.createElement('div');
    div.style.background = type === 'success' ? '#10b981' : '#ef4444';
    div.style.color = 'white';
    div.style.padding = '12px 20px';
    div.style.borderRadius = '8px';
    div.style.marginBottom = '10px';
    div.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    div.style.animation = 'fadeIn 0.3s ease-out';
    div.innerText = msg;
    container.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// --- DATA FETCHING ---
async function loadProductData() {
    showLoader(true);
    try {
        const res = await fetch(`/api/products?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const products = await res.json();
        const p = products.find(i => i.id == productId);

        if (!p) throw new Error("Product Not Found");
        currentProduct = p;
        renderHeader();
        renderSidebar();

        // If previously selected variant, valid restore
        if (currentVariantIndex !== -1 && p.variants[currentVariantIndex]) {
            selectVariant(currentVariantIndex);
        } else {
            selectVariant(0); // Default select first
        }

    } catch (e) {
        console.error(e);
        alert("Failed to load product: " + e.message);
    } finally {
        showLoader(false);
    }
}

// --- RENDERING ---
function renderHeader() {
    // Fix Image Path: Prepend '../' if relative
    let displayImg = p.image || '';
    if (displayImg && !displayImg.startsWith('http') && !displayImg.startsWith('data:') && !displayImg.startsWith('../')) {
        displayImg = '../' + displayImg;
    }

    const box = document.getElementById('product-header');
    box.innerHTML = `
        <img src="${displayImg || 'https://placehold.co/80'}" alt="Img" onerror="this.src='https://placehold.co/80'">
        <div class="header-info">
            <h2>${p.name}</h2>
            <p>ID: ${p.id} &bull; ${p.variants ? p.variants.length : 0} Variants</p>
        </div>
    `;
}

function renderSidebar() {
    const list = document.getElementById('variant-list');
    list.innerHTML = '';

    if (!currentProduct.variants || currentProduct.variants.length === 0) {
        list.innerHTML = '<div style="padding:20px; font-size:12px;">No Variants Found</div>';
        return;
    }

    currentProduct.variants.forEach((v, idx) => {
        const stockCount = Array.isArray(v.stock)
            ? v.stock.filter(s => !s.status || s.status === 'available').length
            : 0; // Fix Available 0 bug: Ensure we count properly

        const activeClass = idx === currentVariantIndex ? 'active' : '';
        const item = document.createElement('div');
        item.className = `variant-item ${activeClass}`;
        item.onclick = () => selectVariant(idx);
        item.innerHTML = `
            <h4>${v.label}</h4>
            <span>${stockCount} Stock</span>
        `;
        list.appendChild(item);
    });
}

function selectVariant(idx) {
    currentVariantIndex = idx;
    const v = currentProduct.variants[idx];
    if (!v) return;

    // Sidebar highlight update
    renderSidebar();

    // Main Panel Update
    document.getElementById('panel-title').innerText = `Manage Stock: ${v.label}`;
    document.getElementById('stock-content-area').style.display = 'block';

    // Normalize Stock Data
    let stock = v.stock || [];
    if (typeof stock === 'string') {
        try { stock = JSON.parse(stock); } catch (e) { stock = []; }
    }
    // Filter logic
    const avail = stock.filter(s => !s.status || s.status === 'available');
    const sold = stock.filter(s => s.status && s.status !== 'available');

    // Stats
    document.getElementById('stat-avail').innerText = avail.length;
    document.getElementById('stat-sold').innerText = sold.length;

    // Render Lists
    renderStockList('list-avail', avail, true);
    renderStockList('list-sold', sold, false);
}

function renderStockList(containerId, items, isAvail) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `<div class="empty-state">No ${isAvail ? 'available' : 'sold'} items found.</div>`;
        return;
    }

    items.forEach(item => {
        // Find REAL index in the main array to allow deletion
        const realIdx = currentProduct.variants[currentVariantIndex].stock.indexOf(item);

        const imgHtml = item.image
            ? `<img src="${item.image}">`
            : `<div style="width:40px;height:40px;background:#f1f5f9;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#cbd5e1;"><i class="fa-solid fa-align-left"></i></div>`;

        const soldInfo = !isAvail
            ? `<br><small style="color:#f59e0b">Sold to Order #${item.orderId || '?'} (${item.addedAt ? item.addedAt.split('T')[0] : ''})</small>`
            : '';

        const div = document.createElement('div');
        div.className = 'stock-item';
        div.innerHTML = `
            ${imgHtml}
            <div class="stock-content">
                ${item.text || '<i>(Image Only)</i>'}
                ${soldInfo}
            </div>
            ${isAvail ? `<div class="stock-action" onclick="deleteStock(${realIdx})" title="Delete"><i class="fa-solid fa-trash"></i></div>` : ''}
        `;
        container.appendChild(div);
    });
}

// --- TABS ---
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');

    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(`tab-${tabName}`).style.display = 'block';
}

// --- ACTIONS ---

function previewStockImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('preview-img').src = e.target.result;
            document.getElementById('upload-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

async function addStockItem() {
    const text = document.getElementById('inp-code').value.trim();
    const fileInput = document.getElementById('inp-file');

    if (!text && fileInput.files.length === 0) {
        showToast("Please enter text or select an image", "error");
        return;
    }

    showLoader(true);
    try {
        let imageUrl = null;

        // Upload Image if present
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${adminToken}` },
                body: formData
            });
            const data = await uploadRes.json();
            if (data.success) imageUrl = data.url;
            else throw new Error(data.message || "Upload Failed");
        }

        const newItem = {
            text: text,
            image: imageUrl,
            status: 'available',
            addedAt: new Date().toISOString()
        };

        // Update Local State
        if (!currentProduct.variants[currentVariantIndex].stock) {
            currentProduct.variants[currentVariantIndex].stock = [];
        }
        currentProduct.variants[currentVariantIndex].stock.push(newItem);

        // SAVE TO SERVER IMMEDIATELY
        await saveProductUpdate();

        // Reset Inputs
        document.getElementById('inp-code').value = '';
        fileInput.value = '';
        document.getElementById('upload-preview').style.display = 'none';

        // Refresh UI
        selectVariant(currentVariantIndex);
        showToast("Stock Added Successfully");

    } catch (e) {
        console.error(e);
        showToast("Error: " + e.message, "error");
    } finally {
        showLoader(false);
    }
}

async function deleteStock(realIdx) {
    if (!confirm("Are you sure you want to remove this stock item?")) return;

    showLoader(true);
    try {
        currentProduct.variants[currentVariantIndex].stock.splice(realIdx, 1);
        await saveProductUpdate();
        selectVariant(currentVariantIndex);
        showToast("Item Removed");
    } catch (e) {
        showToast("Error removing item", "error");
    } finally {
        showLoader(false);
    }
}

async function saveProductUpdate() {
    // Send PUT request with updated variants
    const payload = {
        variants: currentProduct.variants
    };

    // We use a partial update endpoint logic (or full update if backend requires)
    // Since our backend PUT replaces the whole object usually, we must be careful.
    // Ideally, we should RE-FETCH the product right before saving to ensure we don't 
    // overwrite price/name changes made in the other tab. 
    // BUT, for this specific 'Stock Manage' page, we are ONLY touching variants[i].stock.

    // BETTER STRATEGY:
    // 1. Fetch Latest Product (Silent)
    // 2. Locate Current Variant
    // 3. Update ONLY its stock
    // 4. Send Back

    const refreshRes = await fetch(`/api/products?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const allProducts = await refreshRes.json();
    const latestProduct = allProducts.find(p => p.id == productId);

    if (!latestProduct) throw new Error("Product no longer exists");

    // Sync our specific change:
    // We want to apply the NEW stock list we just modified in 'currentProduct'
    // to the 'latestProduct' (which might have newer price/name).
    // The safest way is to take the STOCK from our local state and inject it into latestProduct.

    if (latestProduct.variants[currentVariantIndex]) {
        latestProduct.variants[currentVariantIndex].stock = currentProduct.variants[currentVariantIndex].stock;
    }

    // Now Save 'latestProduct'
    const saveRes = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(latestProduct)
    });

    if (!saveRes.ok) throw new Error("Save Failed");

    // Update local reference
    currentProduct = latestProduct;
}
