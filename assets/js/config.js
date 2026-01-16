// --- Security & Config ---

// 🔒 DOMAIN LOCK PROTECTION
(function secureClient() {
    const hostname = window.location.hostname;
    const allowedDomains = ['tentionfree.store', 'www.tentionfree.store', 'localhost', '127.0.0.1'];

    if (hostname) {
        const isAllowed = allowedDomains.includes(hostname);

        if (!isAllowed) {
            document.documentElement.innerHTML = '';
            document.write('<div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:red;font-size:24px;font-family:sans-serif;text-align:center;">This website is protected. <br> Access from unauthorized domain is prohibited.</div>');
            throw new Error("Domain Access Violation");
        }
    }

    // 🛡️ UI PROTECTION
    document.addEventListener('contextmenu', event => {
        if (event.target.tagName === 'IMG') {
            event.preventDefault();
            return false;
        }
    });
    document.addEventListener('dragstart', event => {
        if (event.target.tagName === 'IMG') {
            event.preventDefault();
            return false;
        }
    });

})();

const CONFIG = {
    API_URL: '/api/products',
    CATEGORIES_URL: '/api/categories',
    BANNERS_URL: '/api/banners'
};

// Global State
window.products = [];
window.cart = [];
window.currentFilter = 'all';
window.searchQuery = '';
