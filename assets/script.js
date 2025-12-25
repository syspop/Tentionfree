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
// --- Data ---
function createVariants(basePrice, baseOriginal) {
    return [
        { label: "1 Month", price: basePrice, originalPrice: baseOriginal },
        { label: "3 Months", price: basePrice * 3 * 0.95, originalPrice: baseOriginal * 3 }, // 5% off
        { label: "6 Months", price: basePrice * 6 * 0.90, originalPrice: baseOriginal * 6 }, // 10% off
        { label: "12 Months", price: basePrice * 12 * 0.85, originalPrice: baseOriginal * 12 } // 15% off
    ].map(v => ({ ...v, price: Math.round(v.price), originalPrice: Math.round(v.originalPrice) }));
}

// Default Products Data (used for seeding)
const defaultProducts = [
    {
        id: 1,
        name: "Netflix Premium (4K)",
        category: "streaming",
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
const API_URL = 'data/products.json';

async function fetchProducts() {
    try {
        const response = await fetch(API_URL);
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

async function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const qParam = urlParams.get('q');

    if (idParam) {
        // If ID is present, try to open that product details
        const id = parseInt(idParam);
        const product = products.find(p => p.id === id);
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

window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('loader-hidden');
        loader.addEventListener('transitionend', () => {
            if (loader.parentNode) {
                loader.parentNode.removeChild(loader);
            }
        });
    }
});

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
            ? `<span class="absolute top-2 right-2 md:top-3 md:right-3 bg-red-600 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-lg z-20">Out of Stock</span>`
            : `<span id="badge-${product.id}" class="absolute top-2 right-2 md:top-3 md:right-3 bg-brand-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md uppercase tracking-wide shadow-lg">${product.badge ? product.badge : Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) + '% OFF'}</span>`;

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

        card.innerHTML = `
            <div class="h-32 md:h-48 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center relative overflow-hidden p-4 md:p-8 group cursor-pointer ${opacityClass}" onclick="openDetails(${product.id})">
                <img src="${product.image}" alt="${product.name}" loading="lazy" width="200" height="200"
                    class="h-full max-w-full object-contain drop-shadow-2xl transform group-hover:scale-110 transition duration-500 aspect-square"
                    onerror="this.onerror=null;this.src='https://img.icons8.com/fluency/96/image.png';">
                ${badgeHtml}
                
                <!-- Desktop View Details Button (Hover) -->
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center hidden md:flex">
                    <button onclick="event.stopPropagation(); openDetails(${product.id})" class="text-xs font-bold text-white bg-white/20 hover:bg-brand-500 backdrop-blur-sm px-4 py-2 rounded-full flex items-center transition">
                        <i class="fa-regular fa-eye mr-2"></i> View Details
                    </button>
                </div>

                <!-- Mobile View Button (Always Visible) -->
                <div class="absolute bottom-1 left-1 md:hidden z-10">
                    <button onclick="event.stopPropagation(); openDetails(${product.id})" class="bg-black/60 text-white text-[9px] px-2 py-1 rounded backdrop-blur-md border border-white/10 flex items-center shadow-lg">
                        <i class="fa-regular fa-eye mr-1"></i> View
                    </button>
                </div>
            </div>
            <div class="p-3 md:p-5 flex-1 flex flex-col relative ${opacityClass}">
                <script type="application/ld+json">
                {
                  "@context": "https://schema.org/",
                  "@type": "Product",
                  "name": "${product.name}",
                  "image": "https://tentionfree.store/${product.image}",
                  "description": "${product.desc}",
                  "sku": "${product.id}",
                  "brand": {
                    "@type": "Brand",
                    "name": "Tention Free"
                  },
                  "offers": {
                    "@type": "Offer",
                    "url": "https://tentionfree.store/products",
                    "priceCurrency": "BDT",
                    "price": "${product.price}",
                    "availability": "${isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'}",
                    "itemCondition": "https://schema.org/NewCondition"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "5",
                    "bestRating": "5",
                    "ratingCount": "${Math.floor(Math.random() * (500 - 100 + 1)) + 100}"
                  }
                }
                </script>
                <div class="absolute top-2 right-2 md:top-4 md:right-4 bg-dark-bg/90 backdrop-blur border border-white/10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10 ${addCartCursor}" ${addCartAction} aria-label="Add to Cart">
                    <i class="fa-solid fa-plus text-xs md:text-base"></i>
                </div>
                
                <div class="text-[9px] md:text-[10px] text-brand-400 font-bold uppercase tracking-widest mb-1 md:mb-2 mt-0.5">${product.category}</div>
                <h3 class="text-sm md:text-lg font-bold text-white mb-1 leading-tight pr-8 md:pr-12 cursor-pointer hover:text-brand-400 transition" onclick="openDetails(${product.id})">${product.name}</h3>
                <p class="text-gray-400 text-[10px] md:text-xs mb-2 md:mb-3 flex-1 line-clamp-2">${product.desc}</p>
                
                ${variantSelectorHtml}

                <div class="flex items-center justify-between mt-auto pt-3 md:pt-4 border-t border-white/5">
                    <div class="flex flex-col">
                        <span id="price-original-${product.id}" class="text-[10px] md:text-xs text-gray-500 line-through">৳${product.originalPrice}</span>
                        <span id="price-current-${product.id}" class="text-base md:text-xl font-bold text-white">৳${product.price}</span>
                    </div>
                    ${buyButtonHtml}
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

    // 4. Populate Dynamic Game UIDs
    const gamingItems = itemsToCheckout.filter(item => item.category === 'gaming');
    const uidContainer = document.getElementById('game-uid-field');

    if (uidContainer) {
        uidContainer.innerHTML = '';
        if (gamingItems.length > 0) {
            uidContainer.classList.remove('hidden');
            gamingItems.forEach((item, index) => {
                const wrapper = document.createElement('div');
                let labelText = item.name + " ID";
                let placeholder = "Enter ID";
                const lowerName = item.name.toLowerCase();
                if (lowerName.includes('pubg')) {
                    labelText = "PUBG Player ID";
                    placeholder = "Enter PUBG ID";
                } else if (lowerName.includes('free fire') || lowerName.includes('freefire')) {
                    labelText = "FreeFire UID";
                    placeholder = "Enter FreeFire UID";
                }

                wrapper.innerHTML = `
                    <label class="block text-xs font-bold text-brand-500 mb-1 uppercase tracking-wide">${labelText}</label>
                    <input type="text" data-item-name="${item.name}" required
                        class="dynamic-game-uid w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-brand-500 transition-all placeholder-slate-500"
                        placeholder="${placeholder}">
                `;
                uidContainer.appendChild(wrapper);
            });
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
    // If we are on products page, just open modal
    if (document.getElementById('product-grid')) {
        openDetails(id);
        // Hide all suggestion boxes
        document.querySelectorAll('.search-suggestions').forEach(el => el.classList.remove('show'));
    } else {
        // Redirect with ID for robust handling
        window.location.href = `products.html?id=${id}`;
    }
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
    const product = products.find(p => p.id === id);
    if (!product) return;

    // Populate Modal Data
    document.getElementById('modal-img').src = product.image;
    document.getElementById('modal-img').alt = product.name; // SEO: Set alt text
    document.getElementById('modal-category').innerText = product.category;
    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-desc').innerText = product.longDesc || product.desc; // Fallback
    document.getElementById('modal-instructions').innerText = product.instructions || "Details will be provided after purchase.";

    // Stock check
    const isOutOfStock = product.inStock === false;
    const addBtn = document.getElementById('modal-add-btn');
    const buyBtn = document.getElementById('modal-buy-btn');

    if (isOutOfStock) {
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.innerHTML = '<i class="fa-solid fa-ban mr-2"></i> Out of Stock';
            addBtn.className = 'flex items-center justify-center px-4 py-3 border border-red-500 text-red-500 rounded-xl font-bold cursor-not-allowed';
            addBtn.onclick = null;
        }

        if (buyBtn) {
            buyBtn.disabled = true;
            buyBtn.innerText = 'Unavailable';
            buyBtn.className = 'flex items-center justify-center px-4 py-3 bg-gray-700 text-gray-400 rounded-xl font-bold cursor-not-allowed';
            buyBtn.onclick = null;
        }
    } else {
        if (addBtn) {
            addBtn.disabled = false;
            addBtn.innerHTML = '<i class="fa-solid fa-cart-plus mr-2"></i> Add to Cart';
            addBtn.className = 'flex items-center justify-center px-4 py-3 border border-brand-500 text-brand-600 rounded-xl font-bold hover:bg-brand-50 transition';
            addBtn.onclick = () => { addToCart(product.id, true, 'modal'); };
        }

        if (buyBtn) {
            buyBtn.disabled = false;
            buyBtn.innerText = 'Buy Now';
            buyBtn.className = 'flex items-center justify-center px-4 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition';
            buyBtn.onclick = () => { buyNow(product.id, 'modal'); closeDetails(); };
        }
    }

    // Features List
    const featureList = document.getElementById('modal-features');
    featureList.innerHTML = '';
    if (product.features) {
        product.features.forEach(f => {
            featureList.innerHTML += `<li class="flex items-start"><i class="fa-solid fa-check text-brand-500 mt-1 mr-2"></i> ${f}</li>`;
        });
    } else {
        featureList.innerHTML = '<li class="text-gray-500">No specific features listed.</li>';
    }

    // Variant Selector in Modal
    const variantContainer = document.getElementById('modal-variant-container');
    variantContainer.innerHTML = '';

    let price = product.price;
    let orgPrice = product.originalPrice;

    if (product.variants && product.variants.length > 0) {
        const select = document.createElement('select');
        select.id = 'modal-variant-select';
        select.className = 'w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 cursor-pointer';
        if (isOutOfStock) select.disabled = true;

        product.variants.forEach((v, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.className = 'bg-gray-900';
            option.text = `${v.label} - ৳${v.price}`;
            select.appendChild(option);
        });

        // Handle change inside modal
        select.onchange = function () {
            const v = product.variants[this.value];
            document.getElementById('modal-price').innerText = `৳${v.price}`;
            document.getElementById('modal-price-original').innerText = `৳${v.originalPrice}`;
        };

        variantContainer.appendChild(select);
        // Set initial values from first variant
        price = product.variants[0].price;
        orgPrice = product.variants[0].originalPrice;
    }

    document.getElementById('modal-price').innerText = `৳${price}`;
    document.getElementById('modal-price-original').innerText = `৳${orgPrice}`;

    // Show Modal
    document.getElementById('product-details-modal').classList.remove('hidden');
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

    // Logic to find correct selector based on source (card vs modal)
    let selectorId = `variant-select-${id}`; // Default card selector
    if (source === 'modal') {
        selectorId = 'modal-variant-select'; // Unique ID in modal
    }

    const select = document.getElementById(selectorId);

    // Only use the value if the selector exists AND belongs to this product context 
    // (For modal, it is rebuilt on open, so it's always for current product)
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
        quantity: 1
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
        if (confirmationSection) confirmationSection.classList.add('hidden');
    } else {
        // Pay Later: HIDE Payment Details, SHOW Confirmation Method
        detailsSection.classList.add('hidden', 'opacity-50', 'pointer-events-none');
        if (confirmationSection) confirmationSection.classList.remove('hidden');
    }
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
            </div>`,
        binance: `
            <div class="space-y-2">
                <p class="text-yellow-400 font-bold border-b border-white/10 pb-1 mb-2">💰 5. Binance USDT (Crypto)</p>
                <p class="text-gray-300 mb-2">You can send USDT directly using Binance.</p>
                <div class="flex items-center flex-wrap gap-2 mb-2">
                    <span class="text-gray-300">Binance UID:</span>
                    <span class="text-white font-mono font-bold">577126624</span>
                    <button type="button" onclick="copyToClipboard('577126624')" class="text-[10px] bg-white/10 hover:bg-brand-500 text-white px-2 py-0.5 rounded transition">Copy</button>
                </div>
                <p class="text-gray-400 text-xs font-bold mb-1">Steps:</p>
                <ul class="list-decimal list-inside text-gray-300 space-y-1 text-xs">
                    <li>Open Binance</li>
                    <li>Go to Send / Transfer</li>
                    <li>Choose USDT</li>
                    <li>Enter UID: <span class="text-white">577126624</span></li>
                    <li>Enter Amount</li>
                    <li>Confirm transfer</li>
                </ul>
            </div>`
    };

    instructionBox.innerHTML = instructions[method] || '<p class="text-gray-400">Select a payment method to see instructions.</p>';
    // --- PRICE CONVERSION LOGIC ---
    // Recalculate Total
    let isBuyNowMode = false;
    let buyNowItem = null;
    const buyNowData = localStorage.getItem('tentionfree_buyNow');
    if (buyNowData) {
        isBuyNowMode = true;
        buyNowItem = JSON.parse(buyNowData);
    }
    const cart = JSON.parse(localStorage.getItem('tentionfree_cart')) || [];
    const itemsToCheckout = isBuyNowMode ? [buyNowItem] : cart;

    let totalBDT = 0;
    itemsToCheckout.forEach(item => {
        totalBDT += item.price * item.quantity;
    });

    const totalElement = document.getElementById('checkout-total-amount');
    if (totalElement) {
        if (method === 'binance') {
            // Conversion: 100 BDT = 1 USD
            const totalUSD = totalBDT / 100;
            totalElement.innerText = '$' + totalUSD.toFixed(2);
            totalElement.classList.add('text-green-400'); // Optional: Change color for USD
            totalElement.classList.remove('text-brand-500');
        } else {
            // Revert to BDT
            totalElement.innerText = '৳' + totalBDT.toFixed(2);
            totalElement.classList.remove('text-green-400');
            totalElement.classList.add('text-brand-500');
        }
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

async function submitOrder() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const customerEmail = document.getElementById('customer_email').value;

    // Get Payment Type
    const paymentType = document.querySelector('input[name="paymentType"]:checked').value;

    let payment = "Pay Later";
    let trxid = "Pending";

    // Logic based on Payment Type
    if (paymentType === 'now') {
        // --- LOGIN REQUIREMENT FOR PAY NOW ---
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            showLoginRequiredModal();
            return;
        }

        payment = document.getElementById('payment').value;
        trxid = document.getElementById('trxid').value.trim();

        // Strict Validation for Pay Now
        if (!trxid) {
            showErrorModal("Action Required", "Please enter Transaction ID or switch to 'Pay Later'.");
            return;
        }
    }

    // Check for Dynamic Game UIDs
    const uidInputs = document.querySelectorAll('.dynamic-game-uid');
    let gameUidString = "";

    // Validate if any are missing
    let missingUid = false;

    if (uidInputs.length > 0) {
        const collectedIds = [];
        uidInputs.forEach(input => {
            if (!input.value.trim()) {
                missingUid = true;
            } else {
                collectedIds.push(`${input.getAttribute('data-item-name')}: ${input.value.trim()}`);
            }
        });
        gameUidString = collectedIds.join('\n');
    }

    if (missingUid) {
        showErrorModal("Game ID Required", "Please enter Player IDs for all gaming items.");
        return;
    }

    // Assign to legacy variable for compatibility if needed, or just use the new string
    const gameUid = gameUidString;

    const platform = document.querySelector('input[name="orderMethod"]:checked').value;

    // Basic Validation
    if (!name || !phone || !customerEmail) {
        showErrorModal("Missing Information", "Please fill in Name, Phone, and Email to continue.");
        return;
    }

    // Determine items based on mode
    const itemsToOrder = isBuyNowMode ? [buyNowItem] : cart;
    const hasGamingItem = itemsToOrder.some(item => item.category === 'gaming');

    // --- DUPLICATE TRANSACTION CHECK & PROOF VALIDATION ---
    let proofBase64 = null;

    if (paymentType === 'now') {
        // Validate Proof
        const fileInput = document.getElementById('payment-proof');
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            showErrorModal("Proof Required", "Please upload a screenshot of your payment.");
            return;
        }

        // Validate File Size (Max 5MB)
        if (fileInput.files[0].size > 5 * 1024 * 1024) {
            showErrorModal("File Too Large", "Please upload an image smaller than 5MB.");
            return;
        }

        // Convert to Base64
        try {
            const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
            proofBase64 = await toBase64(fileInput.files[0]);
        } catch (e) {
            console.error("File error", e);
            showErrorModal("File Error", "Failed to process image.");
            return;
        }

        try {
            const res = await fetch('api/orders?t=' + Date.now());
            const orders = await res.json();

            if (Array.isArray(orders)) {
                // Check if any order has the same TrxID (exclude Pay Later/Pending ones if necessary, but usually TrxID implies actual payment)
                // Normalize check: Case insensitive, trim
                const duplicate = orders.find(o => o.trx && o.trx.toLowerCase() === trxid.toLowerCase());

                if (duplicate) {
                    showErrorModal("Duplicate Transaction ID", "This Transaction ID has already been used. Please contact support if this is an error.");
                    return; // STOP execution
                }
            }
        } catch (err) {
            console.error("Error checking duplicates:", err);
            // Proceed with caution or block? Let's proceed but warn console.
        }
    }

    let total = 0;
    itemsToOrder.forEach(item => total += item.price * item.quantity);

    // --- CURRENCY CONVERSION (Binance = USD) ---
    let currency = 'BDT';
    let finalTotal = total;
    let paymentMethodShort = 'Pay Later';

    // Determine detailed payment method name
    if (paymentType === 'now') {
        const pVal = document.getElementById('payment').value;
        if (pVal === 'binance') {
            paymentMethodShort = 'Binance Pay';
            currency = 'USD';
            finalTotal = total / 100; // 100 BDT = 1 USD
        } else {
            paymentMethodShort = pVal.charAt(0).toUpperCase() + pVal.slice(1);
        }
    }

    // --- Save Order to Server (Node API) ---
    const orderData = {
        id: Date.now(),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        customer: name,
        phone: phone,
        email: customerEmail,
        gameUid: gameUid || 'N/A',
        product: itemsToOrder.map(i => `${i.name} (x${i.quantity})`).join(', '),
        price: finalTotal.toFixed(2), // Store converted price
        currency: currency, // Store Currency
        originalPriceBDT: total, // Store original if needed
        status: "Pending",
        paymentMethod: paymentMethodShort,
        trx: trxid,
        proof: proofBase64,
        items: itemsToOrder // Save full items for invoice
    };
    plan: itemsToOrder.length > 1 ? 'Multiple Items' : (itemsToOrder[0].variantName || 'Standard'),
        price: total,
            status: 'Pending',
                trx: trxid || 'Pay Later',
                    paymentMethod: paymentType === 'later' ? 'Pay Later' : payment,
                        items: itemsToOrder, // Use itemsToOrder to capture Buy Now items too
                            proof: proofBase64 // Add proof image
};

// Send to Node Server
fetch('api/orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
})
    .then(async response => {
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            throw new Error("Server Error: " + text.substring(0, 100));
        }

        if (!response.ok || (data && data.success === false)) {
            const msg = data.message || data.error || "Unknown server error";
            throw new Error(msg);
        }
        return data;
    })
    .then(data => {
        console.log("Order saved:", data);

        // Handle Buy Now vs Cart cleanup
        if (isBuyNowMode) {
            localStorage.removeItem('tentionfree_buyNow');
            buyNowItem = null;
        } else {
            // Clear Cart ONLY if it was a cart order
            cart = [];
            saveCart();
            updateCartCount();
            if (document.getElementById('cart-sidebar')) renderCartItems();
        }

        // Close Checkout Modal (Safe check)
        closeCheckout();
        closePaymentModal();

        // Handle Redirection / Success Message based on Payment Type
        if (paymentType === 'now') {
            showSuccessModal();
        } else {
            // Pay Later: Redirect to WhatsApp/Email
            // Construct Message JUST IN TIME
            let message = `*🔥 New Order - Tention Free*\n\n`;
            message += `👤 *Customer:* ${name}\n`;
            message += `📱 *Phone:* ${phone}\n`;
            message += `📧 *Email:* ${customerEmail}\n`;
            if (hasGamingItem && gameUid) {
                message += `🎮 *Game UID:* ${gameUid}\n`;
            }

            // Message format depending on payment
            if (paymentType === 'later') {
                message += `💳 *Payment Status:* Pay Later (Discussion Pending)\n`;
            } else {
                message += `💳 *Payment:* ${payment.toUpperCase()}\n`;
                message += `🧾 *TrxID:* ${trxid}\n`;
            }

            message += `\n🛒 *Items:*\n`;
            itemsToOrder.forEach(item => {
                message += `• ${item.name} x${item.quantity} = ৳${item.price * item.quantity}\n`;
            });

            message += `\n💰 *Total Bill:* ৳${total}`;
            message += `\n\n_Please confirm this order._`;

            if (platform === 'whatsapp') {
                const waNumber = "8801869895549";
                const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
                showSuccessModal(); // Also show success modal for visual confirmation

            } else if (platform === 'email') {
                const adminEmail = "kaziemdadul4@gmail.com";
                const subject = `New Order from ${name}`;
                const itemsList = itemsToOrder.map(i => `- ${i.name} (x${i.quantity})`).join('%0D%0A');
                const body = `Name: ${name}%0D%0APhone: ${phone}%0D%0AItems:%0D%0A${itemsList}%0D%0ATotal: ${total}`;
                window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
                showSuccessModal();
            }
        }

    })
    .catch(error => {
        console.error("Error saving order:", error);
        // Alert the SPECIFIC error message from the server
        // Use styled error modal instead of alert
        showErrorModal("Submission Failed", error.message);
    });
}

// --- Modals ---

function showSuccessModal() {
    // Force remove existing modal to ensure fresh content (and remove old buttons)
    let existingModal = document.getElementById('order-success-modal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
    <div id="order-success-modal" class="fixed inset-0 z-[160] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity animate-[fadeIn_0.3s_ease-out]">
        <div class="bg-slate-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-slate-700/50 relative overflow-hidden">
            <!-- Checkmark -->
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500 mb-6 shadow-lg shadow-emerald-500/20">
                <i class="fa-solid fa-check text-4xl text-white"></i>
            </div>
            <!-- Text -->
            <h3 class="text-2xl font-bold text-white mb-2">Order Created!</h3>
            <p class="text-slate-400 text-sm mb-6 leading-relaxed">Your order has been received successfully.</p>
            
            <button onclick="window.location.href='index.html'" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl mb-6 transition-all border border-slate-600">
                Back to Home
            </button>
            
            <!-- Timer -->
            <p class="text-xs text-slate-500">Closing in <span id="redirect-timer" class="font-bold text-white text-lg ml-1">3</span>s...</p>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('order-success-modal');

    // Countdown Timer (3s -> Close)
    let seconds = 3;
    const timerInfo = document.getElementById('redirect-timer');

    // Clear any previous intervals if somehow attached (global var?) 
    // Usually local var `interval` is enough unless specific race conditions.

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

    // Always recreate or update content to ensure message is fresh
    if (modal) modal.remove();

    const modalHTML = `
    <div id="error-modal" class="fixed inset-0 z-[170] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]">
        <div class="bg-slate-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-red-500/30 relative overflow-hidden">
            <!-- Cross Icon -->
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-500 mb-6 shadow-lg shadow-red-500/20">
                <i class="fa-solid fa-xmark text-4xl text-white"></i>
            </div>
            <!-- Text -->
            <h3 class="text-xl font-bold text-white mb-2">${title}</h3>
            <p class="text-slate-400 text-sm mb-8 leading-relaxed">${message}</p>
            
            <button onclick="document.getElementById('error-modal').remove()" class="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all">Close</button>
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
    <div id="login-req-modal" class="fixed inset-0 z-[180] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity animate-[fadeIn_0.3s_ease-out]">
        <div class="bg-slate-800 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-brand-500/50 relative overflow-hidden">
            
            <div class="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-brand-500/10 mb-6 border border-brand-500/50 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                <i class="fa-solid fa-lock text-3xl text-brand-500"></i>
            </div>

            <h3 class="text-2xl font-bold text-white mb-2">Login Required</h3>
            <p class="text-slate-400 text-sm mb-8 leading-relaxed">
                To pay with Bkash/Nagad securely, you must have an account. Please login or register to continue.
            </p>

            <div class="space-y-3">
                <a href="login.html" class="block w-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 transform hover:-translate-y-0.5">
                    Login / Register
                </a>
                <button onclick="document.getElementById('login-req-modal').remove()" class="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl transition-all">
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
        const profileHTML = `
            <a href="profile.html" class="flex items-center gap-2 bg-brand-500/20 text-brand-400 px-4 py-2 rounded-full font-bold hover:bg-brand-500 hover:text-white transition-all border border-brand-500/30">
                <i class="fa-solid fa-user-circle"></i>
                <span>${name}</span>
            </a>
        `;

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
    // If on checkout modal (index.html), prefill fields
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const inputs = {
        'name': user.name,
        'phone': user.phone,
        'customer_email': user.email
    };

    // Observer or wait for modal open? 
    // Since modal opens dynamically, we should shim the openCheckout function or use an interval/observer.
    // Shim openCheckout
    const originalOpen = window.openCheckout;
    window.openCheckout = function (product, variantIndex = 0) {
        // Call original
        if (originalOpen) originalOpen(product, variantIndex);
        else {
            // Fallback if defined elsewhere or we need to wait for DOM to likely be ready
            // But openCheckout is usually global.
        }

        // Timeout to fetch elements after modal renders
        setTimeout(() => {
            Object.keys(inputs).forEach(id => {
                const el = document.getElementById(id);
                if (el && !el.value) { // Only if empty
                    el.value = inputs[id];
                }
            });
        }, 100);
    };
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
