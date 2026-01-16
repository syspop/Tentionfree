// --- API & Data ---

async function fetchProducts() {
    try {
        const response = await fetch(`${CONFIG.API_URL}?t=${Date.now()}`);
        if (!response.ok) throw new Error("Failed to fetch products");
        let fetchedData = await response.json();

        // Use default products if empty (Seeding Logic)
        if (!Array.isArray(fetchedData) || fetchedData.length === 0) {
            console.warn("Server empty. Seeding defaults...");
            // Use window.defaultProducts if available (could be loaded from separate file or hardcoded fallback)
            // For now, assume it's loaded or empty.
            if (typeof defaultProducts !== 'undefined') {
                window.products = defaultProducts;
                // SEEDING
                await fetch(CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(defaultProducts)
                });
                console.log("Defaults seeded to server.");
            } else {
                window.products = [];
            }
        } else {
            window.products = fetchedData;
        }
        console.log("Products loaded:", products.length);

    } catch (error) {
        console.warn("Server offline or error. Using defaults locally.", error);
        if (typeof defaultProducts !== 'undefined') {
            window.products = defaultProducts;
        }
    } finally {
        // Normalize Paths
        if (Array.isArray(window.products)) {
            window.products.forEach(p => {
                if (p.image && !p.image.startsWith('/') && !p.image.startsWith('http')) {
                    p.image = '/' + p.image;
                }
            });
        }

        // Render if on grid page
        if (typeof renderProducts === 'function' && document.getElementById('product-grid')) {
            renderProducts();
        }
    }
}

async function loadCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    try {
        const res = await fetch(CONFIG.CATEGORIES_URL);
        const categories = await res.json();

        let html = `<button onclick="filterProducts('all')" class="filter-btn ${currentFilter === 'all' ? 'active bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'} px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap">All</button>`;

        if (Array.isArray(categories)) {
            categories.forEach(c => {
                const isActive = currentFilter === c.id;
                const activeClasses = 'active bg-brand-500 text-white shadow-lg shadow-brand-500/30';
                const inactiveClasses = 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5';

                html += `<button onclick="filterProducts('${c.id}')" class="filter-btn ${isActive ? activeClasses : inactiveClasses} px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap">${c.name}</button>`;
            });
        }

        container.innerHTML = html;

    } catch (e) {
        console.error("Failed to load category filters:", e);
    }
}
