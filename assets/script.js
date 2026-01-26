// --- Main Entry Point ---

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Initialize Auth
        checkLogin();
        updateNavbar();

        // 2. Initialize Data
        await fetchSystemSettings(); // Global Configs (including Auto Stockout)
        // Fetch and Render Products (if on home/shop page)
        if (document.getElementById('product-grid') || document.getElementById('home-product-grid') || document.getElementById('product-details-container')) {
            await fetchProducts(); // From api.js, stores in window.products
        }

        // 3. Initialize UI Components
        // Home Page
        if (document.getElementById('home-product-grid') || document.getElementById('product-grid')) {
            loadCategoryFilters();
            renderProducts();
            initBannerSlider();
        }

        // Product Details Page
        if (document.getElementById('product-details-container')) {
            loadProductDetailsPage();
        }

        // Checkout Page
        if (document.getElementById('checkout-items-summary')) {
            initCheckoutPage();
        }

        // 4. Global Event Listeners

        // Live Search
        // Live Search & Suggestions
        if (typeof initSearch === 'function') {
            initSearch();
        } else {
            // Fallback if ui.js update failed or cached
            console.warn("initSearch not found, falling back to basic listener");
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    window.searchQuery = e.target.value;
                    renderProducts();
                });
            }
        }

        // Cart Sidebar Toggles
        const cartBtn = document.getElementById('cart-btn');
        const closeCartBtn = document.getElementById('close-cart');
        const cartBackdrop = document.getElementById('cart-backdrop');

        if (cartBtn) cartBtn.addEventListener('click', toggleCart);
        if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
        if (cartBackdrop) cartBackdrop.addEventListener('click', toggleCart);

        // Initial Cart Logic
        updateCartCount();

        // Expose necessary functions to window if not already
        // Most are already global due to separate file loading strategy

    } catch (error) {
        console.error("Initialization Error:", error);
    } finally {
        // Force Hide Loader
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 500); // Small delay to ensure render is done
        }
    }
});

// Window Event Listeners
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
        if (window.scrollY > 50) {
            nav.classList.add('bg-slate-900/90', 'backdrop-blur-md', 'shadow-xl');
            nav.classList.remove('bg-transparent');
        } else {
            nav.classList.remove('bg-slate-900/90', 'backdrop-blur-md', 'shadow-xl');
            nav.classList.add('bg-transparent');
        }
    }
});
