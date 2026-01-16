// --- Checkout Logic ---

let isBuyNowMode = false;
let buyNowItem = null;
let appliedCoupon = null;

function initCheckoutPage() {
    console.log("Init Checkout Page");

    renderCheckoutItems();
    // Payment section toggle logic
    if (document.querySelector('input[name="paymentType"]')) {
        togglePaymentSection();
    }
    prefillCheckout();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ref')) {
        const codeInput = document.getElementById('promo-code-input');
        if (codeInput) codeInput.value = urlParams.get('ref');
    }

    calculateAndDisplayTotal();
}

function renderCheckoutItems() {
    const list = document.getElementById('checkout-items-summary');
    if (!list) return;

    list.innerHTML = "";

    // Determine Source
    let items = [];
    const buyNowData = localStorage.getItem('tentionfree_buyNow');
    isBuyNowMode = false;

    if (buyNowData) {
        items = [JSON.parse(buyNowData)];
        isBuyNowMode = true;
        buyNowItem = items[0];
    } else {
        items = JSON.parse(localStorage.getItem('tentionfree_cart')) || JSON.parse(localStorage.getItem('cart')) || [];
    }

    if (items.length === 0) {
        list.innerHTML = "<div class='text-slate-500 text-center py-4'>Cart is empty</div>";
        if (document.getElementById('checkout-total-amount')) {
            document.getElementById('checkout-total-amount').innerText = "৳0.00";
        }
        return;
    }

    let total = 0;

    items.forEach(item => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;

        list.innerHTML += `
            <div class="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-md object-cover bg-slate-900">
                <div class="flex-1">
                    <h4 class="text-white text-sm font-bold line-clamp-1">${item.name}</h4>
                    <p class="text-slate-400 text-xs">${item.variantName || 'Standard'}</p>
                    <div class="flex justify-between items-center mt-1">
                        <span class="text-brand-500 text-xs font-bold">৳${item.price} x ${item.quantity || 1}</span>
                        <span class="text-white text-xs font-bold">৳${itemTotal}</span>
                    </div>
                </div>
            </div>
        `;
    });

    // Free Order Check
    const isFree = total <= 0;
    const freeInput = document.getElementById('is-free-order');
    if (freeInput) freeInput.value = isFree;

    if (isFree) {
        const paymentToggle = document.getElementById('payment-method-toggle');
        if (paymentToggle) paymentToggle.classList.add('hidden');

        const detailsSection = document.getElementById('payment-details-section');
        if (detailsSection) detailsSection.classList.add('hidden');

        const confirmSection = document.getElementById('confirmation-method-section');
        if (confirmSection) confirmSection.classList.add('hidden');

        const submitBtnSpan = document.querySelector('button[type="submit"] span');
        if (submitBtnSpan) submitBtnSpan.innerText = "Get for Free";
    }

    // Dynamic Custom Fields
    renderCustomFields(items);

    // Initial Calc
    calculateAndDisplayTotal();
}

function renderCustomFields(items) {
    const customFieldsContainer = document.getElementById('game-uid-field');
    if (!customFieldsContainer) return;

    customFieldsContainer.innerHTML = '';
    let hasCustomFields = false;

    items.forEach(item => {
        if (item.customFields && Array.isArray(item.customFields) && item.customFields.length > 0) {
            hasCustomFields = true;

            if (items.length > 1) {
                const header = document.createElement('div');
                header.className = "text-sm font-bold text-gray-400 mt-2 border-b border-gray-700 pb-1 mb-2";
                header.innerText = item.name + " Details";
                customFieldsContainer.appendChild(header);
            }

            item.customFields.forEach(field => {
                const wrapper = document.createElement('div');
                const fieldId = `custom-${item.cartId || item.id}-${field.label.replace(/\s+/g, '-').toLowerCase()}`;
                const type = field.type || 'text';

                let inputHtml = '';
                const baseClass = "custom-field-input w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500 transition-all placeholder-slate-500";

                if (type === 'textarea') {
                    inputHtml = `<textarea id="${fieldId}" 
                        data-label="${field.label}" data-item-name="${item.name}" data-required="${field.required}" data-type="textarea"
                        class="${baseClass}" rows="3" placeholder="${field.placeholder || ''}"></textarea>`;
                } else if (type === 'file') {
                    inputHtml = `
                        <div class="relative">
                            <input type="file" id="${fieldId}" 
                                data-label="${field.label}" data-item-name="${item.name}" data-required="${field.required}" data-type="file"
                                class="hidden" accept="image/*" onchange="previewCustomUpload(this)">
                            <label for="${fieldId}" class="flex items-center justify-center w-full px-4 py-3 bg-slate-800 border border-slate-700 border-dashed rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                                <div class="text-center">
                                    <i class="fa-solid fa-cloud-arrow-up text-brand-500 text-xl mb-1"></i>
                                    <span class="block text-xs text-slate-400" id="${fieldId}-text">${field.placeholder || 'Upload Image'}</span>
                                </div>
                                <img id="${fieldId}-preview" class="hidden h-full w-auto absolute right-2 top-1/2 -translate-y-1/2 max-h-8 rounded shadow-sm border border-slate-600">
                            </label>
                        </div>
                    `;
                } else {
                    inputHtml = `<input type="${type}" id="${fieldId}" 
                        data-label="${field.label}" data-item-name="${item.name}" data-required="${field.required}" data-type="${type}"
                        class="${baseClass}" placeholder="${field.placeholder || ''}">`;
                }

                // Sync Logic for global fields (Name, Phone, Email)
                syncGlobalFields(field, fieldId);

                wrapper.innerHTML = `
                    <label class="block text-xs font-bold text-brand-500 mb-1 uppercase tracking-wide">
                        ${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                    </label>
                    ${inputHtml}
                `;
                customFieldsContainer.appendChild(wrapper);
            });
        } else {
            // Legacy Game UID Logic fallback
            const lowerName = item.name.toLowerCase();
            const lowerCat = (item.category || '').toLowerCase();
            let isGaming = lowerCat.includes('game') || lowerCat.includes('gaming') || lowerName.includes('pubg') || lowerName.includes('free') || lowerName.includes('topup') || lowerName.includes('uc') || lowerName.includes('diamond');

            if (isGaming && (!item.customFields || item.customFields.length === 0)) {
                hasCustomFields = true;
                if (items.length > 1) {
                    const header = document.createElement('div');
                    header.className = "text-sm font-bold text-gray-400 mt-2 border-b border-gray-700 pb-1 mb-2";
                    header.innerText = item.name;
                    customFieldsContainer.appendChild(header);
                }
                const wrapper = document.createElement('div');
                let labelText = "Player ID / UID";
                let placeholder = "Enter Player ID";
                if (lowerName.includes('pubg')) { labelText = "PUBG UID"; placeholder = "Enter PUBG UID"; }
                if (lowerName.includes('free')) { labelText = "Freefire UID"; placeholder = "Enter Freefire UID"; }

                wrapper.innerHTML = `
                    <label class="block text-xs font-bold text-brand-500 mb-1 uppercase tracking-wide">${labelText}</label>
                    <input type="text" data-item-name="${item.name}" required
                        class="dynamic-game-uid w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500 transition-all placeholder-slate-500"
                        placeholder="${placeholder}">
                `;
                customFieldsContainer.appendChild(wrapper);
            }
        }
    });

    if (hasCustomFields) customFieldsContainer.classList.remove('hidden');
    else customFieldsContainer.classList.add('hidden');
}

function syncGlobalFields(field, fieldId) {
    const labelLower = field.label.toLowerCase();
    let targetGlobalId = null;

    if (labelLower.includes('name') && !labelLower.includes('game') && !labelLower.includes('user')) targetGlobalId = 'name';
    else if (labelLower.includes('phone') || labelLower.includes('mobile') || labelLower.includes('number')) targetGlobalId = 'phone';
    else if ((labelLower.includes('email') || labelLower.includes('mail')) && !labelLower.includes('game')) targetGlobalId = 'customer_email';

    if (targetGlobalId) {
        setTimeout(() => {
            const globalInput = document.getElementById(targetGlobalId);
            const customInput = document.getElementById(fieldId);
            if (globalInput && customInput) {
                const container = globalInput.closest('div');
                if (container) container.classList.add('hidden');

                customInput.addEventListener('input', () => { globalInput.value = customInput.value; });
                globalInput.value = customInput.value;
                if (globalInput.value) customInput.value = globalInput.value;
            }
        }, 100);
    }
}

function calculateAndDisplayTotal() {
    let items = [];
    if (localStorage.getItem('tentionfree_buyNow')) {
        items = [JSON.parse(localStorage.getItem('tentionfree_buyNow'))];
    } else {
        items = JSON.parse(localStorage.getItem('tentionfree_cart')) || JSON.parse(localStorage.getItem('cart')) || [];
    }

    if (items.length === 0) {
        if (document.getElementById('checkout-total-amount')) document.getElementById('checkout-total-amount').innerText = '৳0.00';
        return;
    }

    let totalBDT = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    let discount = 0;

    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
            discount = (totalBDT * appliedCoupon.value) / 100;
        } else {
            discount = appliedCoupon.value;
        }
        if (discount > totalBDT) discount = totalBDT;
    }

    let finalBDT = totalBDT - discount;

    const totalEl = document.getElementById('checkout-total-amount');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('discount-amount');

    // Payment Method Check for USD Conversion
    let method = 'bkash';
    const pType = document.querySelector('input[name="paymentType"]:checked');
    if (pType && pType.value === 'now') {
        const pSelect = document.getElementById('payment');
        if (pSelect) method = pSelect.value;
    }

    if (totalEl) {
        totalEl.innerText = '৳' + finalBDT.toFixed(2);
        totalEl.classList.remove('text-green-400');
        totalEl.classList.add('text-brand-500');

        if (discountRow && discountEl) {
            if (discount > 0) {
                discountRow.classList.remove('hidden');
                discountEl.innerText = '-৳' + discount.toFixed(2);
            } else {
                discountRow.classList.add('hidden');
            }
        }
    }

}

function togglePaymentSection() {
    const typeInput = document.querySelector('input[name="paymentType"]:checked');
    if (!typeInput) return;
    const paymentType = typeInput.value;

    const detailsSection = document.getElementById('payment-details-section');
    let confirmationSection = document.getElementById('confirmation-method-section');
    const couponSection = document.getElementById('coupon-section');

    if (!confirmationSection) {
        // Fallback finder
        const labels = document.getElementsByTagName('label');
        for (let i = 0; i < labels.length; i++) {
            if (labels[i].innerText.includes('Confirm Order Via')) {
                confirmationSection = labels[i].parentElement;
                break;
            }
        }
    }

    if (paymentType === 'now') {
        detailsSection.classList.remove('hidden', 'opacity-50', 'pointer-events-none');
        detailsSection.innerHTML = `
            <div class="text-center p-6 space-y-4 animate-fade-in">
                <div class="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                     <i class="fa-solid fa-shield-halved text-3xl text-brand-500"></i>
                </div>
                <div>
                     <h4 class="text-white font-bold text-lg">Secure Online Payment</h4>
                     <p class="text-slate-400 text-sm mt-1">You will be redirected to NexoraPay to complete your purchase securely.</p>
                </div>
                <div class="flex justify-center flex-wrap gap-4 mt-2">
                    <img src="https://download.logo.wine/logo/BKash/BKash-Logo.wine.png" alt="Bkash" class="h-10 object-contain bg-white rounded px-2 py-1">
                    <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" alt="Nagad" class="h-10 object-contain bg-white rounded px-2 py-1">
                    <img src="https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B4D1CC458D-seeklogo.com.png" alt="Rocket" class="h-10 object-contain bg-white rounded px-2 py-1">
                    <img src="assets/images/upay.webp" alt="Upay" class="h-10 object-contain bg-white rounded px-2 py-1">
                </div>
            </div>
        `;
        if (confirmationSection) confirmationSection.classList.add('hidden');
        if (couponSection) couponSection.classList.remove('hidden');
    } else {
        detailsSection.classList.add('hidden', 'opacity-50', 'pointer-events-none');
        if (confirmationSection) confirmationSection.classList.remove('hidden');
        if (couponSection) couponSection.classList.add('hidden');

        // Reset coupon if paying later? Logic says yes.
        if (appliedCoupon) {
            appliedCoupon = null;
            document.getElementById('discount-row').classList.add('hidden');
            const codeInput = document.getElementById('promo-code-input');
            if (codeInput) { codeInput.value = ''; codeInput.disabled = false; }
            initCheckoutPage();
        }
    }
    calculateAndDisplayTotal();
}

async function applyCoupon() {
    const codeInput = document.getElementById('promo-code-input');
    const msgDiv = document.getElementById('coupon-message');
    const discountRow = document.getElementById('discount-row');
    const discountAmountSpan = document.getElementById('discount-amount');
    const code = codeInput.value.trim();

    if (!code) {
        msgDiv.innerText = "Please enter a code";
        msgDiv.className = "text-xs mt-1 h-4 text-red-500";
        return;
    }

    // Get Cart Total
    let items = [];
    if (localStorage.getItem('tentionfree_buyNow')) items = [JSON.parse(localStorage.getItem('tentionfree_buyNow'))];
    else items = JSON.parse(localStorage.getItem('tentionfree_cart')) || [];

    let totalBDT = items.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : null;

    try {
        msgDiv.innerText = "Checking...";
        msgDiv.className = "text-xs mt-1 h-4 text-slate-400";

        const res = await fetch('/api/coupons/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, cartTotal: totalBDT, cartItems: items, userId })
        });
        const data = await res.json();

        if (data.success) {
            appliedCoupon = { code: data.couponCode, discount: data.discount, type: data.type, value: data.value };
            msgDiv.innerText = "Coupon Applied!";
            msgDiv.className = "text-xs mt-1 h-4 text-green-500 animate-pulse";
            discountRow.classList.remove('hidden');
            discountAmountSpan.innerText = '-৳' + data.discount.toFixed(2);
            calculateAndDisplayTotal();
            codeInput.disabled = true;
            codeInput.classList.add('opacity-50', 'cursor-not-allowed');
            showToast("Coupon Applied Successfully!");
        } else {
            appliedCoupon = null;
            msgDiv.innerText = data.message;
            msgDiv.className = "text-xs mt-1 h-4 text-red-400";
            discountRow.classList.add('hidden');
            calculateAndDisplayTotal();
        }
    } catch (err) {
        console.error(err);
        msgDiv.innerText = "Error verifying coupon";
        msgDiv.className = "text-xs mt-1 h-4 text-red-500";
    }
}

async function submitOrder(e) {
    if (e) e.preventDefault();

    const customerName = document.getElementById('name').value.trim();
    const customerPhone = document.getElementById('phone').value.trim();
    const customerEmail = document.getElementById('customer_email').value.trim();

    if (!customerName || !customerPhone) {
        showErrorModal("Missing Information", "Please fill in your Name and Phone Number.");
        return;
    }

    let itemsToOrder = [];
    const buyNowData = localStorage.getItem('tentionfree_buyNow');
    if (buyNowData) itemsToOrder = [JSON.parse(buyNowData)];
    else itemsToOrder = JSON.parse(localStorage.getItem('tentionfree_cart')) || JSON.parse(localStorage.getItem('cart')) || [];

    if (!itemsToOrder || itemsToOrder.length === 0) {
        showErrorModal("Empty Cart", "Your cart is empty.");
        return;
    }

    // 0 TK Check
    let totalCheck = itemsToOrder.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    let discountCheck = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') discountCheck = (totalCheck * appliedCoupon.value) / 100;
        else discountCheck = appliedCoupon.value;
    }
    const finalCheck = totalCheck - discountCheck;
    const isFree = finalCheck <= 0;

    let paymentMethod = isFree ? 'Free / Auto-Delivery' : 'Pay Later';
    const isPayNow = !isFree && document.querySelector('input[name="paymentType"]:checked')?.value === 'now';

    if (!isFree) {
        const paymentTypeInput = document.querySelector('input[name="paymentType"]:checked');
        if (!paymentTypeInput) {
            showErrorModal("Payment Required", "Please select a payment method.");
            return;
        }
        paymentMethod = isPayNow ? 'Online (NexoraPay)' : 'Pay Later';
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user ? user.id : 'guest_' + Date.now();

    // Custom Fields
    let extraDetails = "";
    try {
        const customInputs = document.querySelectorAll('.custom-field-input');
        for (const input of customInputs) {
            const label = input.getAttribute('data-label');
            const itemName = input.getAttribute('data-item-name');
            const isRequired = input.getAttribute('data-required') === 'true';
            const type = input.getAttribute('data-type');

            if (type === 'file') {
                if (input.files.length > 0) {
                    const fileBase64 = await readFileAsBase64(input.files[0]);
                    extraDetails += `\n[${label} for ${itemName}]: (Attachment: ${input.files[0].name}) --IMAGE_DATA:${fileBase64}--`;
                } else if (isRequired) throw new Error(`Please upload ${label} for ${itemName}`);
            } else {
                const val = input.value.trim();
                if (isRequired && !val) throw new Error(`Please fill in ${label} for ${itemName}`);
                if (val) extraDetails += `\n[${label} for ${itemName}]: ${val}`;
            }
        }
    } catch (error) {
        return showErrorModal("Missing Field", error.message);
    }

    // Legacy Game ID
    document.querySelectorAll('.dynamic-game-uid').forEach(input => {
        if (input.value.trim()) extraDetails += `\n[Legacy ID]: ${input.value.trim()}`;
    });

    const orderData = {
        id: Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        userId: userId,
        customer: customerName,
        phone: customerPhone,
        email: customerEmail,
        gameUid: extraDetails.trim() || 'N/A',
        product: itemsToOrder.map(i => `${i.name} (x${i.quantity || 1})`).join(', '),
        price: finalCheck.toFixed(2),
        currency: 'BDT',
        originalPriceBDT: totalCheck.toFixed(2),
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discount: discountCheck.toFixed(2),
        status: "Pending",
        paymentMethod: paymentMethod,
        trx: isPayNow ? "PENDING_NEXORA" : "Pay Later",
        items: itemsToOrder,
        plan: itemsToOrder.length > 1 ? 'Multiple Items' : (itemsToOrder[0].variantName || 'Standard')
    };

    showToast("Processing Order...");

    try {
        const saveRes = await fetch('api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const saveData = await saveRes.json();

        if (!saveData.success) throw new Error(saveData.message || "Failed to save order");

        if (isPayNow) {
            const payRes = await fetch('/api/payment/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.getItem('userToken') ? `Bearer ${localStorage.getItem('userToken')}` : ''
                },
                body: JSON.stringify({ orderId: orderData.id })
            });
            const payData = await payRes.json();
            if (payData.success && payData.payment_url) {
                clearCarts();
                window.location.href = payData.payment_url;
            } else {
                throw new Error(payData.message || "Payment initiation failed");
            }
        } else if (isFree) {
            clearCarts();
            showSuccessModal();
            setTimeout(() => { window.location.href = 'profile.html'; }, 2000);
        } else {
            // Pay Later - WhatsApp
            clearCarts();
            const message = `Hello Tention Free,\nI placed a new order #${orderData.id}.\n\nName: ${customerName}\nItem: ${orderData.product}\nTotal: ৳${finalCheck.toFixed(2)}\n\nPlease confirm my order.`;
            const waUrl = `https://wa.me/8801869895549?text=${encodeURIComponent(message)}`;
            showSuccessModal();
            setTimeout(() => { window.location.href = waUrl; }, 2000);
        }

    } catch (err) {
        console.error(err);
        showErrorModal("Order Failed", err.message);
    }
}

function clearCarts() {
    localStorage.removeItem('cart');
    localStorage.removeItem('tentionfree_cart');
    localStorage.removeItem('tentionfree_buyNow');
}

// Helpers
function prefillCheckout() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const fill = (id, val) => { const el = document.getElementById(id); if (el && !el.value && val) el.value = val; };
            fill('name', user.name);
            fill('phone', user.phone || user.mobile);
            fill('customer_email', user.email);
        } catch (e) { console.error(e); }
    }
}

function previewCustomUpload(input) {
    const file = input.files[0];
    const labelId = input.id;
    const textSpan = document.getElementById(`${labelId}-text`);
    const previewImg = document.getElementById(`${labelId}-preview`);
    if (file) {
        textSpan.innerText = file.name;
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImg.src = e.target.result;
            previewImg.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
