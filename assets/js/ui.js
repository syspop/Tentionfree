// --- UI Rendering ---

// Global render state
let lastAnimationTime = 0;

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = "";

    let filtered = window.products || [];

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
        if (product.inStock === false) {
            badgeHtml = `<div class="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
                <span class="border-2 border-white/80 text-white font-bold px-4 py-2 uppercase tracking-widest text-sm rotate-12">Out of Stock</span>
             </div>`;
        }

        let variantHtml = '';
        let priceDisplay = `৳${product.price}`;

        if (product.variants && product.variants.length > 0) {
            const variantOptions = product.variants.map((v, i) => `<option value="${i}">${v.label}</option>`).join('');
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
                
                <div class="card-image-container relative aspect-video overflow-hidden bg-slate-900">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" 
                        class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                    ${badgeHtml}
                </div>

                <div class="card-content p-5 flex flex-col flex-grow">
                    <div class="mb-1 flex items-center justify-between">
                         <span class="text-[10px] uppercase font-bold tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                            ${product.category || 'General'}
                         </span>
                         <div class="flex text-yellow-500 text-[10px] gap-0.5">
                            <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i>
                         </div>
                    </div>

                    <h3 class="text-white font-bold text-lg mb-2 leading-tight group-hover:text-brand-400 transition-colors line-clamp-1" title="${product.name}">
                        ${product.name}
                    </h3>

                    ${variantHtml}

                    <div class="mt-auto pt-4 flex items-end justify-between border-t border-slate-700/50 mt-4">
                        <div>
                            <span class="block text-slate-500 text-xs line-through mb-0.5 decoration-red-500/50">৳${product.originalPrice || (product.price * 1.2).toFixed(0)}</span>
                            <span class="block text-xl font-black text-white" id="price-current-${product.id}">${priceDisplay}</span>
                        </div>
                        
                        <div class="flex gap-2">
                            <button onclick="event.stopPropagation(); addToCart(${product.id}, true, 'card')" 
                                class="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center hover:bg-brand-500 transition-all shadow-lg hover:shadow-brand-500/30 active:scale-95 group/btn" 
                                title="Add to Cart">
                                <i class="fa-solid fa-cart-plus group-hover/btn:scale-110 transition-transform"></i>
                            </button>
                            <button onclick="event.stopPropagation(); buyNow(${product.id}, 'card')" 
                                class="px-4 h-10 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-brand-500 hover:text-white transition-all shadow-lg active:scale-95 flex items-center gap-2">
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
        container.innerHTML = `<div class="text-center text-red-500 py-20">Product not found</div>`;
        return;
    }

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
                        ${product.variants.map((v, i) => `<option value="${i}">${v.label} - ৳${v.price}</option>`).join('')}
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

    // 5. Buttons
    const buttonsHtml = `
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

    const content = `
        <!-- Left: Image -->
        <div class="relative group h-full">
            <div class="relative rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-800 aspect-[4/5] md:aspect-auto h-full">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
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

    // Load Reviews if function exists
    if (typeof loadReviews === 'function') {
        const reviewSection = document.getElementById('reviews-section');
        if (reviewSection) reviewSection.classList.remove('hidden');
        loadReviews(product.id);
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
