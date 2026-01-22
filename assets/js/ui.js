// --- UI Rendering ---

// Global render state
let lastAnimationTime = 0;

function renderProducts() {
    // Check for either grid ID
    const grid = document.getElementById('product-grid') || document.getElementById('home-product-grid');
    if (!grid) return;

    grid.innerHTML = "";

    let filtered = window.products || [];

    // Filter for Home Page ONLY
    if (grid.id === 'home-product-grid') {
        filtered = filtered.filter(p => p.viewInIndex === true || p.viewInIndex === "true");
    }

    // Filter by Category
    if (window.currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === window.currentFilter);
    }

    // Filter by Search
    if (window.searchQuery) {
        const lowerQ = window.searchQuery.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(lowerQ));
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20 animate-fade-in">
                <div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                    <i class="fa-solid fa-magnifying-glass text-3xl text-slate-500"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">No Products Found</h3>
                <p class="text-slate-400">Try adjusting your search or filter.</p>
                <button onclick="resetFilters()" class="mt-6 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all shadow-lg shadow-brand-500/20">
                    View All Products
                </button>
            </div>
        `;
        return;
    }




    filtered.forEach((product, index) => {
        const delay = index * 50; // Staggered animation
        const card = document.createElement('div');
        // card.className = "animate-fade-in-up"; 
        // We'll add animation class in inner HTML or just rely on CSS

        let badgeHtml = '';
        if (product.badge) {
            badgeHtml = `<div class="absolute top-3 right-3 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg z-10 uppercase tracking-wide border border-brand-400/50">${product.badge}</div>`;
        }
        // Check Auto Stockout Logic
        let isOutOfStock = product.inStock === false;
        if (product.autoStockOut && product.variants) {
            const hasStock = product.variants.some(v => v.stock && Array.isArray(v.stock) && v.stock.filter(s => typeof s === 'string' || (s.status === 'available' || !s.status)).length > 0);
            if (!hasStock) isOutOfStock = true;
        } else if (product.autoStockOut && !product.variants) {
            // No variants but auto stockout ON -> Out of Stock
            isOutOfStock = true;
        }

        if (isOutOfStock) {
            badgeHtml = `<div class="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                <span class="border-2 border-white/80 text-white font-bold px-4 py-2 uppercase tracking-widest text-sm rotate-12">Out of Stock</span>
             </div>`;
        }

        let variantHtml = '';
        let priceDisplay = `৳${product.price}`;

        if (product.variants && product.variants.length > 0) {
            const variantOptions = product.variants.map((v, i) => {
                // Check Visibility
                if (product.autoStockOut) {
                    const hasStock = v.stock && Array.isArray(v.stock) && v.stock.some(s => (typeof s === 'string') || (s.status === 'available' || !s.status));
                    if (!hasStock) return ''; // Hide if no stock and autoStockOut is ON
                }
                return `<option value="${i}">${v.label}</option>`;
            }).join('');
            variantHtml = `
                <div class="mt-3 relative group/select">
                    <i class="fa-solid fa-layer-group absolute left-3 top-2.5 text-xs text-slate-500 z-10 group-focus-within/select:text-brand-400 transition-colors"></i>
                    <select id="variant-select-${product.id}" onchange="updateCardPrice(${product.id})" onclick="event.stopPropagation()"
                        class="w-full bg-slate-900/50 border border-slate-700 text-slate-300 text-xs rounded-lg py-2 pl-8 pr-2 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all appearance-none cursor-pointer hover:bg-slate-800">
                        ${variantOptions}
                    </select>
                    <i class="fa-solid fa-chevron-down absolute right-3 top-2.5 text-xs text-slate-500 pointer-events-none"></i>
                </div>
            `;
            priceDisplay = `৳${product.variants[0].price}`;
        }

        card.innerHTML = `
            <div class="product-card-modern group h-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 relative flex flex-col"
                 style="animation: fadeInUp 0.5s ease-out ${delay}ms both;"
                 onclick="window.location.href='product-details.html?id=${product.id}'">
                
                <div class="card-image-container relative aspect-video overflow-hidden bg-slate-900 p-2">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" 
                        class="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60"></div>
                     <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                        <span class="bg-white/90 text-slate-900 font-bold px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-sm shadow-lg pointer-events-auto cursor-pointer select-none">
                            View Details
                        </span>
                    </div>
                </div>
                ${badgeHtml}

                <div class="card-content p-3 md:p-5 flex flex-col flex-grow">
                    <div class="mb-1 flex items-center justify-between">
                         <span class="text-[10px] uppercase font-bold tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                            ${product.category || 'General'}
                         </span>
                         <div class="flex text-yellow-500 text-[10px] gap-0.5">
                            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i>
                         </div>
                    </div>

                    <h3 class="text-white font-bold text-sm md:text-lg mb-2 leading-tight group-hover:text-brand-400 transition-colors line-clamp-1" title="${product.name}">
                        ${product.name}
                    </h3>

                    ${variantHtml}

                    <div class="mt-auto pt-2 md:pt-4 flex items-end justify-between border-t border-slate-700/50 mt-2 md:mt-4">
                        <div>
                            <span class="block text-slate-500 text-[10px] md:text-xs line-through mb-0.5 decoration-red-500/50">৳${product.originalPrice || (product.price * 1.2).toFixed(0)}</span>
                            <span class="block text-lg md:text-xl font-black text-white" id="price-current-${product.id}">${priceDisplay}</span>
                        </div>
                        
                        <div class="flex gap-1.5 md:gap-2">
                            <button onclick="event.stopPropagation(); addToCart(${product.id}, true, 'card')" 
                                class="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-700 text-white flex items-center justify-center hover:bg-brand-500 transition-all shadow-lg hover:shadow-brand-500/30 active:scale-95 group/btn" 
                                title="Add to Cart">
                                <i class="fa-solid fa-cart-plus text-xs md:text-base group-hover/btn:scale-110 transition-transform"></i>
                            </button>
                            <button onclick="event.stopPropagation(); buyNow(${product.id}, 'card')" 
                                class="px-3 md:px-4 h-8 md:h-10 rounded-lg md:rounded-xl bg-white text-slate-900 font-bold text-xs md:text-sm hover:bg-brand-500 hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-1 md:gap-2">
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        `;

        grid.appendChild(card);
    });
}

function updateCardPrice(productId) {
    const product = window.products.find(p => p.id === productId);
    const select = document.getElementById(`variant-select-${productId}`);
    const priceEl = document.getElementById(`price-current-${productId}`);

    if (product && select && priceEl) {
        const variant = product.variants[select.value];
        if (variant) {
            priceEl.innerText = `৳${variant.price}`;
            // Optional: Update Animation
            priceEl.classList.add('scale-110', 'text-brand-400');
            setTimeout(() => priceEl.classList.remove('scale-110', 'text-brand-400'), 200);
        }
    }
}

function filterProducts(category) {
    window.currentFilter = category;
    renderProducts();

    // Update Active Button State
    const buttons = document.querySelectorAll('#category-filters button');
    buttons.forEach(btn => {
        const btnCat = btn.innerText;
        // Logic depends on how api.js renders buttons (name vs id)
        // Usually, comparing text with category works if consistent.
        // Better: add data-id to buttons in api.js. 
        // For now, simple standard matching:

        let isActive = false;
        if (category === 'all' && btn.innerText === 'All') isActive = true;
        else if (btn.innerText === category) isActive = true; // Needs precise match
        // Or cleaner class check in loadCategoryFilters re-run? 
        // Actually, easiest is to just re-render categories or toggle class manually.

        if (isActive) {
            btn.className = "filter-btn active bg-brand-500 text-white shadow-lg shadow-brand-500/30 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap";
        } else {
            btn.className = "filter-btn bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap border border-slate-700/50";
        }
    });
}

async function loadProductDetailsPage() {
    console.log("loadProductDetailsPage started...");
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const container = document.getElementById('product-details-container');

    console.log("ProductID from URL:", productId);

    if (!container) return; // Not on details page

    if (!productId) {
        container.innerHTML = `<div class="text-center text-red-500 py-20">Product ID missing</div>`;
        return;
    }

    // Ensure products loaded
    if (!window.products || window.products.length === 0) {
        console.log("Products not loaded, fetching...");
        try {
            await fetchProducts(); // From api.js
        } catch (e) { console.error("Fetch failed in details:", e); }
    }

    console.log("Total Products:", window.products ? window.products.length : 0);

    const product = window.products.find(p => p.id == productId);
    if (!product) {
        console.error("Product not found for ID:", productId);
        container.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div class="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 relative">
                    <div class="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
                    <i class="fa-solid fa-box-open text-4xl text-slate-500"></i>
                    <i class="fa-solid fa-circle-exclamation text-xl text-red-500 absolute -top-1 -right-1 bg-slate-900 rounded-full border border-slate-800"></i>
                </div>
                <h2 class="text-3xl font-bold text-white mb-3">Product Not Found</h2>
                <p class="text-slate-400 max-w-md mx-auto mb-8">
                    The product you are looking for might have been removed or is temporarily unavailable.
                </p>
                <a href="products" class="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2 transform hover:-translate-y-1">
                    <i class="fa-solid fa-layer-group"></i> Browse All Products
                </a>
            </div>
        `;
        return;
    }

    // --- Update Breadcrumb ---
    const breadcrumb = document.getElementById('page-product-name-crumb');
    if (breadcrumb) breadcrumb.innerText = product.name;

    // --- Unhide Reviews Section ---
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) reviewsSection.classList.remove('hidden');

    // --- Render Details ---

    // Set Window Title
    document.title = `${product.name} - Tention Free`;
    // Update Page Title DOM if exists
    const pageTitle = document.getElementById('page-product-title');
    if (pageTitle) pageTitle.innerText = product.name;

    // --- Generate HTML ---

    // 1. Badge
    let badgeHtml = '';
    if (product.badge) {
        badgeHtml = `<div class="absolute top-4 left-4 bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg z-10">${product.badge}</div>`;
    }

    // 2. Features
    let featuresHtml = '';
    if (product.features && Array.isArray(product.features) && product.features.length > 0) {
        featuresHtml = `
        <div class="grid grid-cols-2 gap-3 mb-6">
            ${product.features.map(f => `
                <div class="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div class="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400">
                        <i class="fa-solid fa-check text-xs"></i>
                    </div>
                    <span class="text-slate-300 text-sm font-medium">${f}</span>
                </div>
            `).join('')}
        </div>`;
    }

    // 3. Instructions
    let instructionsHtml = '';
    if (product.instructions) {
        let instructionsList = [];
        if (Array.isArray(product.instructions)) {
            instructionsList = product.instructions;
        } else if (typeof product.instructions === 'string') {
            // Split by newline or just use as one item
            instructionsList = product.instructions.split('\n').filter(i => i.trim() !== '');
        }

        if (instructionsList.length > 0) {
            instructionsHtml = `
            <div class="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 mb-8">
                <h4 class="text-white font-bold mb-4 flex items-center gap-2">
                    <i class="fa-solid fa-circle-info text-brand-500"></i> How to Redeem
                </h4>
                <ol class="list-decimal list-inside space-y-2 text-slate-400 text-sm">
                    ${instructionsList.map(i => `<li>${i}</li>`).join('')}
                </ol>
            </div>`;
        }
    }

    // 4. Variants & Price
    let variantSectionHtml = '';
    let currentPrice = product.price;
    let currentOrgPrice = product.originalPrice || (product.price * 1.2).toFixed(0);

    if (product.variants && product.variants.length > 0) {
        currentPrice = product.variants[0].price;
        currentOrgPrice = product.variants[0].originalPrice || (currentPrice * 1.2).toFixed(0);

        variantSectionHtml = `
            <div class="mb-6">
                <label class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 block">Select Option</label>
                <div class="relative">
                    <select id="page-variant-select" onchange="updatePagePrice(${product.id})" 
                        class="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-4 pl-4 pr-10 appearance-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer hover:bg-slate-800">
                        ${product.variants.map((v, i) => {
            if (product.autoStockOut) {
                const hasStock = v.stock && Array.isArray(v.stock) && v.stock.some(s => (typeof s === 'string') || (s.status === 'available' || !s.status));
                if (!hasStock) return '';
            }
            return `<option value="${i}">${v.label} - ৳${v.price}</option>`;
        }).join('')}
                    </select>
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <i class="fa-solid fa-chevron-down"></i>
                    </div>
                </div>
            </div>
        `;
    }

    const priceSectionHtml = `
        <div class="flex flex-col">
            <span class="text-slate-500 text-sm line-through decoration-red-500/50" id="page-display-org-price">৳${currentOrgPrice}</span>
            <span class="text-4xl font-black text-white tracking-tight" id="page-display-price">৳${currentPrice}</span>
        </div>
    `;

    // Calculate Stock Status for Details Page
    let isDetailsOutOfStock = product.inStock === false;
    if (product.autoStockOut && product.variants) {
        const hasStock = product.variants.some(v => v.stock && Array.isArray(v.stock) && v.stock.filter(s => typeof s === 'string' || (s.status === 'available' || !s.status)).length > 0);
        if (!hasStock) isDetailsOutOfStock = true;
    } else if (product.autoStockOut && !product.variants) {
        isDetailsOutOfStock = true;
    }

    let buttonsHtml = '';
    if (isDetailsOutOfStock) {
        buttonsHtml = `
            <div class="col-span-2 mt-6">
                <button disabled 
                    class="w-full py-4 rounded-xl bg-slate-700 text-slate-400 font-bold opacity-50 cursor-not-allowed flex items-center justify-center gap-2 border border-slate-600">
                    <i class="fa-solid fa-ban"></i> Out of Stock
                </button>
            </div>
            `;
    } else {
        buttonsHtml = `
            <div class="grid grid-cols-2 gap-4 mt-6">
                <button onclick="addToCartPage(${product.id})" 
                    class="py-4 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-2 group">
                    <i class="fa-solid fa-cart-plus group-hover:scale-110 transition-transform text-brand-400"></i> Add to Cart
                </button>
                <button onclick="buyNowPage(${product.id})" 
                    class="py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold hover:from-brand-500 hover:to-brand-400 transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transform active:scale-95">
                    Buy Now <i class="fa-solid fa-bolt"></i>
                </button>
            </div>
            `;
    }

    const content = `
                <!-- Left: Image -->
        <div class="relative group h-full flex items-center justify-center">
            <div class="relative rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-800 w-full max-w-md aspect-square flex items-center justify-center p-6">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent"></div>
                ${badgeHtml}
                
                <!-- Floating Info (Optional) -->
                <div class="absolute bottom-6 left-6 right-6">
                    <div class="flex flex-wrap gap-2">
                        <span class="bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
                            <i class="fa-regular fa-clock text-brand-400"></i> Instant Delivery
                        </span>
                        <span class="bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
                            <i class="fa-solid fa-shield-halved text-emerald-400"></i> Secure
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right: Info -->
        <div class="flex flex-col h-full animate-fade-in pl-0 md:pl-8 py-4">
            <div class="mb-2 flex items-center gap-3">
                <span class="text-brand-400 font-bold tracking-widest text-[10px] uppercase bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full">${product.category}</span>
                <div class="h-px bg-slate-800 flex-1"></div>
            </div>
            
            <h1 class="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">${product.name}</h1>
            
            <p class="text-slate-400 text-lg leading-relaxed mb-8 font-light border-l-2 border-slate-700 pl-4">${product.longDesc || product.desc}</p>
            
            ${featuresHtml}
            ${instructionsHtml}
            
            <div class="mt-auto bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-slate-700/50 shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-brand-500 via-cyan-500 to-transparent opacity-50"></div>
                ${variantSectionHtml}
                <div class="flex items-end justify-between mb-8">
                     ${priceSectionHtml}
                     <div class="text-right">
                         <div class="flex items-center gap-1 text-yellow-500 text-sm mb-1.5 justify-end">
                            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
                         </div>
                         <p class="text-slate-500 text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
                            <i class="fa-solid fa-bolt text-brand-500"></i> Instant Delivery
                         </p>
                     </div>
                </div>
                ${buttonsHtml}
            </div>
        </div>
    `;

    container.innerHTML = content;

    // Load Reviews
    document.getElementById('reviews-section').classList.remove('hidden');
    // Call loadReviews if defined, or it will be defined below
    if (typeof loadReviews === 'function') loadReviews(productId);
}

// --- Reviews System & Modals ---

async function loadReviews(productId) {
    const list = document.getElementById('page-reviews-list');
    const summary = document.getElementById('page-rating-summary');
    if (!list) return;

    list.innerHTML = '<div class="text-center text-slate-500 py-4"><div class="spinner border-brand-500 w-6 h-6 mx-auto mb-2"></div>Loading reviews...</div>';

    try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        // If 404/error, just handle gracefully
        if (!res.ok) {
            if (res.status === 404) {
                list.innerHTML = '<div class="text-center text-slate-500 italic py-4">No reviews yet.</div>';
                return;
            }
            throw new Error("Failed");
        }

        const reviews = await res.json();

        if (!Array.isArray(reviews) || reviews.length === 0) {
            list.innerHTML = '<div class="text-center text-slate-500 italic py-4 text-sm opacity-70">No reviews yet. Be the first to share your experience!</div>';
            if (summary) summary.innerText = '';
            return;
        }

        // Calculate Average
        const totalStars = reviews.reduce((acc, r) => acc + (parseInt(r.rating) || 0), 0);
        const avg = (totalStars / reviews.length).toFixed(1);
        if (summary) summary.innerHTML = `<i class="fa-solid fa-star text-yellow-500"></i> ${avg} <span class="text-slate-500 text-sm">(${reviews.length})</span>`;

        // Render List
        list.innerHTML = reviews.map(r => `
            <div class="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-600">
                            ${(r.userName || r.user || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h5 class="text-sm font-bold text-slate-200">${r.userName || r.user || 'Anonymous'}</h5>
                            <div class="text-[10px] text-yellow-500 flex gap-0.5">
                                ${Array(parseInt(r.rating) || 5).fill('<i class="fa-solid fa-star"></i>').join('')}
                            </div>
                        </div>
                    </div>
                    <span class="text-[10px] text-slate-500">${new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <p class="text-xs md:text-sm text-slate-400 leading-relaxed bg-slate-900/30 p-2 rounded-lg border border-slate-800/50">${r.comment}</p>
            </div>
        `).join('');

    } catch (e) {
        console.error("Reviews load error:", e);
        list.innerHTML = '<div class="text-center text-red-400 py-4 text-xs opacity-70">Could not load reviews.</div>';
    }
}

async function submitReviewPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) return showErrorModal("Error", "Product ID missing.");

    const name = document.getElementById('review-name').value;
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;

    if (!rating) return showErrorModal("Rating Required", "Please select a star rating.");
    if (!comment) return showErrorModal("Comment Required", "Please write your feedback.");

    // Auth Check
    const token = localStorage.getItem('userToken');
    if (!token) {
        if (typeof showLoginRequiredModal === 'function') {
            showLoginRequiredModal();
        } else {
            // Fallback just in case, though ensureGlobalModals should handle it
            window.location.href = 'login';
        }
        return;
    }

    const submitBtn = document.querySelector('#page-review-form button');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: productId,
                rating: parseInt(rating),
                comment: comment,
                userName: name
            })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            showSuccessModal();
            document.getElementById('page-review-form').classList.add('hidden');
            document.getElementById('review-comment').value = '';
            document.getElementById('review-name').value = '';
            loadReviews(productId);
        } else {
            if (res.status === 403 || (data.message && data.message.toLowerCase().includes('purchase'))) {
                showErrorModal("Verified Purchase Required", "You can only review products you have actually purchased.");
            } else {
                showErrorModal("Review Failed", data.message || "Server rejected the review.");
            }
        }
    } catch (e) {
        console.error(e);
        showErrorModal("Network Error", "Unable to contact server.");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

// --- Modal System (Dynamic Injection) ---

function ensureGlobalModals() {
    // 1. Error Modal
    if (!document.getElementById('global-error-modal')) {
        const errorModalHtml = `
        <div id="global-error-modal" class="fixed inset-0 z-[999999] overflow-y-auto hidden" role="dialog" aria-modal="true">
            <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-slate-900/80 transition-opacity backdrop-blur-sm" aria-hidden="true" onclick="closeErrorModal()"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-slate-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-red-500/30">
                    <div class="bg-slate-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10 border border-red-500/30">
                                <i class="fa-solid fa-triangle-exclamation text-red-500 text-xl"></i>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 class="text-lg leading-6 font-bold text-white" id="error-modal-title">Error</h3>
                                <div class="mt-2">
                                    <p class="text-sm text-slate-300" id="error-modal-message">Something went wrong.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-800">
                        <button type="button" onclick="closeErrorModal()" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-bold text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-all transform active:scale-95">
                            OK, Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', errorModalHtml);
    }

    // 2. Success Modal
    if (!document.getElementById('global-success-modal')) {
        const successModalHtml = `
        <div id="global-success-modal" class="fixed inset-0 z-[999999] overflow-y-auto hidden" role="dialog" aria-modal="true">
            <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-slate-900/80 transition-opacity backdrop-blur-sm" aria-hidden="true" onclick="closeSuccessModal()"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-slate-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-green-500/30">
                    <div class="bg-slate-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-900/30 sm:mx-0 sm:h-10 sm:w-10 border border-green-500/30">
                                <i class="fa-solid fa-check text-green-500 text-xl"></i>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 class="text-lg leading-6 font-bold text-white" id="success-modal-title">Success!</h3>
                                <div class="mt-2">
                                    <p class="text-sm text-slate-300" id="success-modal-message">Operation completed successfully.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-800">
                        <button type="button" onclick="closeSuccessModal()" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-bold text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-all transform active:scale-95">
                            Awesome!
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', successModalHtml);
    }

    // 3. Login Required Modal (New)
    if (!document.getElementById('global-login-modal')) {
        const loginModalHtml = `
        <div id="global-login-modal" class="fixed inset-0 z-[999999] overflow-y-auto hidden" role="dialog" aria-modal="true">
            <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-slate-900/80 transition-opacity backdrop-blur-sm" aria-hidden="true" onclick="closeLoginModal()"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-slate-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-brand-500/30">
                    <div class="bg-slate-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-brand-900/30 sm:mx-0 sm:h-10 sm:w-10 border border-brand-500/30">
                                <i class="fa-solid fa-right-to-bracket text-brand-500 text-xl"></i>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 class="text-lg leading-6 font-bold text-white">Login Required</h3>
                                <div class="mt-2">
                                    <p class="text-sm text-slate-300">You need to be logged in to perform this action.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-800 gap-2">
                        <a href="login" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-bold text-white hover:bg-brand-700 focus:outline-none sm:w-auto sm:text-sm transition-all transform active:scale-95 text-center items-center">
                            Login Now
                        </a>
                        <button type="button" onclick="closeLoginModal()" class="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-700 shadow-sm px-4 py-2 bg-slate-800 text-base font-bold text-slate-300 hover:bg-slate-700 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm transition-all">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', loginModalHtml);
    }

    // 4. Confirm Modal (New)
    if (!document.getElementById('global-confirm-modal')) {
        const confirmModalHtml = `
        <div id="global-confirm-modal" class="fixed inset-0 z-[999999] overflow-y-auto hidden" role="dialog" aria-modal="true">
            <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 bg-slate-900/80 transition-opacity backdrop-blur-sm" aria-hidden="true" onclick="closeConfirmModal()"></div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-slate-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-slate-700">
                    <div class="bg-slate-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                             <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-slate-700/50 sm:mx-0 sm:h-10 sm:w-10 border border-slate-600" id="confirm-icon-container">
                                <i class="fa-solid fa-question text-white text-xl"></i>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 class="text-lg leading-6 font-bold text-white" id="confirm-modal-title">Confirm</h3>
                                <div class="mt-2">
                                    <p class="text-sm text-slate-300" id="confirm-modal-message">Are you sure?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-800 gap-2" id="confirm-modal-actions">
                        <!-- Buttons injected dynamically -->
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', confirmModalHtml);
    }

    // 5. Toast Container
    if (!document.getElementById('toast-container')) {
        const toastContainer = `<div id="toast-container" class="fixed top-5 right-5 z-[9999999] space-y-3 pointer-events-none"></div>`;
        document.body.insertAdjacentHTML('beforeend', toastContainer);
    }
}

// Ensure modals are ready on load
document.addEventListener('DOMContentLoaded', ensureGlobalModals);

// Exposed Global Functions
window.closeErrorModal = function () {
    const m = document.getElementById('global-error-modal');
    if (m) m.classList.add('hidden');
}

window.showErrorModal = function (title, msg) {
    ensureGlobalModals(); // Just in case
    const m = document.getElementById('global-error-modal');
    if (m) {
        document.getElementById('error-modal-title').innerText = title || "Error";
        document.getElementById('error-modal-message').innerText = msg || "Something went wrong.";
        m.classList.remove('hidden');
    } else {
        alert(`${title}\n\n${msg}`);
    }
}

window.closeSuccessModal = function () {
    const m = document.getElementById('global-success-modal');
    if (m) m.classList.add('hidden');
}

window.showSuccessModal = function (title, msg) {
    ensureGlobalModals(); // Just in case
    const m = document.getElementById('global-success-modal');
    if (m) {
        if (title) document.getElementById('success-modal-title').innerText = title;
        if (msg) document.getElementById('success-modal-message').innerText = msg;
        m.classList.remove('hidden');
    } else {
        alert("Success!");
    }
}

window.closeLoginModal = function () {
    const m = document.getElementById('global-login-modal');
    if (m) m.classList.add('hidden');
}

// --- CONFIRM MODAL ---
window.closeConfirmModal = function () {
    const m = document.getElementById('global-confirm-modal');
    if (m) m.classList.add('hidden');
}

window.showConfirm = function (title, msg, onConfirm) {
    ensureGlobalModals();
    const m = document.getElementById('global-confirm-modal');
    if (m) {
        document.getElementById('confirm-modal-title').innerText = title;
        document.getElementById('confirm-modal-message').innerText = msg;

        // Reset Icon/Color default
        const iconContainer = document.getElementById('confirm-icon-container');
        iconContainer.className = "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-slate-700/50 sm:mx-0 sm:h-10 sm:w-10 border border-slate-600";
        iconContainer.innerHTML = '<i class="fa-solid fa-question text-white text-xl"></i>';

        const actions = document.getElementById('confirm-modal-actions');
        actions.innerHTML = `
            <button id="global-confirm-btn" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-bold text-white hover:bg-brand-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-all transform active:scale-95">Yes</button>
            <button onclick="closeConfirmModal()" class="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-700 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-300 hover:bg-slate-700 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">No, Cancel</button>
        `;

        document.getElementById('global-confirm-btn').onclick = function () {
            onConfirm();
            closeConfirmModal();
        };

        m.classList.remove('hidden');
    } else {
        if (confirm(`${title}\n\n${msg}`)) onConfirm();
    }
}

// --- TOAST NOTIFICATIONS ---
window.showToast = function (msg, type = 'success') {
    ensureGlobalModals(); // Ensure container exists
    const container = document.getElementById('toast-container');
    if (!container) return; // Should not happen

    const toast = document.createElement('div');

    // Tailwind Toast Classes
    let colorClass = type === 'error' ? 'bg-red-600 border-red-500' : 'bg-emerald-600 border-emerald-500';
    let icon = type === 'error' ? '<i class="fa-solid fa-circle-xmark text-lg"></i>' : '<i class="fa-solid fa-check-circle text-lg"></i>';

    if (type === 'info') {
        colorClass = 'bg-blue-600 border-blue-500';
        icon = '<i class="fa-solid fa-circle-info text-lg"></i>';
    }

    toast.className = `pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-xl shadow-2xl transform transition-all duration-300 translate-x-10 opacity-0 text-white font-semibold text-sm ${colorClass} min-w-[320px] border border-white/10 backdrop-blur-md`;
    toast.innerHTML = `${icon} <span>${msg}</span>`;

    container.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-10', 'opacity-0');
    });

    // Remove after 3s
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}


window.showLoginRequiredModal = function () {
    ensureGlobalModals();
    const m = document.getElementById('global-login-modal');
    if (m) m.classList.remove('hidden');
    else {
        if (confirm("Login Required. Go to login page?")) window.location.href = 'login';
    }
}

// Helpers for Details Page
function updatePagePrice(id) {
    const product = window.products.find(p => p.id === id);
    const select = document.getElementById('page-variant-select');
    if (!product || !select) return;

    const index = select.value;
    const variant = product.variants[index];

    document.getElementById('page-display-price').innerText = `৳${variant.price}`;
    if (variant.originalPrice) document.getElementById('page-display-org-price').innerText = `৳${variant.originalPrice}`;
}

function addToCartPage(id) {
    // Requires cart.js addToCart
    if (typeof addToCart === 'function') addToCart(id, true, 'page');
}

function buyNowPage(id) {
    // Requires cart.js buyNow
    if (typeof buyNow === 'function') buyNow(id, 'page');
}

// Slider Logic
async function initBannerSlider() {
    const wrapper = document.getElementById('banner-wrapper');
    if (!wrapper) return;

    try {
        const res = await fetch(CONFIG.BANNERS_URL);
        const banners = await res.json();

        if (!Array.isArray(banners) || banners.length === 0) {
            document.getElementById('banner-slider').style.display = 'none';
            document.getElementById('home').classList.remove('pt-10');
            document.getElementById('home').classList.add('pt-40');
            return;
        }

        wrapper.innerHTML = banners.map(b => `
            <a href="${b.link || '#'}" class="swiper-slide w-full h-full flex-shrink-0 relative block">
                <img src="${b.image}" alt="Banner" class="w-full h-full object-cover">
            </a>
        `).join('');

        // Pagination
        const pagination = document.getElementById('banner-pagination');
        pagination.innerHTML = banners.map((_, i) => `
            <button onclick="goToSlide(${i})" class="w-3 h-3 rounded-full transition-all ${i === 0 ? 'bg-brand-500 w-6' : 'bg-white/50 hover:bg-white'}"></button>
        `).join('');

        startSliderAutoPlay(banners.length);

    } catch (err) {
        console.error("Failed to load banners:", err);
        document.getElementById('banner-slider').style.display = 'none';
    }
}

let currentSlide = 0;
let slideInterval;

function startSliderAutoPlay(totalSlides) {
    const wrapper = document.getElementById('banner-wrapper');
    const dots = document.getElementById('banner-pagination').children;

    function updateSlider() {
        wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        Array.from(dots).forEach((dot, i) => {
            dot.className = `w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-brand-500 w-6' : 'bg-white/50 hover:bg-white'}`;
        });
    }

    window.goToSlide = (index) => {
        currentSlide = index;
        updateSlider();
        resetInterval();
    };

    const nextBtn = document.getElementById('next-banner');
    const prevBtn = document.getElementById('prev-banner');

    if (nextBtn) nextBtn.onclick = () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
        resetInterval();
    };

    if (prevBtn) prevBtn.onclick = () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlider();
        resetInterval();
    };

    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            updateSlider();
        }, 4000);
    }
    resetInterval();
}

// Mobile Search Toggler
function toggleMobileSearch() {
    const bar = document.getElementById('mobile-search-bar');
    if (bar) {
        bar.classList.toggle('hidden');
        if (!bar.classList.contains('hidden')) {
            const input = bar.querySelector('input');
            if (input) input.focus();
        }
    }
}
