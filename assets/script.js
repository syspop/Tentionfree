// --- Auth Protection ---
(function checkAuthProtection() {
    const path = window.location.pathname;
    const token = localStorage.getItem('userToken');

    // Protected Routes (User must be logged in)
    if (path.includes('profile.html')) {
        if (!token) {
            window.location.href = 'login.html';
        }
    }

    // Public/Guest Routes (User must NOT be logged in)
    if (path.includes('login.html') || path.includes('register.html')) {
        if (token) {
            window.location.href = 'profile.html';
        }
    }
})();

// --- Data ---
function createVariants(basePrice, baseOriginal) {
    return [
        { label: "1 Month", price: basePrice, originalPrice: baseOriginal },
        { label: "3 Months", price: basePrice * 3 * 0.95, originalPrice: baseOriginal * 3 }, // 5% off
        { label: "6 Months", price: basePrice * 6 * 0.90, originalPrice: baseOriginal * 6 }, // 10% off
        { label: "12 Months", price: basePrice * 12 * 0.85, originalPrice: baseOriginal * 12 } // 15% off
    ].map(v => ({ ...v, price: Math.round(v.price), originalPrice: Math.round(v.originalPrice) }));
}

// Enriched Product Data with details

// Default Products Data (used for seeding)
const defaultProducts = [
    {
        id: 1,
        name: "Netflix Premium (4K)",
        category: "streaming",
        viewInIndex: true,
        price: 340,
        originalPrice: 500,
        image: "assets/images/Netflix.png",
        desc: "4K UHD | Private Profile",
        longDesc: "Bangladesh's best Netflix Premium subscription service. Enjoy 4K Ultra HD streaming on your TV, Mobile, or Laptop without interruptions. We provide a private profile with a secure PIN. 100% warranty support included. Order now and get instant delivery.",
        features: [
            "4K Ultra HD Quality",
            "Private Profile with PIN",
            "Works on TV, Mobile & Laptop",
            "Download Supported",
            "1 Device Only",
            "Full Warranty Support"
        ],
        instructions: "অর্ডার কনফার্ম হওয়ার ১০ মিনিটের মধ্যেই আপনার দেওয়া WhatsApp নম্বর অথবা ইমেইলে অ্যাকাউন্ট ডেলিভারি করা হবে।",
        variants: [
            { label: "1 Month", price: 340, originalPrice: 500 },
            { label: "3 Months", price: 1000, originalPrice: 1500 },
            { label: "6 Months", price: 1900, originalPrice: 3000 },
            { label: "12 Months", price: 3600, originalPrice: 6000 }
        ]
    },
    {
        id: 2,
        name: "Spotify Premium",
        category: "streaming",
        viewInIndex: true,
        price: 150,
        originalPrice: 300,
        image: "assets/images/spotify.png",
        desc: "Individual Plan | Ad-free",
        longDesc: "Get the cheapest Spotify Premium price in Bangladesh. Enjoy ad-free music with offline download support. This is a legitimate Family Invitation method that works on your own account. No need to create a new ID. Upgrade your existing account to Premium instantly.",
        features: [
            "100% Genuine Spotify Premium",
            "1 Device / 1 Account",
            "No Ads",
            "High Quality Audio",
            "Offline Download Support",
            "Personal Account (নতুন একাউন্ট দরকার নেই)",
            "All Country Supported",
            "Full Time Support"
        ],
        instructions: "অর্ডার করার সময় আপনার Spotify Account Email দিন। আমরা আপনার জিমেইলে Family Invitation পাঠাবো। ইনভিটেশন নিজে Accept করতে হবে। ৫–১০ মিনিটের মধ্যে ইনভিটেশন পাঠানো হবে।",
        variants: [
            { label: "1 Month", price: 150, originalPrice: 300 },
            { label: "3 Months", price: 420, originalPrice: 900 },
            { label: "6 Months", price: 800, originalPrice: 1800 },
            { label: "12 Months", price: 1500, originalPrice: 3600 }
        ]
    },
    {
        id: 3,
        name: "Canva Pro",
        category: "tools",
        price: 50,
        originalPrice: 100,
        image: "assets/images/Canva.png",
        desc: "Education | Pro Features",
        longDesc: "Canva Pro / Canva Education (Team Invitation).\nActivation Method: Team Invitation\nআপনার দেওয়া জিমেইল অ্যাড্রেসে টিম ইনভিটেশন পাঠানো হবে। ইনভিটেশন একসেপ্ট করার সাথে সাথেই আপনার নেওয়া Canva Pro অথবা Canva Education সাবস্ক্রিপশন অ্যাক্টিভ হয়ে যাবে।",
        features: [
            "Premium Templates & Elements Access",
            "Background Remover",
            "Brand Kit & Magic Resize",
            "HD Download (PNG, JPG, PDF, MP4)",
            "Works on Mobile, PC & Web",
            "Personal Account",
            "1 Gmail = 1 Account",
            "Support & Warranty Available"
        ],
        instructions: "আপনার দেওয়া জিমেইল অ্যাড্রেসে টিম ইনভিটেশন পাঠানো হবে। সাপোর্টে যোগাযোগ করুন 01869895549 WhatsApp",
        variants: [
            { label: "1 Month (Pro)", price: 50, originalPrice: 100 },
            { label: "1 Year (Education)", price: 200, originalPrice: 500 },
            { label: "3 Years (Education)", price: 300, originalPrice: 900 }
        ]
    },
    {
        id: 4,
        name: "YouTube Premium",
        category: "streaming",
        price: 120,
        originalPrice: 200,
        image: "assets/images/Youtube.png",
        desc: "Ad-free | Background Play",
        longDesc: "YouTube Premium (Family Invitation Method)\nকিভাবে কাজ করবে:\nআপনার দেওয়া জিমেইল ঠিকানায় YouTube Family Invitation পাঠানো হবে।\nইনভিটেশন Accept করার সাথে সাথেই আপনার একাউন্টে YouTube Premium Active হয়ে যাবে।",
        features: [
            "Ad-free YouTube",
            "Background Play",
            "YouTube Music Premium",
            "Mobile, PC & TV Support",
            "Family Invitation (Safe & Secure)",
            "Full Support During Subscription"
        ],
        instructions: "সাবস্ক্রিপশন রিনিউ: আপনি যদি ১ মাসের বেশি সময়ের জন্য সাবস্ক্রিপশন নেন, তাহলে প্রতি মাস শেষে আমাদের সাপোর্টে SMS / WhatsApp দিয়ে সহজেই রিনিউ করে নিতে পারবেন।",
        variants: [
            { label: "1 Month", price: 120, originalPrice: 200 },
            { label: "3 Months", price: 350, originalPrice: 600 },
            { label: "6 Months", price: 680, originalPrice: 1200 },
            { label: "12 Months", price: 1340, originalPrice: 2400 }
        ]
    },
    {
        id: 5,
        name: "Free Fire (115 💎)",
        category: "gaming",
        viewInIndex: true,
        price: 85,
        originalPrice: 90,
        image: "assets/images/Freefire.png",
        desc: "UID Topup | Instant",
        longDesc: "Top Up Free Fire Diamonds in Bangladesh instantly using your Player ID (UID). Cheapest diamond price in BD. 100% safe and secure top-up with no login required. Get your diamonds within 5-10 minutes.",
        features: [
            "৫–১০ মিনিটের মধ্যে ডায়মন্ড যুক্ত হবে",
            "১০০% সেফ, কোনো লগইন দরকার নেই",
            "সব দেশের একাউন্ট সাপোর্ট",
            "স্কিন, ইমোট, লাকি স্পিন ও ইভেন্টে ব্যবহারযোগ্য"
        ],
        instructions: "সঠিক Player ID দিন, ডেলিভারির পর রিফান্ড নেই। ১০ মিনিটের মধ্যে ডায়মন্ড না পেলে আমাদের সাথে যোগাযোগ করুন।",
        // No variants for this game item yet
    },
    {
        id: 6,
        name: "PUBG UC (60)",
        category: "gaming",
        price: 95,
        originalPrice: 100,
        image: "assets/images/PUBG.jpeg",
        desc: "Global ID | Instant",
        longDesc: "Buy PUBG Mobile UC in Bangladesh at the lowest price. secure UID top-up for Global accounts. Get UC instantly within 10 minutes. Trusted PUBG UC shop in BD.",
        features: [
            "৫–১০ মিনিটের মধ্যে UC যুক্ত হবে",
            "১০০% সেফ, কোনো লগইন প্রয়োজন নেই",
            "সব দেশের একাউন্ট সাপোর্ট",
            "স্কিন, রয়্যাল পাস ও স্পিনে ব্যবহারযোগ্য"
        ],
        instructions: "সঠিক Player ID দিন। ১০ মিনিটের মধ্যে UC না পেলে আমাদের সাথে যোগাযোগ করুন।",
        // No variants for this game item yet
    },
    {
        id: 7,
        name: "NordVPN Premium",
        category: "tools",
        price: 300,
        originalPrice: 800,
        image: "assets/images/Nord VPN.png",
        desc: "6 Devices | Secure",
        longDesc: "Protect your privacy with NordVPN. Access geo-blocked content and browse securely on public Wi-Fi.",
        features: [
            "6 Simultaneous Devices",
            "5000+ Servers",
            "No Logs Policy",
            "High Speed"
        ],
        instructions: "You will receive a premium account email and password. Do not change the credentials.",
        variants: createVariants(300, 800)
    },
    {
        id: 8,
        name: "Amazon Prime",
        category: "streaming",
        price: 250,
        originalPrice: 500,
        image: "assets/images/Amazon Prime.png",
        desc: "4K Support | Exclusive",
        longDesc: "Amazon Prime Video Premium:\nঅর্ডার কনফার্ম হওয়ার ১০ মিনিটের মধ্যেই আপনার দেওয়া WhatsApp নম্বর অথবা ইমেইলে অ্যাকাউন্ট ডেলিভারি করা হবে।\nঅ্যাকাউন্ট ব্যবহারে কোনো সমস্যা হলে আমাদের WhatsApp সাপোর্টে যোগাযোগ করুন — দ্রুত সমাধান দেওয়া হবে。",
        features: [
            "HD / Full HD Streaming",
            "Private Profile (Secure Login)",
            "Works on TV, Mobile & Laptop",
            "Download Supported",
            "1 Device Only",
            "Full Warranty Support"
        ],
        instructions: "অর্ডার কনফার্ম হওয়ার ১০ মিনিটের মধ্যেই আপনার দেওয়া WhatsApp নম্বর অথবা ইমেইলে অ্যাকাউন্ট ডেলিভারি করা হবে।",
        variants: [
            { label: "1 Month", price: 250, originalPrice: 500 },
            { label: "6 Months", price: 1500, originalPrice: 3000 }
        ]
    },
    {
        id: 9,
        name: "Google AI Premium",
        category: "tools",
        price: 200,
        originalPrice: 400,
        image: "assets/images/Google Ai Pro.png",
        desc: "Gemini Advanced | 2TB",
        longDesc: "Google AI Pro (Invitation Method)\nকিভাবে কাজ করবে:\nআপনার দেওয়া Gmail ঠিকানায় Google AI Pro Invitation পাঠানো হবে।\nইনভিটেশন Accept করার সাথে সাথেই আপনার একাউন্টে Google AI Pro Active হয়ে যাবে।",
        features: [
            "Access to Advanced Google AI Models",
            "Gemini Advanced (Pro Features)",
            "Faster & Smarter AI Responses",
            "Text, Image & Productivity AI Tools",
            "Works on Mobile & PC",
            "Personal Gmail Based Access",
            "Safe Invitiation Method",
            "Full Support"
        ],
        instructions: "সাবস্ক্রিপশন রিনিউ: আপনি যদি ১ মাসের বেশি সময়ের জন্য সাবস্ক্রিপশন নেন, তাহলে আপনার সাবস্ক্রিপশনটি প্রতি মাসে অটোমেটিকভাবে রিনিউ হয়ে যাবে।",
        variants: [
            { label: "1 Month", price: 200, originalPrice: 400 },
            { label: "3 Months", price: 600, originalPrice: 1200 },
            { label: "6 Months", price: 1200, originalPrice: 2400 },
            { label: "12 Months", price: 2400, originalPrice: 5000 }
        ]
    },
    {
        id: 10,
        name: "Combo Pack (YT + 2TB)",
        category: "tools",
        price: 300,
        originalPrice: 600,
        image: "assets/images/Combo YT+Storage.png",
        desc: "YouTube Premium + 2TB",
        longDesc: "🎁 Combo Pack (YouTube Premium + Google Storage 2TB)\nকিভাবে কাজ করবে:\nআপনার দেওয়া জিমেইল ঠিকানায় YouTube Family Invitation ও Google One (2TB) Family Invitation পাঠানো হবে।",
        features: [
            "YouTube Ad-free Experience",
            "Background Play",
            "YouTube Music Premium",
            "Mobile, PC & Smart TV Support",
            "Google Drive / Gmail / Photos 2TB Storage",
            "Family Invitation Method",
            "All Country Supported",
            "Full Support"
        ],
        instructions: "সাবস্ক্রিপশন চলাকালীন কোনো সমস্যা হলে সাথে সাথে আমাদের সাপোর্টে যোগাযোগ করবেন।",
        variants: [
            { label: "1 Month", price: 300, originalPrice: 600 },
            { label: "3 Months", price: 900, originalPrice: 1800 },
            { label: "6 Months", price: 1800, originalPrice: 3600 },
            { label: "12 Months", price: 3600, originalPrice: 7200 }
        ]
    },
    {
        id: 11,
        name: "YouTube Premium (Non-Renewable)",
        category: "streaming",
        price: 50,
        originalPrice: 80,
        image: "assets/images/Youtube.png",
        desc: "Non-Renewable | 1 Month",
        longDesc: "🎬 YouTube Premium (Non-Renewable Package)\nকিভাবে কাজ করবে:\nআপনার দেওয়া জিমেইল ঠিকানায় YouTube Family Invitation পাঠানো হবে।\nইনভিটেশন Accept করার সাথে সাথেই আপনার একাউন্টে YouTube Premium Active হয়ে যাবে。",
        features: [
            "Ad-free YouTube",
            "Background Play",
            "YouTube Music Premium",
            "Mobile, PC & TV Support",
            "Safe Family Invitation Method",
            "Full Support During Subscription",
            "Non-Renewable Package"
        ],
        instructions: "⚠ এটি Non-Renewable Package. এই প্যাকেজ নিলে প্রতি ২ মাস অন্তর নতুন জিমেইল ব্যবহার করতে হবে।",
        variants: [
            { label: "1 Month", price: 50, originalPrice: 80 }
        ]
    },
];

// --- Load Products ---
// API Persistence Configuration
// --- Load Products (Node.js API) ---
const API_URL = '/api/products';

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}?t=${Date.now()}`);
        if (!response.ok) throw new Error("Failed to fetch products");
        let fetchedData = await response.json();

        if (!Array.isArray(fetchedData) || fetchedData.length === 0) {
            console.warn("Server empty. Seeding defaults...");
            products = defaultProducts;

            // SEEDING: Save defaults to server so Admin can see them
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(defaultProducts)
            });
            console.log("Defaults seeded to server.");
        } else {
            products = fetchedData;
        }
        console.log("Products loaded:", products.length);

    } catch (error) {
        console.warn("Server offline or error. Using defaults locally.", error);
        products = defaultProducts;
    } finally {
        // Normalize image paths globally to avoid issues with trailing slashes (e.g. /services/)
        if (Array.isArray(products)) {
            products.forEach(p => {
                if (p.image && !p.image.startsWith('/') && !p.image.startsWith('http')) {
                    p.image = '/' + p.image;
                }
            });
        }

        // Always render, whether success or error
        if (document.getElementById('product-grid')) {
            renderProducts();
        }
    }
}


// --- State ---
let cart = [];
let currentFilter = 'all';
let buyNowItem = null; // Store the single item for Buy Now
let isBuyNowMode = false; // Flag to track checkout mode
let searchQuery = ''; // Store current search query

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('tentionfree_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            // Fix legacy relative paths in cart
            let cartUpdated = false;
            cart.forEach(item => {
                if (item.image && !item.image.startsWith('/') && !item.image.startsWith('http')) {
                    item.image = '/' + item.image;
                    cartUpdated = true;
                }
            });
            if (cartUpdated) {
                localStorage.setItem('tentionfree_cart', JSON.stringify(cart));
            }
        } catch (e) {
            console.error('Error parsing cart from localStorage', e);
            cart = [];
        }
    }

    updateCartCount();

    // Check Auth State for Navbar
    const userJson = localStorage.getItem('user');
    const userToken = localStorage.getItem('userToken');

    if (userToken && userJson) {
        // Desktop Navbar
        const loginLink = document.querySelector('a[href="login"]');
        if (loginLink) {
            loginLink.href = 'profile.html';
            loginLink.innerHTML = `
                <i class="fa-solid fa-user text-xl mr-2"></i>
                <span class="text-sm font-medium">Profile</span>
            `;
        }

        // Mobile Menu (Legacy)
        const mobileLoginLink = document.querySelector('#mobile-menu a[href="login"]');
        if (mobileLoginLink) {
            mobileLoginLink.href = 'profile.html';
            mobileLoginLink.innerText = 'Profile';
        }
    }

    // Initialize Search Inputs (UI only)
    if (document.getElementById('product-grid')) {
        initSearch();
    } else {
        initGlobalSearch();
    }

    // Fetch Data from Server THEN handle logic
    fetchProducts().then(() => {
        // Logic to run AFTER products are loaded
        handleUrlParams();
        loadCategoryFilters(); // New: Load dynamic categories
        renderHomeProducts(); // New: Render home page products
        initBannerSlider(); // New: Initialize Banner Slider (Homepage)

        // Auto-run on details page
        if (window.location.pathname.includes('product-details.html') || window.location.pathname.startsWith('/product/') || window.location.search.includes('id=')) {
            loadProductDetailsPage();
        }
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('shadow-lg');
                nav.style.background = 'rgba(11, 17, 32, 0.85)';
            } else {
                nav.classList.remove('shadow-lg');
                nav.style.background = 'rgba(11, 17, 32, 0.6)';
            }
        }
    });
});

async function loadCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    try {
        const res = await fetch('/api/categories');
        const categories = await res.json();

        // Keep "All" button, append others
        // "All" is already static in HTML, or we can clear and rebuild.
        // Let's just append to ensure "All" stays first.
        // Actually, to avoid duplicates on re-run, let's clear except first child?
        // Safest: Clear all, rebuild ALL.

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
        // Fallback or leave as is (just 'All')
    }
}

// --- BANNER SLIDER LOGIC ---
async function initBannerSlider() {
    const wrapper = document.getElementById('banner-wrapper');
    if (!wrapper) return; // Not on homepage

    try {
        const res = await fetch('/api/banners');
        const banners = await res.json();

        if (!Array.isArray(banners) || banners.length === 0) {
            document.getElementById('banner-slider').style.display = 'none';
            document.getElementById('home').classList.remove('pt-10'); // Restore logging padding if no banner
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

    document.getElementById('next-banner').onclick = () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
        resetInterval();
    };

    document.getElementById('prev-banner').onclick = () => {
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


async function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const qParam = urlParams.get('q');

    if (idParam) {
        // If ID is present, try to open that product details
        const id = parseInt(idParam);
        const product = products.find(p => p.id == id); // Loose equality for safety
        console.log("Checking URL ID:", id, "Found:", product);
        if (product) {
            openDetails(id);
            // Optional: Filter grid to this product too?
            // Let's NOT filter grid restrictedly, or maybe search query is better.
            // But user asked to see THAT product.
        }
    }

    if (qParam) {
        searchQuery = qParam;
        // Populate inputs
        const inputs = document.querySelectorAll('.search-input, .search-input-lg, #search-input, #mobile-search-input');
        inputs.forEach(i => i.value = qParam);
    }

    // Always render products (initial render) logic is now here after fetch
    if (document.getElementById('product-grid')) {
        renderProducts();
    }
}

// --- PAGE LOAD CONTROLLER ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('loader-hidden');
        loader.addEventListener('transitionend', () => {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        });
    }

    // Router Logic based on Path
    const path = window.location.pathname;

    // 1. Product Details Page (Legacy or SSR)
    if (path.includes('product-details.html') || path.startsWith('/product/')) {
        loadProductDetailsPage();
    }
});

// --- NEW FUNCTION: Load Product Details Page ---
async function loadProductDetailsPage() {
    console.log("Loading Product Details Page...");
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id'); // Keep as string initially

    // SSR Fallback: Get ID from URL path (e.g., /product/123 or /product/netflix-premium)
    if (!id) {
        const parts = window.location.pathname.split('/');
        // Usually last part, but might have trailing slash
        const lastPart = parts.pop() || parts.pop();
        id = lastPart;
    }

    if (!id) {
        console.warn("No ID found.");
        // Do not auto-redirect immediately, let the user see the 404 from server if exists.
        return;
    }

    // Normalize ID for comparison (if numeric, parse it, otherwise keep string)
    const numericId = parseInt(id);
    const searchId = isNaN(numericId) ? id.toLowerCase() : numericId; // numeric or lowercase slug

    // Wait for products to load if empty (fetch first if needed)
    if (!products || products.length === 0) {
        await fetchProducts();
    }

    // Use searchId for lookup (handles both number and string slugs)
    // Use searchId for lookup (handles both number and string slugs)
    const product = products.find(p => {
        // 1. Direct ID match
        if (p.id == searchId) return true;

        // 2. Name match (Legacy: spaces to dashes)
        if (p.name && p.name.toLowerCase().replace(/ /g, '-') === searchId) return true;

        // 3. Robust Slug Match (Ignore parentheses, same as server)
        const cleanName = p.name ? p.name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase() : '';
        const nameSlug = cleanName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        return nameSlug === searchId;
    });
    if (!product) {
        document.getElementById('product-details-container').innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="fa-solid fa-triangle-exclamation text-4xl text-yellow-500 mb-4"></i>
                <h2 class="text-2xl font-bold text-white">Product Not Found</h2>
                <a href="products.html" class="inline-block mt-4 text-brand-400 hover:text-white underline">Back to Shop</a>
            </div>`;
        return;
    }

    // Update Page Title
    document.title = `${product.name} - Tention Free`;
    document.getElementById('page-product-name-crumb').innerText = product.name;

    // Render logic (similar to modal but for page structure)
    const container = document.getElementById('product-details-container');
    const isOutOfStock = product.inStock === false;

    // Determine Badge
    const badgeHtml = isOutOfStock
        ? `<span class="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Out of Stock</span>`
        : `<span class="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">${product.badge || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) + '% OFF'}</span>`;

    // Features List
    const featuresHtml = product.features
        ? `<ul class="space-y-3 mb-8">
            ${product.features.map(f => `
                <li class="flex items-start text-slate-300">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center mr-3 mt-0.5">
                        <i class="fa-solid fa-check text-brand-500 text-xs"></i>
                    </div>
                    <span class="text-sm leading-relaxed">${f}</span>
                </li>`).join('')}
           </ul>`
        : '';

    // Instructions
    const instructionsHtml = product.instructions
        ? `<div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-8">
                <h4 class="text-slate-200 font-bold mb-3 flex items-center">
                    <i class="fa-solid fa-circle-info text-blue-500 mr-2"></i> How to Use / Receive
                </h4>
                <div class="text-sm text-slate-400 leading-relaxed space-y-2">
                    ${product.instructions.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
           </div>`
        : '';

    // Variants & Price HTML Construction
    let variantSectionHtml = '';
    let priceSectionHtml = '';
    let buttonsHtml = '';

    if (product.variants && product.variants.length > 0) {
        // Has Variants
        const options = product.variants.map((v, i) => `<option value="${i}">${v.label} - ৳${v.price}</option>`).join('');

        variantSectionHtml = `
            <div class="mb-6">
                <label class="block text-sm font-medium text-slate-400 mb-2">Select Option</label>
                <div class="relative">
                    <select id="page-variant-select" onchange="updatePagePrice(${product.id})" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white appearance-none focus:outline-none focus:border-brand-500 transition-colors cursor-pointer text-base">
                        ${options}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <i class="fa-solid fa-chevron-down text-sm"></i>
                    </div>
                </div>
            </div>
        `;

        // Initial Price (First Variant)
        const v0 = product.variants[0];
        priceSectionHtml = `
            <div>
                <span class="text-sm text-slate-500 line-through block mb-1">৳${v0.originalPrice}</span>
                <span class="text-4xl font-bold text-white tracking-tight" id="page-display-price">৳${v0.price}</span>
            </div>
        `;
    } else {
        // No Variants
        priceSectionHtml = `
            <div>
                 <span class="text-sm text-slate-500 line-through block mb-1">৳${product.originalPrice}</span>
                 <span class="text-4xl font-bold text-white tracking-tight" id="page-display-price">৳${product.price}</span>
            </div>
        `;
    }

    // Buttons
    buttonsHtml = isOutOfStock
        ? `<button class="w-full bg-slate-800 text-slate-500 font-bold py-4 rounded-xl cursor-not-allowed border border-slate-700">Out of Stock</button>`
        : `<div class="grid grid-cols-2 gap-4">
                <button onclick="addToCartPage(${product.id})" class="flex items-center justify-center px-6 py-4 border border-brand-500 text-brand-500 rounded-xl font-bold hover:bg-brand-500/10 transition active:scale-95">
                    <i class="fa-solid fa-cart-plus mr-2"></i> Add to Cart
                </button>
                <button onclick="buyNowPage(${product.id})" class="flex items-center justify-center px-6 py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-500 shadow-lg shadow-brand-500/30 transition active:scale-95 transform hover:-translate-y-0.5">
                    Buy Now <i class="fa-solid fa-bolt ml-2"></i>
                </button>
           </div>`;


    // Final HTML Assembly
    const content = `
        <!-- Left: Image -->
        <div class="relative group">
            <div class="absolute inset-0 bg-brand-500/20 rounded-3xl blur-3xl group-hover:bg-brand-500/30 transition-all duration-500 -z-10"></div>
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 flex items-center justify-center border border-slate-700 h-full relative overflow-hidden">
                <!-- Background Decoration -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <img src="${product.image}" alt="${product.name}" class="w-full max-w-sm object-contain drop-shadow-2xl z-10 transform group-hover:scale-105 transition duration-500">
                
                <div class="absolute top-6 right-6 z-20">
                    ${badgeHtml}
                </div>
            </div>
        </div>

        <!-- Right: Info -->
        <div class="flex flex-col h-full animate-fade-in" style="animation-delay: 100ms;">
            <div class="mb-1">
                <span class="text-brand-400 font-bold tracking-wider text-xs uppercase bg-brand-500/10 px-3 py-1 rounded-full">${product.category}</span>
            </div>
            
            <h1 class="text-3xl md:text-5xl font-bold text-white mb-4 mt-4 leading-tight">${product.name}</h1>
            
            <p class="text-slate-400 text-base leading-relaxed mb-8">${product.desc}</p>
            
            ${featuresHtml}
            ${instructionsHtml}
            
            <div class="mt-auto bg-slate-950/50 rounded-2xl p-6 border border-slate-800 backdrop-blur-sm">
                ${variantSectionHtml}
                
                <div class="flex items-end justify-between mb-8">
                     ${priceSectionHtml}
                     <!-- Rating Summary (Small) -->
                     <div class="text-right">
                         <div class="text-yellow-500 text-sm mb-1"><i class="fa-solid fa-star"></i> <i class="fa-solid fa-star"></i> <i class="fa-solid fa-star"></i> <i class="fa-solid fa-star"></i> <i class="fa-solid fa-star"></i></div>
                         <p class="text-slate-500 text-xs text-right">Instant Delivery</p>
                     </div>
                </div>

                ${buttonsHtml}
            </div>
        </div>
    `;

    container.innerHTML = content;

    // Load Reviews
    document.getElementById('reviews-section').classList.remove('hidden');
    loadReviews(id);
}

// --- Helper Functions for Details Page ---
function updatePagePrice(id) {
    const product = products.find(p => p.id === id);
    const select = document.getElementById('page-variant-select');
    if (!product || !select) return;

    const index = select.value;
    const variant = product.variants[index];

    document.getElementById('page-display-price').innerText = `৳${variant.price}`;

    // Update Buy/Add handlers with Variant Index?
    // The base buttons pass ID. logic needs to check select value.
}

function addToCartPage(id) {
    const select = document.getElementById('page-variant-select');
    const variantIndex = select ? select.value : 0;
    addToCart(id, variantIndex); // Ensure addToCart supports index
}

function buyNowPage(id) {
    const select = document.getElementById('page-variant-select');
    let variantIndex = select ? select.value : 0;
    // Overloaded logic: buyNow in script usually takes just ID and defaults to 0 or manual select?
    // Let's modify buyNow to accept variant in global script OR call openCheckout directly.

    // Direct logic:
    const product = products.find(p => p.id === id);
    if (!product) return;

    let item = { ...product, quantity: 1 }; // Clone
    if (product.variants && product.variants.length > 0) {
        const v = product.variants[variantIndex];
        item.price = v.price;
        item.variant = v.label;
        item.variantName = v.label;
        item.originalPrice = v.originalPrice;
    } else {
        item.variant = 'Standard';
        item.variantName = 'Standard';
    }

    localStorage.setItem('tentionfree_buyNow', JSON.stringify(item));
    window.location.href = 'checkout.html';
}

function submitReviewPage() {
    // Wrapper for verify
    // Reuse window.submitReview logic but update ID references? 
    // Actually window.submitReview relies on `currentProductReviewId` global.
    // Ensure `loadProductDetailsPage` sets it?
    // loadReviews(id) sets `currentProductReviewId`. So it should work if called.

    // However, existing submitReview reads from 'review-name/comment' IDs which match page IDs.
    // So calling global submitReview should work.
    window.submitReview();
}


// --- Functions ---

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const normalizedQuery = searchQuery.toLowerCase().trim();

    const filtered = products.filter(p => {
        const matchesCategory = currentFilter === 'all' || p.category === currentFilter;
        const matchesSearch = !normalizedQuery ||
            p.name.toLowerCase().includes(normalizedQuery) ||
            p.desc.toLowerCase().includes(normalizedQuery) ||
            p.longDesc.toLowerCase().includes(normalizedQuery) ||
            p.category.toLowerCase().includes(normalizedQuery);

        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fa-solid fa-magnifying-glass text-4xl text-gray-600"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">No products found</h3>
                <p class="text-gray-400">We couldn't find anything matching "${searchQuery}"</p>
                <button onclick="clearSearch()" class="mt-6 text-brand-400 hover:text-white transition font-medium">Clear Search</button>
            </div>
        `;
        return;
    }

    filtered.forEach((product, index) => {
        const card = document.createElement('div');
        card.style.animationDelay = `${index * 100}ms`;
        card.className = 'glass-card rounded-2xl overflow-hidden product-card flex flex-col animate-[fadeIn_0.5s_ease-out_forwards]';

        // Stock Logic
        const isOutOfStock = product.inStock === false;
        const opacityClass = isOutOfStock ? 'opacity-70 grayscale-[0.5]' : '';
        const badgeHtml = isOutOfStock
            ? `<span class="absolute top-2 left-2 md:top-3 md:left-3 bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-lg z-20">Out of Stock</span>`
            : `<span id="badge-${product.id}" class="absolute top-2 left-2 md:top-3 md:left-3 bg-brand-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wide shadow-lg z-20">${product.badge ? product.badge : Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) + '% OFF'}</span>`;

        const buyButtonHtml = isOutOfStock
            ? `<button class="z-10 bg-gray-700 text-gray-400 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium border border-gray-600 cursor-not-allowed">Out of Stock</button>`
            : `<button onclick="buyNow(${product.id})" class="z-10 bg-white/5 hover:bg-brand-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all border border-white/10 hover:border-brand-400">Buy Now</button>`;

        const addCartAction = isOutOfStock ? '' : `onclick="addToCart(${product.id})"`;
        const addCartCursor = isOutOfStock ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-brand-500 hover:text-white';

        // Variant Selector HTML
        let variantSelectorHtml = '';
        if (product.variants && product.variants.length > 0) {
            variantSelectorHtml = `
                <div class="mb-3">
                    <select id="variant-select-${product.id}" onchange="updateCardPrice(${product.id})" onclick="event.stopPropagation()"
                        class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 cursor-pointer hover:bg-white/10 transition-colors" ${isOutOfStock ? 'disabled' : ''}>
                        ${product.variants.map((v, i) => `<option value="${i}" class="bg-gray-900">${v.label}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        card.className = opacityClass;
        card.className = opacityClass;

        // Variant Logic
        let variantHtml = '';
        if (product.variants && product.variants.length > 0) {
            variantHtml = `
                <select id="variant-select-${product.id}" onclick="event.stopPropagation()" onchange="updateCardPrice(${product.id})" class="card-select">
                    ${product.variants.map((v, i) => `<option value="${i}">${v.label}</option>`).join('')}
                </select>
            `;
        }

        card.innerHTML = `
            <div class="product-card-modern group" onclick="openDetails(${product.id})">
                <div class="card-image-container">
                    <img src="${product.image}" loading="lazy" class="card-image" alt="${product.name}" onerror="this.onerror=null;this.src='https://img.icons8.com/fluency/96/image.png';">
                    ${badgeHtml ? `<div id="badge-${product.id}" class="card-badge bg-gradient-to-r from-brand-600 to-brand-400 border-none shadow-lg shadow-brand-500/20">${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF</div>` : ''}
                </div>
                <div class="card-content">
                    <span class="card-category text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">${product.category}</span>
                    <h3 class="card-title text-sm font-bold text-white mb-2 truncate">${product.name}</h3>
                    
                    ${variantHtml}

                    <div class="flex items-center justify-between mt-2">
                        <div class="flex flex-col">
                            <span id="price-original-${product.id}" class="text-[10px] text-slate-500 line-through">৳${product.originalPrice}</span>
                            <span id="price-current-${product.id}" class="text-base font-bold text-white">৳${product.price}</span>
                        </div>
                    </div>

                    <div class="action-row">
                        ${!isOutOfStock ? `
                            <button onclick="event.stopPropagation(); buyNow(${product.id}, 'card')" class="btn-buy-now">
                                Buy Now
                            </button>
                            <button onclick="event.stopPropagation(); addToCart(${product.id}, true, 'card')" class="btn-add-cart" title="Add to Cart">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        ` : `
                            <button class="w-full bg-slate-800 text-slate-500 text-xs py-2 rounded-lg cursor-not-allowed border border-slate-700">Stock Out</button>
                        `}
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateCardPrice(id) {
    const product = products.find(p => p.id === id);
    const select = document.getElementById(`variant-select-${id}`);
    const index = select.value;
    const variant = product.variants[index];

    document.getElementById(`price-current-${id}`).innerText = `৳${variant.price}`;
    document.getElementById(`price-original-${id}`).innerText = `৳${variant.originalPrice}`;

    const discount = Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
    document.getElementById(`badge-${id}`).innerText = `${discount}% OFF`;
}

function filterProducts(category) {
    currentFilter = category;
    // Reset search query when changing category to avoid empty results
    if (searchQuery) {
        searchQuery = '';
        const inputs = document.querySelectorAll('.search-input, .search-input-lg, #search-input, #mobile-search-input');
        inputs.forEach(i => i.value = '');
    }
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.innerText.toLowerCase() === category || (category === 'all' && btn.innerText === 'All')) {
            btn.className = 'filter-btn active bg-brand-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-brand-500/30 whitespace-nowrap';
        } else {
            btn.className = 'filter-btn bg-transparent text-gray-400 hover:text-white hover:bg-white/5 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap';
        }
    });
    renderProducts();
}

// Unified Search Initialization
function initSearch() {
    // 1. Check URL params for initial input population
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');

    // Desktop Search
    setupSearchInput('search-input', q);

    // Mobile Search (Sidebar)
    setupSearchInput('mobile-search-input', q);

    // Mobile Search Overlay (New)
    setupSearchInput('mobile-search-overlay-input', q);

    // Large Home Search
    const homeInput = document.querySelector('.search-input-lg');
    if (homeInput && !homeInput.id) homeInput.id = 'home-search-input';
    if (homeInput) setupSearchInput(homeInput.id, q);

    // REMOVED: immediate renderProducts(). Logic moved to handleUrlParams() after fetch.
}

function initGlobalSearch() {
    // For pages without grid, we still want the preview dropdown
    // Desktop Search
    setupSearchInput('search-input');

    // Mobile Search (Sidebar)
    setupSearchInput('mobile-search-input');

    // Mobile Search Overlay (New)
    setupSearchInput('mobile-search-overlay-input');

    // Home search
    const homeInput = document.querySelector('.search-input-lg');
    if (homeInput) {
        if (!homeInput.id) homeInput.id = 'home-search-input';
        setupSearchInput(homeInput.id);
    }
}

function initCheckoutPage() {
    // 1. Determine Mode & Items
    const buyNowData = localStorage.getItem('tentionfree_buyNow');

    // --- AUTO FILL USER DATA ---
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user) {
                const nameInput = document.getElementById('name');
                const phoneInput = document.getElementById('phone');
                const emailInput = document.getElementById('customer_email');

                if (nameInput && user.name) nameInput.value = user.name;
                // Prefer phone from user object, but sometimes it is stored as 'mobile' or 'phoneNumber'
                if (phoneInput && (user.phone || user.mobile || user.phoneNumber)) {
                    phoneInput.value = user.phone || user.mobile || user.phoneNumber;
                }
                if (emailInput && user.email) {
                    emailInput.value = user.email;
                    // Optional: Make email readonly if logged in to prevent mismatch?
                    // emailInput.readOnly = true; 
                    // emailInput.classList.add('opacity-50', 'cursor-not-allowed');
                }
            }
        }
    } catch (e) {
        console.error("Error auto-filling user data:", e);
    }

    if (buyNowData) {
        isBuyNowMode = true;
        buyNowItem = JSON.parse(buyNowData);
    } else {
        isBuyNowMode = false;
        buyNowItem = null;
    }

    const itemsToCheckout = isBuyNowMode ? [buyNowItem] : cart;

    // 2. Redirect if empty
    if (itemsToCheckout.length === 0) {
        window.location.href = 'products';
        return;
    }

    // 3. Populate Order Summary
    const summaryContainer = document.getElementById('checkout-items-summary');
    if (summaryContainer) {
        summaryContainer.innerHTML = '';
        let total = 0;
        itemsToCheckout.forEach(item => {
            total += item.price * item.quantity;
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center text-sm text-slate-300 border-b border-slate-700/50 pb-3 last:border-0 last:pb-0';
            div.innerHTML = `
                <div class="flex items-center">
                    <img src="${item.image}" class="w-10 h-10 object-contain mr-3 rounded-lg bg-slate-800 p-1">
                    <div>
                        <p class="font-medium text-white">${item.name}</p>
                        <p class="text-xs text-slate-500">x${item.quantity}</p>
                    </div>
                </div>
                <span class="font-bold text-white">৳${item.price * item.quantity}</span>
            `;
            summaryContainer.appendChild(div);
        });

        if (document.getElementById('checkout-total-amount')) {
            document.getElementById('checkout-total-amount').innerText = '৳' + total.toFixed(2);
        }
    }

    // --- FREE ORDER CHECK ---
    // Calculate total explicitly
    let currentTotal = 0;
    itemsToCheckout.forEach(item => currentTotal += Number(item.price) * Number(item.quantity));

    if (currentTotal <= 0) {
        // 1. Set Hidden Flag
        const freeInput = document.getElementById('is-free-order');
        if (freeInput) freeInput.value = "true";

        // 2. Hide Payment Method Toggle
        const methodToggle = document.getElementById('payment-method-toggle');
        if (methodToggle) methodToggle.classList.add('hidden');

        // 3. Hide Payment Details Section (bKash/Transaction ID)
        const detailsSection = document.getElementById('payment-details-section');
        if (detailsSection) detailsSection.classList.add('hidden');

        // 4. Hide Confirmation Section (Pay Later options)
        const confirmSection = document.getElementById('confirmation-method-section');
        if (confirmSection) confirmSection.classList.add('hidden');

        // 5. Update Submit Button Text
        const submitBtnSpan = document.querySelector('button[type="submit"] span');
        if (submitBtnSpan) submitBtnSpan.innerText = "Get for Free";
    }

    // 4. Populate Dynamic Custom Fields
    const customFieldsContainer = document.getElementById('game-uid-field');

    if (customFieldsContainer) {
        customFieldsContainer.innerHTML = '';
        let hasCustomFields = false;

        itemsToCheckout.forEach(item => {
            if (item.customFields && Array.isArray(item.customFields) && item.customFields.length > 0) {
                hasCustomFields = true;

                // Add Product Header if multiple items?
                if (itemsToCheckout.length > 1) {
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
                        // text, number, email
                        inputHtml = `<input type="${type}" id="${fieldId}" 
                            data-label="${field.label}" data-item-name="${item.name}" data-required="${field.required}" data-type="${type}"
                            class="${baseClass}" placeholder="${field.placeholder || ''}">`;
                    }

                    // --- MAPPING LOGIC START ---
                    // If label maps to global fields, hide global and sync
                    const labelLower = field.label.toLowerCase();
                    let targetGlobalId = null;

                    if (labelLower.includes('name') && !labelLower.includes('game') && !labelLower.includes('user')) targetGlobalId = 'name';
                    else if (labelLower.includes('phone') || labelLower.includes('mobile') || labelLower.includes('number')) targetGlobalId = 'phone';
                    else if ((labelLower.includes('email') || labelLower.includes('mail')) && !labelLower.includes('game')) targetGlobalId = 'customer_email';

                    if (targetGlobalId) {
                        // Hide the Global Field's Container (approximate traversal)
                        const globalInput = document.getElementById(targetGlobalId);
                        if (globalInput) {
                            const container = globalInput.closest('div');
                            if (container) container.classList.add('hidden');

                            // Sync Event
                            setTimeout(() => {
                                const customInput = document.getElementById(fieldId);
                                if (customInput) {
                                    customInput.addEventListener('input', () => {
                                        globalInput.value = customInput.value;
                                    });
                                    // Initial Sync (e.g. if prefilled)
                                    globalInput.value = customInput.value;
                                    if (globalInput.value) customInput.value = globalInput.value; // Bi-directional prefill check
                                }
                            }, 100);
                        }
                    }
                    // --- MAPPING LOGIC END ---

                    wrapper.innerHTML = `
                        <label class="block text-xs font-bold text-brand-500 mb-1 uppercase tracking-wide">
                            ${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                        </label>
                        ${inputHtml}
                    `;
                    customFieldsContainer.appendChild(wrapper);
                });
            } else {
                // FALLBACK: Legacy Game UID Logic
                const lowerName = item.name.toLowerCase();
                const lowerCat = (item.category || '').toLowerCase();

                // Aggressive check: if name has these keywords, it IS a game.
                let isGaming = lowerCat.includes('game') || lowerCat.includes('gaming') ||
                    lowerName.includes('pubg') || lowerName.includes('free') ||
                    lowerName.includes('topup') || lowerName.includes('uc') ||
                    lowerName.includes('diamond');

                if (isGaming && (!item.customFields || item.customFields.length === 0)) {
                    hasCustomFields = true;

                    // Add Header if multiple items (Consistency with Custom Fields block)
                    if (itemsToCheckout.length > 1) {
                        const header = document.createElement('div');
                        header.className = "text-sm font-bold text-gray-400 mt-2 border-b border-gray-700 pb-1 mb-2";
                        header.innerText = item.name;
                        customFieldsContainer.appendChild(header);
                    }

                    const wrapper = document.createElement('div');
                    let labelText = item.name + " Player ID / UID";
                    let placeholder = "Enter Player ID";

                    if (lowerName.includes('pubg')) {
                        labelText = "PUBG UID / Player ID";
                        placeholder = "Enter PUBG UID";
                    }
                    else if (lowerName.includes('free fire') || lowerName.includes('freefire')) {
                        labelText = "Freefire UID / Player ID";
                        placeholder = "Enter Freefire UID";
                    }

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

        if (hasCustomFields) {
            customFieldsContainer.classList.remove('hidden');
        } else {
            customFieldsContainer.classList.add('hidden');
        }
    }

    // 5. Pre-fill User Info (if logged in)
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (document.getElementById('name')) document.getElementById('name').value = user.name || '';
            if (document.getElementById('phone')) document.getElementById('phone').value = user.phone || '';
            if (document.getElementById('customer_email')) document.getElementById('customer_email').value = user.email || '';
        } catch (e) {
            console.error("Error parsing user info", e);
        }
    }

    // 6. Init Payment Info UI
    updatePaymentInfo();
}

function setupSearchInput(inputId, initialValue = '') {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (initialValue && document.getElementById('product-grid')) {
        input.value = initialValue;
    }

    // Create Suggestions Container
    const wrapper = input.parentElement;
    if (!wrapper.querySelector('.search-suggestions')) {
        const suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions custom-scrollbar';
        suggestions.id = `${inputId}-suggestions`;
        wrapper.appendChild(suggestions);
    }

    // Events
    input.addEventListener('input', (e) => {
        const query = e.target.value;
        searchQuery = query; // Update global state

        // Reset category filter when searching to search ALL products
        if (query.trim().length > 0 && currentFilter !== 'all') {
            currentFilter = 'all';
            // Update UI buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                if (btn.innerText === 'All') {
                    btn.className = 'filter-btn active bg-brand-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-brand-500/30 whitespace-nowrap';
                } else {
                    btn.className = 'filter-btn bg-transparent text-gray-400 hover:text-white hover:bg-white/5 px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap';
                }
            });
        }

        // If on products page, filter grid immediately
        if (document.getElementById('product-grid')) {
            renderProducts();
        }

        // Show suggestions
        showSuggestions(query, `${inputId}-suggestions`);
    });

    input.addEventListener('focus', (e) => {
        if (e.target.value.trim().length > 0) {
            showSuggestions(e.target.value, `${inputId}-suggestions`);
        }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            const suggestions = document.getElementById(`${inputId}-suggestions`);
            if (suggestions) {
                suggestions.classList.remove('show');
            }
        }
    });
}

function showSuggestions(query, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!query || query.trim().length === 0) {
        container.classList.remove('show');
        return;
    }

    const normalizedQuery = query.toLowerCase().trim();
    const matches = products.filter(p =>
        p.name.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery)
    ).slice(0, 5); // Limit to top 5

    if (matches.length === 0) {
        container.classList.remove('show');
        return;
    }

    container.innerHTML = matches.map(product => `
        <div class="suggestion-item" onclick="navigateToProduct(${product.id})">
            <img src="${product.image}" class="suggestion-image" alt="${product.name}"
                 onerror="this.onerror=null;this.src='https://img.icons8.com/fluency/96/image.png';">
            <div class="suggestion-content">
                <div class="suggestion-title">${product.name}</div>
                <div class="suggestion-meta">
                    <span class="uppercase text-[10px] font-bold text-brand-400 tracking-wider">${product.category}</span>
                    <i class="fa-solid fa-circle text-[3px] text-gray-600"></i>
                    <span class="suggestion-price">৳${product.price}</span>
                </div>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
        </div>
    `).join('');

    container.classList.add('show');
}


function navigateToProduct(id) {
    // Redirect with ID for robust handling (SSR)
    window.location.href = `product/${id}`;
}

function clearSearch() {
    searchQuery = '';
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => input.value = ''); // Clear all search inputs

    // Reset URL
    const url = new URL(window.location);
    url.searchParams.delete('q');
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);

    renderProducts();
}


// --- Product Details Modal Logic ---

function openDetails(id) {
    // Open in separate NEW TAB (to prevent closing main list and satisfy 'alada page')
    window.open(`product/${id}`, '_blank');
}

function closeDetails() {
    document.getElementById('product-details-modal').classList.add('hidden');
}

// --- How to Order Modal Logic ---
function openHowToModal() {
    // Close mobile menu if open
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.add('hidden');
    document.getElementById('howto-modal').classList.remove('hidden');
}

function closeHowToModal() {
    document.getElementById('howto-modal').classList.add('hidden');
}

// Helper to create a cart item object from product ID and source
function createCartItem(id, source = 'card') {
    const product = products.find(p => p.id === id);
    if (!product) return null;

    if (product.inStock === false) {
        showToast("Item is Out of Stock");
        return null;
    }

    let finalPrice = product.price;
    let finalName = product.name;
    let cartId = product.id.toString();

    // Logic to find correct selector based on source
    let selectorId = `variant-select-${id}`; // Default card selector
    if (source === 'modal') {
        selectorId = 'modal-variant-select';
    } else if (source === 'page') {
        selectorId = 'page-variant-select';
    }

    const select = document.getElementById(selectorId);

    // Only use the value if the selector exists
    if (select) {
        const index = select.value;
        const variant = product.variants[index];
        if (variant) {
            finalPrice = variant.price;
            finalName = `${product.name} - ${variant.label}`;
            cartId = `${product.id}-${index}`;
        }
    }

    return {
        cartId: cartId,
        id: product.id,
        name: finalName,
        price: finalPrice,
        image: product.image,
        category: product.category,
        quantity: 1,
        customFields: product.customFields // Pass custom fields to cart item
    };
}

// Updated addToCart to use createCartItem
function addToCart(id, showToastMsg = true, source = 'card') {
    const newItem = createCartItem(id, source);
    if (!newItem) return;

    const existing = cart.find(item => item.cartId === newItem.cartId);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push(newItem);
    }

    saveCart();
    updateCartCount();
    renderCartItems();

    if (showToastMsg) {
        showToast("Item Added to Cart");
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('tentionfree_cart', JSON.stringify(cart));
}

// New Buy Now Function (Separated Logic)
function buyNow(id, source = 'card') {
    const item = createCartItem(id, source);
    if (item) {
        localStorage.setItem('tentionfree_buyNow', JSON.stringify(item));
        window.location.href = 'checkout';
    }
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerHTML = `<i class="fa-solid fa-check-circle mr-2"></i> ${message}`;
    toast.className = "show";
    setTimeout(function () { toast.className = toast.className.replace("show", ""); }, 3000);
}

function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    saveCart();
    updateCartCount();
    renderCartItems();
}

function updateQuantity(cartId, change) {
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(cartId);
        } else {
            saveCart();
            renderCartItems();
            updateCartCount();
        }
    }
}

function updateCartCount() {
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
        if (document.getElementById('checkout-total-amount')) {
            document.getElementById('checkout-total-amount').innerText = '৳0.00';
        }
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const li = document.createElement('li');
        li.className = 'flex py-4 border-b border-white/5 last:border-0 animate-[fadeIn_0.3s_ease-out]';
        // Note: passing string cartId needs quotes
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
    if (document.getElementById('checkout-total-amount')) {
        document.getElementById('checkout-total-amount').innerText = '৳' + total.toFixed(2);
    }
}

function openCheckout(buyNowMode = false) {
    if (!buyNowMode) {
        localStorage.removeItem('tentionfree_buyNow');
    }
    // Check if distinct checkout page is needed or if we are already there
    if (!window.location.pathname.includes('checkout')) {
        window.location.href = 'checkout';
    } else {
        window.location.reload();
    }
}

function closeCheckout() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.add('hidden');

    // Reset mode
    isBuyNowMode = false;
    buyNowItem = null;
}

// Toggle Payment Fields
function togglePaymentSection() {
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
    const detailsSection = document.getElementById('payment-details-section');
    // Robust Selection: Try ID first, then fallback to finding by text (in case index.html not updated)
    let confirmationSection = document.getElementById('confirmation-method-section');

    if (!confirmationSection) {
        // Fallback: Find the label with "Confirm Order Via" and get its parent div
        const labels = document.getElementsByTagName('label');
        for (let i = 0; i < labels.length; i++) {
            if (labels[i].innerText.includes('Confirm Order Via')) {
                confirmationSection = labels[i].parentElement; // The div containing the label and the options
                break;
            }
        }
    }

    if (paymentType === 'now') {
        // Pay Now: SHOW Payment Details (Method/TrxID), HIDE Confirmation Method (WhatsApp/Email)
        detailsSection.classList.remove('hidden', 'opacity-50', 'pointer-events-none');
        updatePaymentInfo(); // Force update instructions
        if (confirmationSection) confirmationSection.classList.add('hidden');
    } else {
        // Pay Later: HIDE Payment Details, SHOW Confirmation Method
        detailsSection.classList.add('hidden', 'opacity-50', 'pointer-events-none');
        if (confirmationSection) confirmationSection.classList.remove('hidden');
    }
}

// --- HOME PAGE SPECIFIC RENDER ---
function renderHomeProducts() {
    const grid = document.getElementById('home-product-grid');
    if (!grid) return;

    if (!products || products.length === 0) {
        // Fallback: If products empty, show message after distinct clear, NOT loading forever
        grid.innerHTML = `
            <div class="col-span-full text-center py-10">
                <p class="text-slate-500 text-sm">No products available at the moment.</p>
            </div>
        `;
        return;
    }

    // Filter products with viewInIndex === true
    // Also include default popular ones as fallback if none selected?
    // User requested "aita theke product on korle sodo on kkora product gola index e dekha jabe" 
    // -> ONLY enabled products.

    // Explicitly check for true, or string "true" just in case.
    const featured = products.filter(p => p.viewInIndex === true || p.viewInIndex === "true");

    if (featured.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-10">
                <p class="text-slate-500 text-sm">No featured products selected.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';

    featured.forEach((product, index) => {
        const card = document.createElement('div');
        // Use same styling as products page card
        card.style.animationDelay = `${index * 100}ms`;
        card.className = 'glass-card rounded-2xl overflow-hidden product-card flex flex-col animate-[fadeIn_0.5s_ease-out_forwards]';

        const isOutOfStock = product.stock === false || product.stock === "false";
        const opacityClass = isOutOfStock ? 'opacity-70 grayscale' : '';

        // Stock Logic
        const badgeHtml = isOutOfStock
            ? `<span class="absolute top-2 left-2 md:top-3 md:left-3 bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-lg z-20">Out of Stock</span>`
            : `<span id="h-badge-${product.id}" class="absolute top-2 left-2 md:top-3 md:left-3 bg-brand-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wide shadow-lg z-20">${product.badge ? product.badge : Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) + '% OFF'}</span>`;

        const buyButtonHtml = isOutOfStock
            ? `<button class="z-10 bg-gray-700 text-gray-400 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium border border-gray-600 cursor-not-allowed">Out of Stock</button>`
            : `<button onclick="buyNow(${product.id})" class="z-10 bg-white/5 hover:bg-brand-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all border border-white/10 hover:border-brand-400">Buy Now</button>`;

        const addCartAction = isOutOfStock ? '' : `onclick="addToCart(${product.id})"`;
        const addCartCursor = isOutOfStock ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-brand-500 hover:text-white';

        // Variant Selector HTML (Scoped to home grid to avoid ID collision)
        let variantSelectorHtml = '';
        if (product.variants && product.variants.length > 0) {
            variantSelectorHtml = `
            <div class="mb-2 md:mb-3">
                <select id="h-variant-select-${product.id}" onchange="updateCardPriceHome(${product.id})"
                    class="w-full bg-dark-bg border border-white/10 rounded-lg text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 text-gray-300 focus:outline-none focus:border-brand-500 transition-colors cursor-pointer appearance-none hover:bg-white/5">
                    ${product.variants.map((v, i) => `<option value="${i}">${v.label}</option>`).join('')}
                </select>
            </div>`;
        }

        card.innerHTML = `
            <div class="h-32 md:h-48 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center relative overflow-hidden p-4 md:p-8 group cursor-pointer ${opacityClass}" onclick="openDetails(${product.id})">
                <img src="${product.image}" alt="${product.name}" loading="lazy" width="200" height="200"
                    class="h-full max-w-full object-contain drop-shadow-2xl transform group-hover:scale-110 transition duration-500 aspect-square"
                    onerror="this.onerror=null;this.src='https://img.icons8.com/fluency/96/image.png';">
                ${badgeHtml}
                
                <div class="absolute bottom-1 left-1 md:hidden z-10">
                    <button onclick="event.stopPropagation(); openDetails(${product.id})" class="bg-black/60 text-white text-[9px] px-2 py-1 rounded backdrop-blur-md border border-white/10 flex items-center shadow-lg">
                        <i class="fa-regular fa-eye mr-1"></i> View
                    </button>
                </div>
            </div>
            <div class="p-3 md:p-5 flex-1 flex flex-col relative ${opacityClass}">
                <div class="absolute top-2 right-2 md:top-4 md:right-4 bg-dark-bg/90 backdrop-blur border border-white/10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10 ${addCartCursor}" ${addCartAction} aria-label="Add to Cart">
                    <i class="fa-solid fa-plus text-xs md:text-base"></i>
                </div>
                
                <div class="text-[9px] md:text-[10px] text-brand-400 font-bold uppercase tracking-widest mb-1 md:mb-2 mt-0.5">${product.category}</div>
                <h3 class="text-sm md:text-lg font-bold text-white mb-1 leading-tight pr-8 md:pr-12 cursor-pointer hover:text-brand-400 transition" onclick="openDetails(${product.id})">${product.name}</h3>
                <p class="text-gray-400 text-[10px] md:text-xs mb-2 md:mb-3 flex-1 line-clamp-2">${product.desc}</p>
                
                ${variantSelectorHtml}

                <div class="flex items-center justify-between mt-auto pt-3 md:pt-4 border-t border-white/5">
                    <div class="flex flex-col">
                        <span id="h-price-original-${product.id}" class="text-[10px] md:text-xs text-gray-500 line-through">৳${product.originalPrice}</span>
                        <span id="h-price-current-${product.id}" class="text-base md:text-xl font-bold text-white">৳${product.price}</span>
                    </div>
                    ${buyButtonHtml}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateCardPriceHome(id) {
    const product = products.find(p => p.id === id);
    const select = document.getElementById(`h-variant-select-${id}`);
    if (!select) return;
    const index = select.value;
    const variant = product.variants[index];

    document.getElementById(`h-price-current-${id}`).innerText = `৳${variant.price}`;
    document.getElementById(`h-price-original-${id}`).innerText = `৳${variant.originalPrice}`;

    const discount = Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
    const badge = document.getElementById(`h-badge-${id}`);
    if (badge) badge.innerText = `${discount}% OFF`;
}

function updatePaymentInfo() {
    const method = document.getElementById('payment').value;
    const instructionBox = document.getElementById('payment-instruction');

    const instructions = {
        bkash: `
            <div class="space-y-2">
                <p class="text-brand-400 font-bold border-b border-white/10 pb-1 mb-2">📱 1. bKash Payment (USSD Method)</p>
                <ul class="list-disc list-inside text-gray-300 space-y-1">
                    <li>Dial <span class="text-white font-mono">*247#</span></li>
                    <li>Select <span class="text-white font-bold">Send Money</span></li>
                    <li class="flex items-center flex-wrap gap-2">
                        Enter Number: <span class="text-white font-mono font-bold">01869895549</span>
                        <button type="button" onclick="copyToClipboard('01869895549')" class="text-[10px] bg-white/10 hover:bg-brand-500 text-white px-2 py-0.5 rounded transition">Copy</button>
                    </li>
                    <li>Enter Amount</li>
                    <li>Enter Reference (optional)</li>
                    <li>Confirm with PIN</li>
                </ul>
            </div>`,
        nagad: `
            <div class="space-y-2">
                <p class="text-orange-400 font-bold border-b border-white/10 pb-1 mb-2">📱 2. Nagad Payment (USSD Method)</p>
                <ul class="list-disc list-inside text-gray-300 space-y-1">
                    <li>Dial <span class="text-white font-mono">*167#</span></li>
                    <li>Select <span class="text-white font-bold">Send Money</span></li>
                    <li class="flex items-center flex-wrap gap-2">
                        Enter Number: <span class="text-white font-mono font-bold">01869895549</span>
                        <button type="button" onclick="copyToClipboard('01869895549')" class="text-[10px] bg-white/10 hover:bg-brand-500 text-white px-2 py-0.5 rounded transition">Copy</button>
                    </li>
                    <li>Enter Amount</li>
                    <li>Enter Reference</li>
                    <li>Confirm with PIN</li>
                </ul>
            </div>`,
        rocket: `
            <div class="space-y-2">
                <p class="text-purple-400 font-bold border-b border-white/10 pb-1 mb-2">📱 3. Rocket Payment (DBBL)</p>
                <ul class="list-disc list-inside text-gray-300 space-y-1">
                    <li>Dial <span class="text-white font-mono">*322#</span></li>
                    <li>Select <span class="text-white font-bold">Send Money</span></li>
                    <li class="flex items-center flex-wrap gap-2">
                        Enter Number: <span class="text-white font-mono font-bold">01869895549</span>
                        <button type="button" onclick="copyToClipboard('01869895549')" class="text-[10px] bg-white/10 hover:bg-brand-500 text-white px-2 py-0.5 rounded transition">Copy</button>
                    </li>
                    <li>Enter Amount</li>
                    <li>Enter Reference</li>
                    <li>Confirm with PIN</li>
                </ul>
            </div>`,
        upay: `
            <div class="space-y-2">
                <p class="text-blue-400 font-bold border-b border-white/10 pb-1 mb-2">📱 4. Upay Payment</p>
                <ul class="list-disc list-inside text-gray-300 space-y-1">
                    <li>Dial <span class="text-white font-mono">*268#</span></li>
                    <li>Select <span class="text-white font-bold">Send Money</span></li>
                    <li class="flex items-center flex-wrap gap-2">
                        Enter Number: <span class="text-white font-mono font-bold">01869895549</span>
                        <button type="button" onclick="copyToClipboard('01869895549')" class="text-[10px] bg-white/10 hover:bg-brand-500 text-white px-2 py-0.5 rounded transition">Copy</button>
                    </li>
                    <li>Enter Amount</li>
                    <li>Confirm with PIN</li>
                </ul>
                </ul>
            </div>`,
        binance: `
            <div class="space-y-2">
                <p class="text-yellow-400 font-bold border-b border-white/10 pb-1 mb-2">💰 5. Binance USDT (Crypto)</p>
                <div class="bg-white/5 p-2 rounded border border-white/10 mb-2 flex justify-between items-center">
                    <span class="text-gray-400 text-xs">Binance UID:</span>
                    <div class="flex items-center gap-2">
                         <span class="text-white font-mono font-bold">577126624</span>
                         <button type="button" onclick="copyToClipboard('577126624')" class="text-[10px] bg-brand-600 hover:bg-brand-500 text-white px-2 py-0.5 rounded transition">Copy</button>
                    </div>
                </div>
                <ul class="list-decimal list-inside text-gray-300 text-xs space-y-1">
                    <li>Open Binance App</li>
                    <li>Go to Pay / Send</li>
                    <li>Select USDT</li>
                    <li>Enter UID & Amount</li>
                </ul>
            </div>`
    };

    instructionBox.innerHTML = instructions[method] || '<p class="text-gray-400">Select a payment method.</p>';

    // --- PRICE CONVERSION LOGIC ---
    calculateAndDisplayTotal();
}

function prefillCheckout() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (document.getElementById('name')) document.getElementById('name').value = user.name || '';
            if (document.getElementById('phone')) document.getElementById('phone').value = user.mobile || '';
            if (document.getElementById('customer_email')) document.getElementById('customer_email').value = user.email || '';
        } catch (e) { console.error("Error parsing user data", e); }
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers or non-secure contexts if needed, 
        // but modern browsers support this well.
        // Simple fallback:
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        textArea.remove();
        showToast("Copied to clipboard!");
    });
}

function openPaymentModal() {
    document.getElementById('payment-modal').classList.remove('hidden');
}

// --- Payment Proof Logic ---
function previewProof(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            document.getElementById('proof-preview').src = e.target.result;
            document.getElementById('proof-preview').classList.remove('hidden');
            document.getElementById('proof-upload-ui').classList.add('hidden');
            document.getElementById('remove-proof-btn').classList.remove('hidden');
        }

        reader.readAsDataURL(input.files[0]);
    }
}

function clearProof() {
    const input = document.getElementById('payment-proof');
    input.value = "";
    document.getElementById('proof-preview').src = "";
    document.getElementById('proof-preview').classList.add('hidden');
    document.getElementById('proof-upload-ui').classList.remove('hidden');
    document.getElementById('remove-proof-btn').classList.add('hidden');
}

function closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('hidden');
}

// --- Custom File Upload Preview ---
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
    } else {
        textSpan.innerText = input.placeholder || 'Upload Image';
        previewImg.classList.add('hidden');
    }
}

// --- 5. CHECKOUT PAGE LOGIC ---

function initCheckoutPage() {
    console.log("Init Checkout Page");

    renderCheckoutItems();
    togglePaymentSection();
    prefillCheckout();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ref')) {
        document.getElementById('promo-code-input').value = urlParams.get('ref');
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
    let isBuyNow = false;

    if (buyNowData) {
        items = [JSON.parse(buyNowData)];
        isBuyNow = true;
    } else {
        items = JSON.parse(localStorage.getItem('tentionfree_cart')) || JSON.parse(localStorage.getItem('cart')) || [];
    }

    if (items.length === 0) {
        list.innerHTML = "<div class='text-slate-500 text-center py-4'>Cart is empty</div>";
        document.getElementById('checkout-total-amount').innerText = "৳0.00";
        return;
    }

    let total = 0;

    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        list.innerHTML += `
            <div class="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 rounded-md object-cover bg-slate-900">
                <div class="flex-1">
                    <h4 class="text-white text-sm font-bold line-clamp-1">${item.name}</h4>
                    <p class="text-slate-400 text-xs">${item.variantName || 'Standard'}</p>
                    <div class="flex justify-between items-center mt-1">
                        <span class="text-brand-500 text-xs font-bold">৳${item.price} x ${item.quantity}</span>
                        <span class="text-white text-xs font-bold">৳${itemTotal}</span>
                    </div>
                </div>
            </div>
        `;
    });

    const isFree = total === 0;
    const freeInput = document.getElementById('is-free-order');
    if (freeInput) freeInput.value = isFree;

    if (isFree) {
        const paymentToggle = document.getElementById('payment-method-toggle');
        if (paymentToggle) paymentToggle.classList.add('hidden');
    }

    // Initial Calc (also called by init)
    calculateAndDisplayTotal();
}

function calculateAndDisplayTotal() {
    // 1. Get Items
    let isBuyNowMode = false;
    let buyNowItem = null;
    const buyNowData = localStorage.getItem('tentionfree_buyNow');
    if (buyNowData) {
        isBuyNowMode = true;
        buyNowItem = JSON.parse(buyNowData);
    }
    const cart = JSON.parse(localStorage.getItem('tentionfree_cart')) || JSON.parse(localStorage.getItem('cart')) || [];
    const items = isBuyNowMode ? [buyNowItem] : cart;

    if (items.length === 0) {
        const totalEl = document.getElementById('checkout-total-amount');
        if (totalEl) totalEl.innerText = '৳0.00';
        return;
    }

    // 2. Base Total
    let totalBDT = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // 3. Coupon
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

    // 4. Payment Method & Display
    let method = 'bkash';
    const pType = document.querySelector('input[name="paymentType"]:checked');
    if (pType && pType.value === 'now') {
        const pSelect = document.getElementById('payment');
        if (pSelect) method = pSelect.value;
    } else {
        method = 'Pay Later';
    }

    const totalEl = document.getElementById('checkout-total-amount');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('discount-amount');

    if (discountRow && discountEl) {
        if (discount > 0) {
            discountRow.classList.remove('hidden');
            discountEl.innerText = '-৳' + discount.toFixed(2);
        } else {
            discountRow.classList.add('hidden');
        }
    }

    if (totalEl) {
        if (method === 'binance') {
            // Conversion: 100 BDT = 1 USD logic
            const totalUSD = finalBDT / 100;
            totalEl.innerText = '$' + totalUSD.toFixed(2);
            totalEl.classList.add('text-green-400');
            totalEl.classList.remove('text-brand-500');
        } else {
            totalEl.innerText = '৳' + finalBDT.toFixed(2);
            totalEl.classList.remove('text-green-400');
            totalEl.classList.add('text-brand-500');
        }
    }
}

// --- 6. COUPON LOGIC ---
let appliedCoupon = null;

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

    // Calculate Cart Total (BDT)
    let isBuyNowMode = false;
    let buyNowItem = null;
    const buyNowData = localStorage.getItem('tentionfree_buyNow');
    if (buyNowData) {
        isBuyNowMode = true;
        buyNowItem = JSON.parse(buyNowData);
    }
    const cart = JSON.parse(localStorage.getItem('tentionfree_cart')) || []; // Use correct key if needed, or stick to 'cart'
    // Previous code used 'cart' directly in submitOrder from localStorage.getItem('cart')? 
    // Wait, submitOrder uses 'cart', but initCheckout uses 'tentionfree_cart'??
    // Let's verify. submitOrder line 1839: JSON.parse(localStorage.getItem('cart')).
    // initCheckout line 1718: JSON.parse(localStorage.getItem('tentionfree_cart'))
    // There is inconsistency in the file! I should probably check both or fix it.
    // Given 'tentionfree_cart' seems to be the one used in init, I'll use it.
    // Actually, let's use what submitOrder uses to be safe, or check both.

    // Correction: In submitOrder (viewed code), it used `localStorage.getItem('cart')` at line 1839.
    // In initCheckout (viewed code), it used `localStorage.getItem('tentionfree_cart')` at line 1718.
    // This is a bug in the existing codebase! I should create a helper `getCart()` but for now I will try 'tentionfree_cart' first, then 'cart'.

    let cartItems = JSON.parse(localStorage.getItem('tentionfree_cart'));
    if (!cartItems || cartItems.length === 0) cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    const itemsToCheckout = isBuyNowMode ? [buyNowItem] : cartItems;
    let totalBDT = itemsToCheckout.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Get User for Limits
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? user.id : null;

    try {
        msgDiv.innerText = "Checking...";
        msgDiv.className = "text-xs mt-1 h-4 text-slate-400";

        const res = await fetch('/api/coupons/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, cartTotal: totalBDT, cartItems: itemsToCheckout, userId })
        });
        const data = await res.json();

        if (data.success) {
            appliedCoupon = { code: data.couponCode, discount: data.discount, type: data.type, value: data.value };

            msgDiv.innerText = "Coupon Applied!";
            msgDiv.className = "text-xs mt-1 h-4 text-green-500 animate-pulse";

            discountRow.classList.remove('hidden');
            discountAmountSpan.innerText = '-৳' + data.discount.toFixed(2);

            // Update Total UI
            const newTotal = totalBDT - data.discount;
            const totalEl = document.getElementById('checkout-total-amount');
            if (totalEl) totalEl.innerText = '৳' + (newTotal < 0 ? 0 : newTotal).toFixed(2);

            // Disable input
            codeInput.disabled = true;
            codeInput.classList.add('opacity-50', 'cursor-not-allowed');
            showToast("Coupon Applied Successfully!");
        } else {
            appliedCoupon = null;
            msgDiv.innerText = data.message;
            msgDiv.className = "text-xs mt-1 h-4 text-red-400";
            discountRow.classList.add('hidden');
            const totalEl = document.getElementById('checkout-total-amount');
            if (totalEl) totalEl.innerText = '৳' + totalBDT.toFixed(2);
        }
    } catch (err) {
        console.error(err);
        msgDiv.innerText = "Error verifying coupon";
        msgDiv.className = "text-xs mt-1 h-4 text-red-500";
    }
}

// --- Submit Order ---
// --- Submit Order ---
async function submitOrder(e) {
    console.log("Submit order function called");
    if (e) e.preventDefault();

    // --- 1. SETUP & BASIC DATA ---
    const customerName = document.getElementById('name').value.trim();
    const customerPhone = document.getElementById('phone').value.trim();
    const customerEmail = document.getElementById('customer_email').value.trim();

    if (!customerName || !customerPhone) {
        showErrorModal("Missing Information", "Please fill in your Name and Phone Number.");
        return;
    }

    // Determine Items
    let isBuyNowMode = false;
    let buyNowItem = null;
    const buyNowData = localStorage.getItem('tentionfree_buyNow');
    if (buyNowData) {
        isBuyNowMode = true;
        buyNowItem = JSON.parse(buyNowData);
    }
    const cart = JSON.parse(localStorage.getItem('tentionfree_cart')) || JSON.parse(localStorage.getItem('cart')) || [];
    const itemsToOrder = isBuyNowMode ? [buyNowItem] : cart;

    if (itemsToOrder.length === 0) {
        showErrorModal("Empty Cart", "Your cart is empty.");
        return;
    }

    // --- 2. PAYMENT & VALIDATION ---
    const paymentTypeInput = document.querySelector('input[name="paymentType"]:checked');
    if (!paymentTypeInput) {
        showErrorModal("Payment Required", "Please select a payment method.");
        return;
    }

    let paymentMethod = 'Pay Later';
    if (paymentTypeInput.value === 'now') {
        const sel = document.getElementById('payment');
        if (sel) paymentMethod = sel.value;
    }

    const freeOrderEl = document.getElementById('is-free-order');
    const isFreeOrder = freeOrderEl && freeOrderEl.value === 'true';

    // Login Check for Manual Payments
    const userStr = localStorage.getItem('user');
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !userStr) {
        showLoginRequiredModal();
        return;
    }

    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? user.id : 'guest_' + Date.now();

    // Logic for Transaction ID & Proof
    let trxid = "Pending";
    let paymentMethodShort = 'Pay Later';
    let proofBase64 = null;
    const proofInput = document.getElementById('payment-proof');

    if (isFreeOrder) {
        paymentMethodShort = "Free / Auto-Delivery";
        trxid = "FREE";
    } else if (['bkash', 'nagad', 'rocket', 'upay', 'binance'].includes(paymentMethod)) {
        trxid = document.getElementById('trxid').value.trim();
        const methodMap = {
            'bkash': 'Bkash', 'nagad': 'Nagad', 'rocket': 'Rocket',
            'upay': 'Upay', 'binance': 'Binance Pay'
        };
        paymentMethodShort = methodMap[paymentMethod] || paymentMethod;

        if (!trxid) return showErrorModal("Action Required", "Please enter Transaction ID.");

        if (!proofInput || !proofInput.files || !proofInput.files[0]) return showErrorModal("Proof Required", "Please upload payment proof.");

        // Check Duplicate
        try {
            const res = await fetch('api/orders?t=' + Date.now());
            const orders = await res.json();
            if (Array.isArray(orders) && orders.find(o => o.trx && o.trx.toLowerCase() === trxid.toLowerCase())) {
                return showErrorModal("Duplicate Transaction ID", "This TrxID is already used.");
            }
        } catch (err) { }

        proofBase64 = await readFileAsBase64(proofInput.files[0]);
    }

    // --- 3. CUSTOM FIELDS COLLECTION ---
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

    // Legacy Fields
    document.querySelectorAll('.dynamic-game-uid').forEach(input => {
        if (input.value.trim()) extraDetails += `\n[Legacy ID]: ${input.value.trim()}`;
    });

    // --- 4. CALCULATION & CURRENCY & COUPON (Re-use logic) ---
    // Recalculate everything same way as UI
    let totalBDT = itemsToOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountAmount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') discountAmount = (totalBDT * appliedCoupon.value) / 100;
        else discountAmount = appliedCoupon.value;
        if (discountAmount > totalBDT) discountAmount = totalBDT;
    }

    let finalBDT = totalBDT - discountAmount;
    let currency = 'BDT';
    let finalPrice = finalBDT;

    if (paymentMethod === 'binance') {
        currency = 'USD';
        finalPrice = finalBDT / 100;
    } else if (isFreeOrder) {
        finalPrice = 0;
    }

    // --- 5. SEND ---
    const orderData = {
        id: Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        userId: userId,
        customer: customerName,
        phone: customerPhone,
        email: customerEmail,
        gameUid: extraDetails.trim() || 'N/A', // Notes/Details
        product: itemsToOrder.map(i => `${i.name} (x${i.quantity})`).join(', '),
        price: finalPrice.toFixed(2),
        currency: currency,
        originalPriceBDT: totalBDT.toFixed(2),
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discount: discountAmount.toFixed(2),
        status: "Pending",
        paymentMethod: paymentMethodShort,
        trx: trxid,
        proof: proofBase64,
        items: itemsToOrder,
        plan: itemsToOrder.length > 1 ? 'Multiple Items' : (itemsToOrder[0].variantName || 'Standard')
    };

    fetch('api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.removeItem('cart');
                localStorage.removeItem('tentionfree_cart'); // Clear both
                localStorage.removeItem('tentionfree_buyNow');
                showSuccessModal();
            } else {
                showErrorModal("Submission Failed", data.message || "Unknown error.");
            }
        })
        .catch(err => {
            showErrorModal("Network Error", "Failed to submit order.");
        });
}



// Helper for Promisified File Reading
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// This function encapsulates the original order submission logic, now called by submitOrder
// --- Modals ---

function showSuccessModal() {
    // Force remove existing modal
    let existingModal = document.getElementById('order-success-modal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
    <div id="order-success-modal" class="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity animate-[fadeIn_0.3s_ease-out]">
        <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-white/10 relative overflow-hidden transform animate-[blob_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            
            <!-- Glow Effect -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -z-10"></div>

            <!-- Checkmark -->
            <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 mb-6 shadow-lg shadow-emerald-500/40 animate-pulse">
                <i class="fa-solid fa-check text-4xl text-white"></i>
            </div>
            
            <!-- Text -->
            <h3 class="text-3xl font-bold text-white mb-2 tracking-tight">Order Placed!</h3>
            <p class="text-slate-400 text-sm mb-8 leading-relaxed">Your order has been secured and confirmed.</p>
            
            <button onclick="window.location.href='index.html'" class="w-full group relative overflow-hidden bg-white/5 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl mb-4 transition-all border border-white/10 hover:border-emerald-400">
                <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span class="relative">Back to Home</span>
            </button>
            
            <!-- Timer -->
            <div class="flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>Redirecting in</span>
                <div class="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <span id="redirect-timer" class="font-bold text-emerald-400">3</span>
                </div>
                <span>seconds...</span>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('order-success-modal');

    // Countdown Timer (3s -> Close)
    let seconds = 3;
    const timerInfo = document.getElementById('redirect-timer');

    const interval = setInterval(() => {
        seconds--;
        if (timerInfo) timerInfo.innerText = seconds;
        if (seconds <= 0) {
            clearInterval(interval);
            // Redirect to Home Page
            window.location.href = '/';
        }
    }, 1000);
}

function showErrorModal(title, message) {
    let modal = document.getElementById('error-modal');
    if (modal) modal.remove();

    const modalHTML = `
    <div id="error-modal" class="fixed inset-0 z-[170] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity animate-[fadeIn_0.2s_ease-out]">
        <div class="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-red-500/20 relative overflow-hidden transform animate-[blob_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            
            <!-- Glow -->
            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-10"></div>

            <!-- Cross Icon -->
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 mb-6 shadow-lg shadow-red-500/30">
                <i class="fa-solid fa-xmark text-4xl text-white"></i>
            </div>
            
            <!-- Text -->
            <h3 class="text-2xl font-bold text-white mb-2 tracking-tight">${title}</h3>
            <p class="text-slate-400 text-sm mb-8 leading-relaxed px-2">${message}</p>
            
            <button onclick="document.getElementById('error-modal').remove()" class="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl transition-all border border-white/5 hover:border-white/20 active:scale-95">
                Close
            </button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ---------------------------------------------------
// --- AUTHENTICATION & UI UPDATES ---
// --- Login Required Modal ---
function showLoginRequiredModal() {
    let modal = document.getElementById('login-req-modal');
    if (modal) modal.remove();

    const modalHTML = `
    <div id="login-req-modal" class="fixed inset-0 z-[180] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity animate-[fadeIn_0.3s_ease-out]">
        <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-brand-500/20 relative overflow-hidden transform animate-[blob_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            
            <!-- Glow -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -z-10"></div>

            <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-brand-500/10 to-brand-600/20 mb-6 border border-brand-500/30 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                <i class="fa-solid fa-lock text-4xl text-brand-500 drop-shadow-lg"></i>
            </div>

            <h3 class="text-2xl font-bold text-white mb-3">Login Required</h3>
            <p class="text-slate-400 text-sm mb-8 leading-relaxed">
                Security Check: To use this payment method, you need to sign in to your account.
            </p>

            <div class="space-y-3">
                <a href="login.html" class="flex items-center justify-center w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 transform hover:-translate-y-0.5 group">
                    <span>Login or Register</span>
                    <i class="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                </a>
                <button onclick="document.getElementById('login-req-modal').remove()" class="w-full bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 font-medium py-3 rounded-xl transition-all border border-transparent hover:border-slate-600">
                    Cancel
                </button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    prefillCheckout();
});

function updateNavbar() {
    const userStr = localStorage.getItem('user');
    // Select ALL login buttons (Desktop & Mobile)
    const loginButtons = document.querySelectorAll('nav a[href="login"], nav a[href="login.html"]');

    if (userStr) {
        const user = JSON.parse(userStr);
        const name = user.name.split(' ')[0];

        // Update buttons based on context (Desktop vs Mobile)
        loginButtons.forEach(btn => {
            btn.href = 'profile.html';

            // Check if it's the desktop top-bar button (has md:flex)
            if (btn.classList.contains('md:flex')) {
                // Desktop Style (Pill)
                btn.className = "hidden md:flex items-center gap-2 bg-brand-500/20 text-brand-400 px-4 py-2 rounded-full font-bold hover:bg-brand-500 hover:text-white transition-all border border-brand-500/30 ml-4";
                btn.innerHTML = `<i class="fa-solid fa-user-circle"></i> <span>${name}</span>`;
            } else {
                // Mobile Menu Style (List Item)
                btn.innerHTML = `<i class="fa-solid fa-user-circle mr-2"></i> ${name}`;
                btn.classList.remove('text-slate-300');
                btn.classList.add('text-brand-400', 'font-bold');
            }
        });
    }
}


function prefillCheckout() {
    // 1. Immediate Prefill (for Checkout Page or if Modal is open)
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            console.log("Prefilling checkout for:", user.name);

            // Helper to fill if empty
            const fill = (id, val) => {
                const el = document.getElementById(id);
                if (el && !el.value && val) el.value = val;
            };

            fill('name', user.name);
            fill('phone', user.phone || user.mobile || user.phoneNumber);
            fill('customer_email', user.email);
        } catch (e) {
            console.error("Error parsing user data for prefill:", e);
        }
    }

    // 2. Shim openCheckout (for Modal - ensures fill happens after modal opens)
    // Avoid double-shimming
    if (!window.isCheckoutShimmed) {
        const originalOpen = window.openCheckout;
        window.openCheckout = function (product, variantIndex = 0) {
            // Call original logic
            if (originalOpen) originalOpen(product, variantIndex);

            // Attempt prefill after a delay (animation time)
            setTimeout(prefillCheckout, 200);
        };
        window.isCheckoutShimmed = true;
    }
}


// --- Mobile Search Overlay ---
function toggleMobileSearch() {
    const modal = document.getElementById('mobile-search-modal');
    if (!modal) return;

    const isHidden = modal.classList.contains('hidden');
    if (isHidden) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // Auto focus input
        setTimeout(() => {
            const input = document.getElementById('mobile-search-overlay-input');
            if (input) input.focus();
        }, 100);
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function handleMobileSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
            // Check if we are on products.html
            if (window.location.pathname.includes('products.html')) {
                // If on products page, just update search query and filter
                searchQuery = query;
                // Update other inputs
                document.querySelectorAll('.search-input, .search-input-lg, #search-input, #mobile-search-input').forEach(i => i.value = query);

                toggleMobileSearch(); // Close modal

                // Trigger search/filter
                if (typeof renderProducts === 'function') {
                    // Update filter buttons if needed (reset to All)
                    if (currentFilter !== 'all') {
                        currentFilter = 'all';
                        document.querySelectorAll('.filter-btn').forEach(btn => {
                            if (btn.innerText === 'All') btn.classList.add('active', 'bg-brand-500', 'text-white');
                            else btn.classList.remove('active', 'bg-brand-500', 'text-white');
                        });
                    }
                    renderProducts();
                }
            } else {
                // Redirect to products.html
                window.location.href = `products.html?q=${encodeURIComponent(query)}`;
            }
        }
    }
}

// --- INJECT MODAL STYLES (Animations) ---
function ensureModalStyles() {
    if (document.getElementById('modal-animations')) return;

    const style = document.createElement('style');
    style.id = 'modal-animations';
    style.innerHTML = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes blob {
            0% { transform: scale(0.95); opacity: 0; }
            40% { transform: scale(1.02); }
            100% { transform: scale(1); opacity: 1; }
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
    `;
    document.head.appendChild(style);
}

// Ensure styles are loaded
document.addEventListener('DOMContentLoaded', ensureModalStyles);
// Also call immediately in case DOM is already ready (dynamic load)
ensureModalStyles();

// --- Reviews Logic ---
let currentProductReviewId = null;

window.toggleReviewForm = function () {
    const form = document.getElementById('review-form-container');
    if (form) form.classList.toggle('hidden');
}

window.loadReviews = async function (productId) {
    currentProductReviewId = productId;

    // Support both Modal and Page containers
    const list = document.getElementById('modal-reviews-list') || document.getElementById('page-reviews-list');
    const summary = document.getElementById('modal-rating-summary') || document.getElementById('page-rating-summary');

    if (!list) return;

    list.innerHTML = '<p class="text-xs text-slate-500 italic">Loading...</p>';

    try {
        const res = await fetch(`/api/reviews/${productId}`);
        const reviews = await res.json();

        // Calculate Average
        let avgStr = '';
        if (reviews.length > 0) {
            const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
            avgStr = `(${avg.toFixed(1)} <i class="fa-solid fa-star text-[10px]"></i>) • ${reviews.length} Reviews`;
        }

        if (summary) summary.innerHTML = avgStr;

        if (reviews.length === 0) {
            list.innerHTML = '<p class="text-xs text-slate-500 italic">No reviews yet. Be the first!</p>';
            return;
        }

        list.innerHTML = reviews.reverse().map(r => `
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700 mb-3">
                <div class="flex justify-between items-start">
                    <span class="text-sm font-bold text-slate-200">${r.userName || r.name || 'User'}</span>
                    <span class="text-[10px] text-yellow-500">${'★'.repeat(r.rating)}</span>
                </div>
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">${r.comment}</p>
                <div class="flex justify-between mt-2">
                     <span class="text-[9px] text-slate-600">${new Date(r.date).toLocaleDateString()}</span>
                     <span class="text-[9px] text-green-500"><i class="fa-solid fa-check-circle"></i> Verified Purchase</span>
                </div>
                ${r.reply ? `
                    <div class="mt-3 ml-2 pl-3 border-l-2 border-brand-500 bg-brand-500/5 p-2 rounded-r-lg">
                        <div class="text-[10px] font-bold text-brand-400 mb-1">
                            <i class="fa-solid fa-reply mr-1"></i> TentionFree Response
                        </div>
                        <p class="text-xs text-slate-400 italic">"${r.reply}"</p>
                    </div>
                ` : ''}
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        list.innerHTML = '<p class="text-xs text-red-500">Failed to load reviews.</p>';
    }
}

window.submitReview = async function () {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        showLoginRequiredModal(); // Use existing modal if available, or just toast
        return;
    }
    const user = JSON.parse(userStr);

    // Auto-fill name if empty but user exists (though UI has input, maybe we force user.name or allow alias?)
    // User wants "must login".
    // Let's rely on the input for display name, but ensure we have a user.

    const name = document.getElementById('review-name').value || user.name;
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;

    if (!rating) {
        showToast('Please select a rating', 'error');
        return;
    }

    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken') // Send token
            },
            body: JSON.stringify({
                productId: currentProductReviewId,
                userName: name,
                rating: rating,
                comment: comment,
                userId: user.id // Send ID too
            })
        });

        const data = await res.json();
        if (data.success) {
            showToast('Review submitted!');
            document.getElementById('review-comment').value = ''; // clear comment
            toggleReviewForm();
            loadReviews(currentProductReviewId);
        } else {
            showToast(data.error || 'Failed', 'error');
        }
    } catch (err) {
        showToast('Error submitting review', 'error');
    }
}

// --- 7. UTILITIES & MODALS ---



function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}


window.showToast = function (message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-none';
        document.body.appendChild(toast);
    }

    // Reset classes
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center transition-all duration-300 transform translate-y-10 opacity-0';

    // Icon based on type
    const icon = type === 'error' ? '<i class="fa-solid fa-circle-xmark mr-2 text-red-500"></i>' : '<i class="fa-solid fa-check-circle mr-2 text-green-500"></i>';
    toast.innerHTML = icon + `<span>${message}</span>`;

    if (type === 'error') {
        toast.classList.add('border', 'border-red-500/50');
    } else {
        toast.classList.add('border', 'border-green-500/50');
    }

    // Show
    setTimeout(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    }, 10);

    // Hide after 3s
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
    }, 3000);
}

// --- PRODUCT DETAILS PAGE LOGIC ---

window.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the product details page (either via cleaner URL or direct HTML file)
    if (window.location.pathname.includes('product-details.html') || window.location.pathname.includes('/product/')) {
        loadProductDetailsPage();
    }
});

// --- NEW FUNCTION: Load Product Details Page (Premium Design) ---
async function loadProductDetailsPage() {
    console.log("Loading Product Details Page...");
    const params = new URLSearchParams(window.location.search);
    let id = params.get('id');

    // SSR Fallback
    if (!id) {
        const parts = window.location.pathname.split('/');
        const lastPart = parts.pop() || parts.pop();
        id = lastPart;
    }

    if (!id) return;

    // Normalize
    const numericId = parseInt(id);
    const searchId = isNaN(numericId) ? id.toLowerCase() : numericId;

    if (!products || products.length === 0) {
        await fetchProducts();
    }

    const product = products.find(p => {
        if (p.id == searchId) return true;
        if (p.name && p.name.toLowerCase().replace(/ /g, '-') === searchId) return true;
        const cleanName = p.name ? p.name.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase() : '';
        const nameSlug = cleanName.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return nameSlug === searchId;
    });

    const container = document.getElementById('product-details-container');
    if (!product) {
        container.innerHTML = `
            <div class="col-span-full text-center py-32">
                <div class="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <i class="fa-solid fa-triangle-exclamation text-4xl text-red-500"></i>
                </div>
                <h2 class="text-3xl font-bold text-white mb-2">Product Not Found</h2>
                <p class="text-slate-400 mb-8">The product you are looking for might have been removed.</p>
                <a href="products.html" class="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-bold transition-all shadow-lg shadow-brand-500/30">
                    <i class="fa-solid fa-arrow-left"></i> Back to Shop
                </a>
            </div>`;
        return;
    }

    // Update Meta
    document.title = `${product.name} - Tention Free`;
    const crumb = document.getElementById('page-product-name-crumb');
    if (crumb) crumb.innerText = product.name;

    // Set Global ID for Reviews
    window.currentProductId = product.id;

    const isOutOfStock = product.inStock === false;

    // Determine Badge
    const discountPercent = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const badgeHtml = isOutOfStock
        ? `<span class="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-red-500/10"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>`
        : `<span class="inline-flex items-center gap-1.5 bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-brand-500/30"><i class="fa-solid fa-tag"></i> ${product.badge || discountPercent + '% OFF'}</span>`;

    // Features List
    const featuresHtml = product.features
        ? `<div class="mb-8 p-6 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
            <h4 class="text-slate-200 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide opacity-80">
                <i class="fa-solid fa-star text-brand-500"></i> Key Features
            </h4>
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${product.features.map(f => `
                    <li class="flex items-start text-slate-300 group">
                        <div class="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center mr-3 mt-0.5 group-hover:bg-brand-500/20 transition-colors">
                            <i class="fa-solid fa-check text-brand-500 text-[10px]"></i>
                        </div>
                        <span class="text-sm leading-relaxed group-hover:text-slate-100 transition-colors">${f}</span>
                    </li>`).join('')}
            </ul>
           </div>`
        : '';

    // Instructions
    const instructionsHtml = product.instructions
        ? `<div class="bg-blue-900/10 rounded-2xl p-6 border border-blue-500/10 mb-8 backdrop-blur-sm relative overflow-hidden group">
                <div class="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                <h4 class="text-blue-200 font-bold mb-3 flex items-center">
                    <i class="fa-solid fa-circle-info text-blue-500 mr-2 text-xl shadow-blue-500/50"></i> How to Receive
                </h4>
                <div class="text-sm text-slate-300 leading-relaxed space-y-2 relative z-10">
                    ${product.instructions.split('\n').map(line => `<p>${line}</p>`).join('')}
                </div>
           </div>`
        : '';

    // Variants Logic
    let variantSectionHtml = '';
    let priceSectionHtml = '';
    let displayPrice = product.price;
    let displayOrgPrice = product.originalPrice;

    if (product.variants && product.variants.length > 0) {
        const options = product.variants.map((v, i) => `<option value="${i}">${v.label} - ৳${v.price}</option>`).join('');
        variantSectionHtml = `
            <div class="mb-8">
                <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Select Package</label>
                <div class="relative group">
                    <div class="absolute -inset-0.5 bg-gradient-to-r from-brand-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                    <select id="page-variant-select" onchange="updatePagePrice(${product.id})" 
                        class="relative w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white appearance-none focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer text-base font-medium shadow-xl">
                        ${options}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-slate-400">
                        <i class="fa-solid fa-chevron-down text-sm group-hover:text-brand-400 transition-colors"></i>
                    </div>
                </div>
            </div>
        `;
        const v0 = product.variants[0];
        displayPrice = v0.price;
        displayOrgPrice = v0.originalPrice;
    }

    priceSectionHtml = `
        <div class="flex flex-col">
             <span class="text-sm text-slate-500 line-through mb-1 font-medium" id="page-display-org-price">৳${displayOrgPrice}</span>
             <div class="flex items-baseline gap-1">
                <span class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight" id="page-display-price">৳${displayPrice}</span>
             </div>
        </div>
    `;

    // Buttons
    const buttonsHtml = isOutOfStock
        ? `<button class="w-full bg-slate-800 text-slate-500 font-bold py-4 rounded-xl cursor-not-allowed border border-slate-700 flex items-center justify-center gap-2">
            <i class="fa-solid fa-ban"></i> Out of Stock
           </button>`
        : `<div class="grid grid-cols-2 gap-4 mt-2">
                <button onclick="addToCartPage(${product.id})" class="flex items-center justify-center px-6 py-4 border border-brand-500/50 text-brand-400 bg-brand-500/5 rounded-xl font-bold hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all active:scale-95 group">
                    <i class="fa-solid fa-cart-plus mr-2 group-hover:rotate-12 transition-transform"></i> Add to Cart
                </button>
                <button onclick="buyNowPage(${product.id})" class="relative flex items-center justify-center px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:brightness-110 overflow-hidden group">
                    <span class="absolute w-64 h-64 bg-white/20 rounded-full blur-3xl -top-10 -left-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span class="relative flex items-center">Buy Now <i class="fa-solid fa-bolt ml-2 animate-pulse"></i></span>
                </button>
           </div>`;

    // Final HTML Assembly
    const content = `
        <!-- Left: Image Section -->
        <div class="relative group h-full">
            <div class="absolute inset-0 bg-brand-500/10 rounded-[2rem] blur-3xl group-hover:bg-brand-500/20 transition-all duration-700 -z-10"></div>
            
            <div class="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 flex items-center justify-center border border-white/5 h-full relative overflow-hidden shadow-2xl">
                <!-- Background Decorations -->
                <div class="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                
                <img src="${product.image}" alt="${product.name}" class="relative w-full max-w-sm object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 transform group-hover:scale-105 transition duration-700 ease-out">
                
                <div class="absolute top-6 left-6 z-20">
                    ${badgeHtml}
                </div>
            </div>
        </div>

        <!-- Right: Info Section -->
        <div class="flex flex-col h-full animate-fade-in pl-0 md:pl-8 py-4" style="animation-delay: 100ms;">
            <div class="mb-2 flex items-center gap-3">
                <span class="text-brand-400 font-bold tracking-widest text-[10px] uppercase bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full">${product.category}</span>
                <div class="h-px bg-slate-800 flex-1"></div>
            </div>
            
            <h1 class="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">${product.name}</h1>
            
            <p class="text-slate-400 text-lg leading-relaxed mb-8 font-light border-l-2 border-slate-700 pl-4">${product.longDesc || product.desc}</p>
            
            ${featuresHtml}
            ${instructionsHtml}
            
            <!-- Sticky/Prominent Action Area -->
            <div class="mt-auto bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-slate-700/50 shadow-2xl relative overflow-hidden">
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
    const reviewSection = document.getElementById('reviews-section');
    if (reviewSection) reviewSection.classList.remove('hidden');
    loadReviews(product.id);
}

// --- Helper Functions for Details Page ---
function updatePagePrice(id) {
    const product = products.find(p => p.id === id);
    const select = document.getElementById('page-variant-select');
    if (!product || !select) return;

    const index = select.value;
    const variant = product.variants[index];

    document.getElementById('page-display-price').innerText = `৳${variant.price}`;
    if (variant.originalPrice) document.getElementById('page-display-org-price').innerText = `৳${variant.originalPrice}`;
}

function addToCartPage(id) {
    // Call main addToCart with 'page' source
    addToCart(id, true, 'page');
}

function buyNowPage(id) {
    // Call main buyNow with 'page' source
    buyNow(id, 'page');
}

// function submitReviewPage() removed (duplicate)

// --- 7. UTILITIES & MODALS ---

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}


// --- 8. REVIEWS & ERROR MODAL ---

// 8.1 Error Modal (Dynamic Injection)
// 8.1 Error Modal (Static Logic)
function showErrorModal(title, message) {
    const modal = document.getElementById('global-error-modal');
    if (modal) {
        document.getElementById('error-modal-title').innerText = title;
        document.getElementById('error-modal-message').innerText = message;
        modal.classList.remove('hidden');
    } else {
        alert(`${title}: ${message}`); // Fallback if HTML is missing
    }
}

function closeErrorModal() {
    const modal = document.getElementById('global-error-modal');
    if (modal) modal.classList.add('hidden');
}

function showSuccessModal() {
    const modal = document.getElementById('global-success-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeSuccessModal() {
    const modal = document.getElementById('global-success-modal');
    if (modal) modal.classList.add('hidden');
}

// 8.2 Load Reviews
async function loadReviews(productId) {
    const list = document.getElementById('page-reviews-list');
    const summary = document.getElementById('page-rating-summary');
    if (!list) return;

    list.innerHTML = '<div class="text-slate-500 text-center text-sm py-4">Loading reviews...</div>';

    try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        const reviews = data.reviews || [];

        // Calculate Average
        if (reviews.length > 0) {
            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            if (summary) summary.innerText = `(${avg.toFixed(1)}/5)`;
        } else {
            if (summary) summary.innerText = "(No reviews yet)";
        }

        if (reviews.length === 0) {
            list.innerHTML = '<div class="text-slate-500 text-center py-4 text-sm italic">Be the first to review this product!</div>';
            return;
        }

        list.innerHTML = reviews.map(r => `
            <div class="bg-slate-900 rounded-xl p-4 border border-slate-800/50">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h5 class="font-bold text-slate-200 text-sm">${r.userName || 'Anonymous'}</h5>
                        <div class="text-yellow-500 text-xs mt-0.5">
                            ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                        </div>
                    </div>
                    <span class="text-[10px] text-slate-500">${new Date(r.date).toLocaleDateString()}</span>
                </div>
                <p class="text-slate-400 text-sm leading-relaxed">${r.comment}</p>
            </div>
        `).join('');

    } catch (e) {
        console.error(e);
        list.innerHTML = '<div class="text-red-400 text-center text-sm py-2">Failed to load reviews.</div>';
    }
}

// 8.3 Submit Review
async function submitReview() {
    const name = document.getElementById('review-name').value.trim();
    const rating = parseInt(document.getElementById('review-rating').value);
    const comment = document.getElementById('review-comment').value.trim();

    // Strategy 1: Global Variable from loadProductDetailsPage
    let productId = window.currentProductId;

    // Strategy 2: URL Fallback
    if (!productId) {
        const path = window.location.pathname;
        const segments = path.split('/');
        if (segments.includes('product')) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('id')) productId = urlParams.get('id');
            else {
                const last = segments[segments.length - 1];
                if (!isNaN(last)) productId = last;
            }
        }
    }

    if (!productId) {
        // Strategy 3: Try finding from products list by slug
        const segments = window.location.pathname.split('/');
        const slug = segments[segments.length - 1];
        // We need 'products'
        if (typeof products !== 'undefined') {
            const p = products.find(prod => prod.id == slug || prod.slug == slug);
            if (p) productId = p.id;
        }
    }

    if (!productId) return showErrorModal("Global Error", "Product ID not found. Please refresh.");

    if (!rating) return showErrorModal("Invalid Rating", "Please select a rating.");
    if (!comment) return showErrorModal("Missing Comment", "Please write a comment.");

    const userStr = localStorage.getItem('user');
    if (!userStr) {
        // Just use ErrorModal to prompt login if generic modal fails
        if (window.showLoginRequiredModal) window.showLoginRequiredModal();
        else showErrorModal("Login Required", "You must be logged in to leave a review.");
        return;
    }
    const user = JSON.parse(userStr);

    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('userToken')
            },
            body: JSON.stringify({
                productId,
                rating,
                comment,
                userName: name || user.name || 'Anonymous'
            })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            console.log("Review submitted successfully");
            showSuccessModal();
            document.getElementById('page-review-form').classList.add('hidden');
            document.getElementById('review-comment').value = '';
            loadReviews(productId);
        } else {
            console.error("Review submission failed:", res.status, data);
            // Error Handling
            if (res.status === 403 || (data.message && data.message.toLowerCase().includes('purchase'))) {
                console.log("Triggering 403 Purchase Required Modal");
                showErrorModal("Verified Purchase Required", "You can only review products you have purchased.");
            } else {
                console.log("Triggering Generic Error Modal");
                showErrorModal("Review Failed", data.message || "Could not submit review.");
            }
        }
    } catch (e) {
        console.error(e);
        showErrorModal("Network Error", "Please check your connection.");
    }
}

// Expose to window
window.submitReview = submitReview;
window.loadReviews = loadReviews;
window.showErrorModal = showErrorModal;

// --- Page Specific Button Handlers ---
function addToCartPage(id) {
    addToCart(id, true, 'page');
}

function buyNowPage(id) {
    buyNow(id, 'page');
}

// Wrapper for Review Page
function submitReviewPage() {
    console.log("Submit Review Page Clicked");
    if (typeof submitReview === 'function') {
        submitReview();
    } else {
        console.error("submitReview function not found");
        showErrorModal("System Error", "Review function missing. Please refresh.");
    }
}

// Update Price on Page (Variant Change)
function updatePagePrice(id) {
    const product = products.find(p => p.id === id);
    const select = document.getElementById('page-variant-select');
    if (!select || !product) return;

    const index = select.value;
    const variant = product.variants[index];

    if (variant) {
        document.getElementById('page-display-price').innerText = `৳${variant.price}`;
        document.getElementById('page-display-org-price').innerText = `৳${variant.originalPrice}`;
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Payment Section on Checkout Page
    if (document.querySelector('input[name="paymentType"]')) {
        console.log("Initializing Checkout Payment Section...");
        togglePaymentSection();
    }

    // Initialize Home Page Products
    if (document.getElementById('home-product-grid')) {
        renderHomeProducts();
    }

    // Initialize Cart Badge
    updateCartCount();

    // Check Login State for UI
    checkLogin();
});

// --- Authentication & UI Logic ---
function checkLogin() {
    const user = localStorage.getItem('user');
    const dtLink = document.querySelector('a[href="login"]');
    const mbLink = document.getElementById('mobile-auth-link');

    if (user) {
        // Logged In
        if (dtLink) {
            dtLink.innerHTML = `
                <i class="fa-solid fa-user text-xl mr-2"></i>
                <span class="text-sm font-medium">Profile</span>
            `;
            dtLink.href = 'profile.html';
        }

        if (mbLink) {
            mbLink.innerHTML = `
                <i class="fa-solid fa-user mb-1 text-xl group-hover:scale-110 transition-transform"></i>
                <span class="text-[10px] font-medium">Profile</span>
            `;
            mbLink.href = 'profile.html';
            mbLink.classList.remove('text-slate-400');
            mbLink.classList.add('text-brand-500');
            mbLink.closest('a').classList.add('text-brand-500');
        }
    } else {
        // Guest
        if (dtLink) {
            dtLink.innerHTML = `
                 <i class="fa-solid fa-user text-xl mr-2"></i>
                 <span class="text-sm font-medium">Login</span>
            `;
            dtLink.href = 'login';
        }

        if (mbLink) {
            mbLink.innerHTML = `
                <i class="fa-solid fa-sign-in-alt mb-1 text-xl group-hover:scale-110 transition-transform"></i>
                <span class="text-[10px] font-medium">Login</span>
            `;
            mbLink.href = 'login';
            mbLink.classList.add('text-slate-400');
            mbLink.classList.remove('text-brand-500');
            mbLink.closest('a').classList.remove('text-brand-500');
        }
    }
}
