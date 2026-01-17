// Custom Alert functions removed (using global showAlert)

document.addEventListener('DOMContentLoaded', () => {
    loadCategories(); // New: Load dynamic categories
    addVariantRow('1 Month', '', '');

    // Check if editing
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
        console.log("Edit ID found:", editId);
        document.querySelector('h3').innerText = `📦 Editing Product #${editId}`; // Visual Feedback
        loadProductForEdit(editId);
    }
});

// --- CUSTOM INPUTS LOGIC ---
function addCustomInputRow(label = '', placeholder = '', required = false, type = 'text') {
    const container = document.getElementById('custom-inputs-container');
    const div = document.createElement('div');
    div.style.display = 'grid';
    div.style.gridTemplateColumns = '1.5fr 1.5fr 1fr 0.5fr 30px'; // Adjusted grid
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.style.alignItems = 'center';

    const checked = required ? 'checked' : '';

    div.innerHTML = `
        <input type="text" placeholder="Label (e.g. Screenshot)" class="input-box" style="margin:0" value="${label}">
        <input type="text" placeholder="Placeholder (e.g. Upload Proof)" class="input-box" style="margin:0" value="${placeholder}">
        
        <select class="input-box" style="margin:0; padding:8px;" onchange="updatePlaceholder(this)">
            <option value="text" ${type === 'text' ? 'selected' : ''}>Short Text</option>
            <option value="textarea" ${type === 'textarea' ? 'selected' : ''}>Long Text</option>
            <option value="number" ${type === 'number' ? 'selected' : ''}>Number</option>
            <option value="email" ${type === 'email' ? 'selected' : ''}>Email</option>
            <option value="tel" ${type === 'tel' ? 'selected' : ''}>Phone Number</option>
            <option value="file" ${type === 'file' ? 'selected' : ''}>File / Image</option>
        </select>

        <label style="font-size:12px; display:flex; align-items:center; gap:5px; color:var(--gray); cursor:pointer;">
            <input type="checkbox" ${checked} style="width:auto;"> Req.
        </label>
        <button type="button" onclick="this.parentElement.remove()" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">×</button>
    `;
    container.appendChild(div);
}

function updatePlaceholder(select) {
    // Optional: Auto-update placeholder based on type for UX
    const row = select.parentElement;
    const placeholderInput = row.querySelectorAll('input')[1];
    if (!placeholderInput.value) {
        if (select.value === 'file') placeholderInput.value = "Upload Image";
        else if (select.value === 'email') placeholderInput.value = "example@mail.com";
    }
}

// --- CATEGORY MANIPULATION ---
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        const categories = await res.json();
        const select = document.getElementById('p-category');
        select.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch (e) {
        console.error("Failed to load categories:", e);
        // Fallback handled by static html initially or empty
    }
}

// --- VARIANT LOGIC ---
function addVariantRow(label = '', price = '', original = '', stock = []) { // Stock added
    const container = document.getElementById('variants-container');
    const div = document.createElement('div');
    div.style.display = 'grid';
    div.style.gridTemplateColumns = '1.5fr 1fr 1fr 2fr 30px'; // Adjusted grid for Stock
    div.style.gap = '10px';
    div.style.marginBottom = '10px';
    div.style.alignItems = 'start';

    // Ensure stock is array (might come as string from old logic, though we wiped it. Handle safe)
    if (typeof stock === 'string' && stock.includes('[')) {
        try { stock = JSON.parse(stock); } catch (e) { stock = []; }
    } else if (typeof stock === 'string') {
        // Convert legacy newline string to new object format
        stock = stock.split('\n').filter(l => l.trim()).map(code => ({ text: code, status: 'available' }));
    }
    if (!Array.isArray(stock)) stock = [];

    div.innerHTML = `
        <input type="text" placeholder="Label (e.g. 1 Month)" class="input-box" style="margin:0" value="${label}">
        <input type="number" placeholder="Price" class="input-box" style="margin:0" value="${price}">
        <input type="number" placeholder="Org. Price" class="input-box" style="margin:0" value="${original}">
        <div style="display:flex; flex-direction:column; gap:5px;">
            <span class="stock-count-badge" style="font-size:10px; color:var(--gray); text-align:center;">
                ${Array.isArray(stock) ? stock.filter(s => !s.status || s.status === 'available').length : 0} Available
            </span>
        </div>
        <button onclick="this.parentElement.remove()" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold; margin-top:5px;">×</button>
    `;

    container.appendChild(div);
}

let currentEditingId = null;

async function loadProductForEdit(id) {
    try {
        console.log("Fetching product for edit...");
        // Use absolute path for API
        const token = localStorage.getItem('adminToken');
        const res = await fetch('/api/products?t=' + Date.now(), {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch products");

        const products = await res.json();
        console.log("Products loaded:", products.length);

        // Security / Integrity Check
        // If we requested with a token but got public data (no _isAdminView), 
        // it means the token is invalid/expired. Do NOT proceed.
        if (products.length > 0 && !products[0]._isAdminView) {
            showAlert("Session Expired", "Please login again to manage products.", "error");
            setTimeout(() => {
                localStorage.removeItem('adminToken');
                window.location.href = '../chodir-vai';
            }, 2000);
            return;
        }

        const p = products.find(prod => prod.id == id); // loose equality for string/num match

        if (!p) {
            console.error("Product not found with ID:", id);
            return showAlert("Error", "Product not found!", "error");
        }

        console.log("Product found:", p);
        currentEditingId = p.id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-badge').value = p.badge || '';
        document.getElementById('p-category').value = p.category;
        document.getElementById('p-stock').value = p.inStock !== false ? "true" : "false";
        document.getElementById('p-stock').value = p.inStock !== false ? "true" : "false";
        document.getElementById('p-auto-stockout').checked = p.autoStockOut || false;
        document.getElementById('p-disable-paylater').checked = p.disablePayLater || false;
        document.getElementById('p-img').value = p.image;
        updatePreview(p.image); // Show preview
        document.getElementById('p-desc').value = p.desc;
        document.getElementById('p-long-desc').value = p.longDesc || '';
        document.getElementById('p-features').value = p.features ? p.features.join('\n') : '';
        document.getElementById('p-instructions').value = p.instructions || '';

        // Populate Auto Delivery
        document.getElementById('p-auto-info').value = p.autoDeliveryInfo || '';
        document.getElementById('p-auto-img').value = p.autoDeliveryImage || '';
        if (p.autoDeliveryImage) {
            document.getElementById('auto-img-preview').innerHTML = `<img src="${p.autoDeliveryImage}" style="height:100%; object-fit:contain;">`;
        }

        const container = document.getElementById('variants-container');
        container.innerHTML = '';
        if (p.variants && p.variants.length > 0) {
            p.variants.forEach(v => {
                addVariantRow(v.label, v.price, v.originalPrice, v.stock || []); // Load Stock
            });
        } else {
            addVariantRow('1 Month', '', '', []);
        }

        // Populate Custom Inputs
        // Populate Custom Inputs
        const customContainer = document.getElementById('custom-inputs-container');
        customContainer.innerHTML = '';

        let hasName = false, hasPhone = false, hasEmail = false;

        if (p.customFields && p.customFields.length > 0) {
            p.customFields.forEach(f => {
                addCustomInputRow(f.label, f.placeholder, f.required, f.type);
                const lowerLbl = f.label.toLowerCase();
                if (lowerLbl.includes('name') && !lowerLbl.includes('game') && !lowerLbl.includes('user')) hasName = true;
                if (lowerLbl.includes('phone') || lowerLbl.includes('mobile')) hasPhone = true;
                if ((lowerLbl.includes('email') || lowerLbl.includes('mail')) && !lowerLbl.includes('game')) hasEmail = true;
            });
        } else {
            // Pre-fill Game Logic (if applicable)
            const lowerName = p.name.toLowerCase();
            const lowerCat = (p.category || '').toLowerCase();
            const isGaming = lowerCat.includes('game') || lowerCat.includes('gaming') ||
                lowerName.includes('pubg') || lowerName.includes('free') ||
                lowerName.includes('topup') || lowerName.includes('uc') ||
                lowerName.includes('diamond');

            if (isGaming) {
                let label = "Player ID / UID";
                let placeholder = "Enter Player ID";
                if (lowerName.includes('pubg')) { label = "PUBG UID / Player ID"; placeholder = "Enter PUBG UID"; }
                else if (lowerName.includes('free')) { label = "Freefire UID / Player ID"; placeholder = "Enter Freefire UID"; }
                addCustomInputRow(label, placeholder, true, 'text');
            }
        }

        // Identity Fields (Name, Phone, Email) are handled natively by Checkout.
        // We do NOT add them as Custom Fields anymore to avoid duplication. 

        // Trigger check after population
        setTimeout(checkPriceForAutoDelivery, 100);

        document.querySelector('.btn-main').innerText = "Update Product";
    } catch (e) {
        console.error("Error loading product for edit:", e);
        showAlert("Error", "Failed to load product data.", "error");
    }
}

// --- AUTO-DELIVERY LOGIC (Toggle visibility based on price) ---
function checkPriceForAutoDelivery() {
    // Check if any variant price is 0 OR if main price implies 0 (though mainly driven by variants in this UI)
    const rows = document.querySelectorAll('#variants-container > div');
    let hasFreeVariant = false;

    rows.forEach(row => {
        const priceInput = row.querySelectorAll('input')[1]; // 2nd input is Price
        if (priceInput && parseFloat(priceInput.value) === 0) {
            hasFreeVariant = true;
        }
    });

    const section = document.getElementById('auto-delivery-section');
    if (hasFreeVariant) {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

// Hook into inputs with DEBOUNCE to prevent performance issues
let debounceTimer;
document.getElementById('variants-container').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(checkPriceForAutoDelivery, 300);
});

// Prevent Enter Key form submission
document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
        event.preventDefault();
        return false;
    }
});

// Also check on load/add row
const originalAddVariantRow = addVariantRow;
addVariantRow = function (l, p, o) {
    originalAddVariantRow(l, p, o);
    setTimeout(checkPriceForAutoDelivery, 100);
}

// --- IMAGE LOGIC (Updated for File Upload) ---
// We now upload immediately or on save? Let's upload immediately for preview & URL generation.

async function uploadImageToServer(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append('image', file);

    // Show loading state if possible
    const loadingHtml = `<div style="color:var(--blue);"><i class="fa-solid fa-spinner fa-spin"></i> Uploading...</div>`;
    return fetch('/api/upload', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
        },
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) return data.url;
            else throw new Error(data.message);
        });
}

async function handleImageUpload() {
    // Legacy function - kept empty or redirecting to new logic if needed
    // But simpler to just leave it as previous code path is gone.
}

async function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;

    // Local Preview in the upload box
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('preview-img').src = e.target.result;
        document.getElementById('preview-img').style.display = 'block';
        document.getElementById('upload-placeholder').style.display = 'none';
    };
    reader.readAsDataURL(file);

    // Upload
    const previewContainer = document.getElementById('img-preview-container');
    previewContainer.innerHTML = `<span style="color:var(--blue);">Uploading...</span>`;

    try {
        const url = await uploadImageToServer(file);
        if (url) {
            document.getElementById('p-img').value = url;
            // Also update the bottom preview container
            updatePreview(url);
        }
    } catch (e) {
        console.error(e);
        showAlert("Upload Failed", "Could not upload image.", "error");
        previewContainer.innerHTML = `<span style="color:red;">Upload Failed</span>`;
        // Reset upload box preview on failure?
        document.getElementById('preview-img').style.display = 'none';
        document.getElementById('upload-placeholder').style.display = 'block';
        input.value = "";
    }
}

async function handleAutoImgUpload() {
    const fileInput = document.getElementById('p-auto-img-file');
    if (fileInput.files && fileInput.files[0]) {
        const previewContainer = document.getElementById('auto-img-preview');
        previewContainer.innerHTML = `<span style="color:var(--blue);">Uploading...</span>`;

        try {
            const url = await uploadImageToServer(fileInput.files[0]);
            if (url) {
                document.getElementById('p-auto-img').value = url;
                previewContainer.innerHTML = `<img src="${url}" style="height:100%; object-fit:contain;">`;
            }
        } catch (e) {
            console.error(e);
            showAlert("Upload Failed", "Could not upload image.", "error");
            previewContainer.innerHTML = `<span style="color:red;">Upload Failed</span>`;
        }
    }
}

function handleUrlInput() {
    const url = document.getElementById('p-img').value;
    if (url) {
        // Clear the file input if URL is manually pasted
        const fileInput = document.getElementById('p-image-file');
        if (fileInput) fileInput.value = "";

        // Hide the upload box preview if manual URL is entered (optional, but cleaner)
        // document.getElementById('preview-img').style.display = 'none';
        // document.getElementById('upload-placeholder').style.display = 'block';

        updatePreview(url);
    }
}

function updatePreview(src) {
    const container = document.getElementById('img-preview-container');
    if (src) {
        container.innerHTML = `<img src="${src}" style="width:100%; height:100%; object-fit:contain;">`;
    } else {
        container.innerHTML = `<span style="color:var(--gray); font-size:12px;">No Image Selected</span>`;
    }
}

// --- SAVE PRODUCT ---
// --- SAVE PRODUCT ---
async function saveProduct() {
    const name = document.getElementById('p-name').value;
    const badge = document.getElementById('p-badge').value;
    const category = document.getElementById('p-category').value;
    const inStock = document.getElementById('p-stock').value === "true";
    const autoStockOut = document.getElementById('p-auto-stockout').checked;
    const disablePayLater = document.getElementById('p-disable-paylater').checked;
    const img = document.getElementById('p-img').value;
    const desc = document.getElementById('p-desc').value;
    const longDesc = document.getElementById('p-long-desc').value;
    const features = document.getElementById('p-features').value.split('\n').filter(l => l.trim() !== '');
    const instructions = document.getElementById('p-instructions').value;

    // Auto Delivery
    const autoInfo = document.getElementById('p-auto-info').value;
    const autoImg = document.getElementById('p-auto-img').value;

    // Custom Inputs
    const customRows = document.querySelectorAll('#custom-inputs-container > div');
    const customFields = [];
    customRows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const select = row.querySelector('select');
        if (inputs[0].value.trim()) {
            customFields.push({
                label: inputs[0].value.trim(),
                placeholder: inputs[1].value.trim(),
                required: inputs[2].checked,
                type: select ? select.value : 'text'
            });
        }
    });

    // --- VARIANT LOGIC (Refactored for Stock Safety) ---
    // We need to construct the new variants list from the UI inputs (Price, Label)
    // BUT we must PRESERVE the 'stock' array from the server if we are editing.
    // The UI no longer holds the full stock data in hidden inputs.

    let existingVariants = [];
    if (currentEditingId) {
        try {
            // Fetch LATEST to ensure we don't wipe stock added in the new tab
            const res = await fetch(`/api/products?t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const all = await res.json();
            const p = all.find(x => x.id == currentEditingId);
            if (p && p.variants) existingVariants = p.variants;
        } catch (e) {
            console.warn("Could not fetch latest stock data, proceeding might be risky for stock.", e);
        }
    }

    const rows = document.querySelectorAll('#variants-container > div');
    const variants = [];

    rows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input');
        // inputs[0]: Label, [1]: Price, [2]: Org Price
        if (inputs[0].value) {
            // Try to match with existing variant to keep stock
            // Matching by INDEX is safest if we assume order hasn't radically changed without save.
            // Or we could match by Label if valid. Let's use Index for now as it maps 1:1 visually.

            let preservedStock = [];

            // Check if this row maps to an existing variant index
            if (index < existingVariants.length) {
                preservedStock = existingVariants[index].stock || [];
            }

            variants.push({
                label: inputs[0].value,
                price: inputs[1].value,
                originalPrice: inputs[2].value,
                stock: preservedStock
            });
        }
    });

    if (!name || !img || variants.length === 0) {
        return showAlert("Required Information Missing", "Please fill name, image and at least 1 variant.", "error");
    }

    const mainPrice = variants.length > 0 ? variants[0].price : 0;
    const mainOriginalPrice = variants.length > 0 ? variants[0].originalPrice : 0;

    try {
        const productData = {
            name, badge, category, inStock, autoStockOut, disablePayLater, image: img, desc, longDesc, features, instructions, variants,
            price: mainPrice,
            originalPrice: mainOriginalPrice,
            autoDeliveryInfo: autoInfo,
            autoDeliveryImage: autoImg,
            customFields: customFields
        };

        let res;
        if (currentEditingId) {
            res = await fetch(`/api/products/${currentEditingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
                },
                body: JSON.stringify(productData)
            });
        } else {
            res = await fetch('/api/products/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
                },
                body: JSON.stringify(productData)
            });
        }

        if (!res.ok) {
            const errorDate = await res.json();
            throw new Error(errorDate.message || "The server rejected the request.");
        }

        showSaveSuccessModal(currentEditingId ? "Product Updated!" : "Product Added!");

        if (!currentEditingId) {
            resetForm();
        } else {
            setTimeout(() => window.location.href = 'products.html', 1500);
        }

    } catch (err) {
        console.error(err);
        showAlert("Error", "Failed to communicate with the server to save product.", "error");
    }
}

function resetForm() {
    document.querySelectorAll('input, textarea').forEach(i => i.value = "");
    if (document.getElementById('p-auto-stockout')) document.getElementById('p-auto-stockout').checked = false;
    if (document.getElementById('p-disable-paylater')) document.getElementById('p-disable-paylater').checked = false;
    document.getElementById('variants-container').innerHTML = '';
    addVariantRow('1 Month', '', '');
    document.getElementById('custom-inputs-container').innerHTML = '';
    currentEditingId = null;
    document.querySelector('.btn-main').innerText = "Save Product";
}

function showSaveSuccessModal(msg) {
    const modal = document.getElementById('save-success-modal');
    const bar = document.getElementById('success-timer-bar');
    const countSpan = document.getElementById('success-timer-count');

    document.getElementById('success-modal-msg').innerText = msg;
    modal.style.display = 'flex';
    bar.style.transition = 'none';
    bar.style.width = '100%';

    let timeLeft = 3;
    if (countSpan) countSpan.innerText = timeLeft;

    setTimeout(() => {
        bar.style.transition = 'width 3s linear';
        bar.style.width = '0%';
    }, 10);

    const interval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 0 && countSpan) countSpan.innerText = timeLeft;
    }, 1000);

    setTimeout(() => {
        modal.style.display = 'none';
        clearInterval(interval);
    }, 3000);
}


// Custom Inputs & Variants logic ends here.
// Old Stock Modal Logic Removed.

