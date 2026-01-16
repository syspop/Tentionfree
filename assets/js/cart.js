// --- Cart Logic (Robust) ---

// Helper to create a cart item object from product ID and source
function createCartItem(id, source = 'card') {
    const product = window.products.find(p => p.id === id);
    if (!product) return null;

    if (product.inStock === false) {
        showToast("Item is Out of Stock", "error");
        return null;
    }

    let finalPrice = product.price;
    let finalName = product.name;
    let cartId = product.id.toString();
    let variantName = 'Standard';

    // Logic to find correct selector based on source
    let selectorId = `variant-select-${id}`; // Default card selector
    if (source === 'modal') {
        selectorId = 'modal-variant-select';
    } else if (source === 'page') {
        selectorId = 'page-variant-select';
    } else if (source === 'home') {
        selectorId = `h-variant-select-${id}`;
    }

    const select = document.getElementById(selectorId);

    // Only use the value if the selector exists
    if (select) {
        const index = select.value;
        const variant = product.variants ? product.variants[index] : null;
        if (variant) {
            finalPrice = variant.price;
            finalName = `${product.name} - ${variant.label}`;
            variantName = variant.label;
            cartId = `${product.id}-${index}`;
        }
    }

    return {
        cartId: cartId,
        id: product.id,
        name: finalName,
        variantName: variantName,
        price: finalPrice,
        image: product.image,
        category: product.category,
        quantity: 1,
        customFields: product.customFields || [],
        disablePayLater: product.disablePayLater || false
    };
}

// Updated addToCart to use createCartItem
function addToCart(id, showToastMsg = true, source = 'card') {
    const newItem = createCartItem(id, source);
    if (!newItem) return;

    // Load current cart
    let cart = JSON.parse(localStorage.getItem('tentionfree_cart')) || [];

    const existing = cart.find(item => item.cartId === newItem.cartId);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push(newItem);
    }

    saveCart(cart);
    updateCartCount();

    // If sidebar is open, render it
    if (document.getElementById('cart-items-container')) {
        renderCartItems();
    }

    if (showToastMsg) {
        showToast("Item Added to Cart");
    }
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('tentionfree_cart', JSON.stringify(cart));
    // Also update legacy key just in case
    localStorage.setItem('cart', JSON.stringify(cart));
}

function removeFromCart(cartId) {
    let cart = JSON.parse(localStorage.getItem('tentionfree_cart')) || [];
    cart = cart.filter(item => item.cartId !== cartId);
    saveCart(cart);
    updateCartCount();
    renderCartItems();
}

function updateQuantity(cartId, change) {
    let cart = JSON.parse(localStorage.getItem('tentionfree_cart')) || [];
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(cartId);
            return;
        }
        saveCart(cart);
        renderCartItems();
        updateCartCount();
    }
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('tentionfree_cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    const mobileBadge = document.getElementById('mobile-cart-count');

    if (badge) {
        badge.innerText = count;
        if (count > 0) {
            badge.classList.remove('scale-0');
            badge.classList.add('scale-100');
        } else {
            badge.classList.remove('scale-100');
            badge.classList.add('scale-0');
        }
    }

    if (mobileBadge) {
        mobileBadge.innerText = count;
        if (count > 0) {
            mobileBadge.classList.remove('scale-0');
            mobileBadge.classList.add('scale-100');
        } else {
            mobileBadge.classList.remove('scale-100');
            mobileBadge.classList.add('scale-0');
        }
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const backdrop = document.getElementById('cart-backdrop');
    const panel = document.getElementById('cart-panel');

    if (!sidebar) return;

    if (sidebar.classList.contains('pointer-events-none')) {
        sidebar.classList.remove('pointer-events-none');
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
        renderCartItems();
    } else {
        sidebar.classList.add('pointer-events-none');
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0');
        panel.classList.remove('translate-x-0');
        panel.classList.add('translate-x-full');
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');

    if (!container || !totalEl) return;

    let cart = JSON.parse(localStorage.getItem('tentionfree_cart')) || [];

    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = `
            <li class="text-center py-10">
                <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                    <i class="fa-solid fa-basket-shopping text-3xl"></i>
                </div>
                <p class="text-gray-400">Your cart is currently empty.</p>
                <button onclick="toggleCart()" class="mt-4 text-brand-400 hover:text-brand-300 font-medium text-sm">Start Shopping</button>
            </li>
        `;
        totalEl.innerText = '৳0.00';
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const li = document.createElement('li');
        li.className = 'flex py-4 border-b border-white/5 last:border-0 animate-[fadeIn_0.3s_ease-out]';

        li.innerHTML = `
            <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white/5 p-2 border border-white/10">
                <img src="${item.image}" alt="${item.name}" class="h-full w-full object-contain">
            </div>
            <div class="ml-4 flex flex-1 flex-col">
                <div>
                    <div class="flex justify-between text-base font-medium text-white">
                        <h3 class="line-clamp-1 text-sm">${item.name}</h3>
                        <p class="ml-4 font-bold">৳${item.price * item.quantity}</p>
                    </div>
                    <p class="mt-1 text-xs text-gray-400">${item.category}</p>
                </div>
                <div class="flex flex-1 items-end justify-between text-sm mt-2">
                    <div class="flex items-center bg-white/5 rounded-lg border border-white/10">
                        <button onclick="updateQuantity('${item.cartId}', -1)" class="px-3 py-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-l-lg transition">-</button>
                        <span class="px-2 text-white font-medium text-xs">${item.quantity}</span>
                        <button onclick="updateQuantity('${item.cartId}', 1)" class="px-3 py-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-r-lg transition">+</button>
                    </div>
                    <button type="button" onclick="removeFromCart('${item.cartId}')" class="text-xs font-medium text-red-400 hover:text-red-300 transition">
                        <i class="fa-regular fa-trash-can mr-1"></i> Remove
                    </button>
                </div>
            </div>
        `;
        container.appendChild(li);
    });

    totalEl.innerText = '৳' + total.toFixed(2);
}

// Buy Now function (Directly calls checkout)
function buyNow(id, source = 'card') {
    const item = createCartItem(id, source);
    if (item) {
        localStorage.setItem('tentionfree_buyNow', JSON.stringify(item));
        window.location.href = 'checkout.html';
    }
}
