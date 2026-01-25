-- Enable Row Level Security (Recommended but optional for initial setup)
-- alter default privileges away from postgres users
-- alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY,
    name TEXT,
    category TEXT,
    "viewInIndex" BOOLEAN,
    price NUMERIC,
    "originalPrice" NUMERIC,
    image TEXT,
    "desc" TEXT,
    "longDesc" TEXT,
    features JSONB,
    instructions TEXT,
    variants JSONB,
    rating NUMERIC DEFAULT 0,
    "ratingCount" INTEGER DEFAULT 0
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT
);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    dob DATE,
    password TEXT,
    joined TIMESTAMPTZ,
    "isBanned" BOOLEAN DEFAULT FALSE,
    "isVerified" BOOLEAN DEFAULT FALSE,
    passkeys JSONB DEFAULT '[]'::JSONB
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY,
    date TEXT, -- Keeping as text to match JSON format first, can cast to timestamp later if format varies
    "userId" TEXT,
    customer TEXT,
    phone TEXT,
    email TEXT,
    "gameUid" TEXT,
    product TEXT,
    price NUMERIC,
    currency TEXT,
    "originalPriceBDT" NUMERIC,
    "couponCode" TEXT,
    discount NUMERIC,
    status TEXT,
    "paymentMethod" TEXT,
    trx TEXT,
    proof TEXT,
    items JSONB,
    plan TEXT,
    "deliveryInfo" TEXT
);

-- 5. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT PRIMARY KEY,
    code TEXT,
    discount NUMERIC,
    type TEXT,
    "minSpend" NUMERIC,
    "applicableProducts" JSONB,
    "maxUsage" INTEGER,
    "maxUserUsage" INTEGER,
    "usageCount" INTEGER,
    "usageByUsers" JSONB,
    "isActive" BOOLEAN,
    "createdAt" TIMESTAMPTZ,
    "expiryDate" TIMESTAMPTZ
);

-- 6. TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT PRIMARY KEY,
    "userId" TEXT,
    "userName" TEXT,
    email TEXT,
    subject TEXT,
    "desc" TEXT,
    image TEXT,
    date TEXT
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    "productId" INTEGER,
    "userId" TEXT,
    rating INTEGER,
    comment TEXT,
    date TIMESTAMPTZ DEFAULT NOW(),
    "userName" TEXT
);

-- 8. SYSTEM DATA (Key-Value Store)
CREATE TABLE IF NOT EXISTS system_data (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- DATA INSERTION (Based on provided JSON files)

-- Categories
INSERT INTO categories (id, name) VALUES
('streaming', 'Streaming'),
('gaming', 'Gaming'),
('tools', 'Tools & VPN')
ON CONFLICT (id) DO NOTHING;

-- Coupons
INSERT INTO coupons (id, code, discount, type, "minSpend", "applicableProducts", "maxUsage", "maxUserUsage", "usageCount", "usageByUsers", "isActive", "createdAt", "expiryDate") VALUES
(1768035302946, '10', 100, 'flat', 0, '["all"]', 0, 0, 2, '{}', true, '2026-01-10T08:55:02.946Z', null)
ON CONFLICT (id) DO NOTHING;

-- Products (Sample - Full list should be imported via script if large, but inserting the 11 items here)
INSERT INTO products (id, name, category, "viewInIndex", price, "originalPrice", image, "desc", "longDesc", features, instructions, variants, rating, "ratingCount") VALUES
(1, 'Netflix Premium (4K)', 'streaming', true, 340, 500, 'assets/images/Netflix.png', '4K UHD | Private Profile', 'Bangladesh''s best Netflix Premium subscription service. Enjoy 4K Ultra HD streaming on your TV, Mobile, or Laptop without interruptions. We provide a private profile with a secure PIN. 100% warranty support included. Order now and get instant delivery.', '["4K Ultra HD Quality", "Private Profile with PIN", "Works on TV, Mobile & Laptop", "Download Supported", "1 Device Only", "Full Warranty Support"]', 'অর্ডার কনফার্ম হওয়ার ১০ মিনিটের মধ্যেই আপনার দেওয়া WhatsApp নম্বর অথবা ইমেইলে অ্যাকাউন্ট ডেলিভারি করা হবে।', '[{"label": "1 Month", "price": 340, "originalPrice": 500, "stock": []}, {"label": "3 Months", "price": 1000, "originalPrice": 1500, "stock": []}, {"label": "6 Months", "price": 1900, "originalPrice": 3000, "stock": []}, {"label": "12 Months", "price": 3600, "originalPrice": 6000, "stock": []}]', 0, 0),
(2, 'Spotify Premium', 'streaming', true, 150, 300, 'assets/images/spotify.png', 'Individual Plan | Ad-free', 'Get the cheapest Spotify Premium price in Bangladesh. Enjoy ad-free music with offline download support. This is a legitimate Family Invitation method that works on your own account. No need to create a new ID. Upgrade your existing account to Premium instantly.', '["100% Genuine Spotify Premium", "1 Device / 1 Account", "No Ads", "High Quality Audio", "Offline Download Support", "Personal Account (নতুন একাউন্ট দরকার নেই)", "All Country Supported", "Full Time Support"]', 'অর্ডার করার সময় আপনার Spotify Account Email দিন। আমরা আপনার জিমেইলে Family Invitation পাঠাবো। ইনভিটেশন নিজে Accept করতে হবে। ৫–১০ মিনিটের মধ্যে ইনভিটেশন পাঠানো হবে।', '[{"label": "1 Month", "price": 150, "originalPrice": 300, "stock": []}, {"label": "3 Months", "price": 420, "originalPrice": 900, "stock": []}, {"label": "6 Months", "price": 800, "originalPrice": 1800, "stock": []}, {"label": "12 Months", "price": 1500, "originalPrice": 3600, "stock": []}]', 0, 0),
(3, 'Canva Pro', 'tools', false, 50, 100, 'assets/images/Canva.png', 'Education | Pro Features', 'Canva Pro / Canva Education (Team Invitation).\nActivation Method: Team Invitation\nআপনার দেওয়া জিমেইল অ্যাড্রেসে টিম ইনভিটেশন পাঠানো হবে। ইনভিটেশন একসেপ্ট করার সাথে সাথেই আপনার নেওয়া Canva Pro অথবা Canva Education সাবস্ক্রিপশন অ্যাক্টিভ হয়ে যাবে।', '["Premium Templates & Elements Access", "Background Remover", "Brand Kit & Magic Resize", "HD Download (PNG, JPG, PDF, MP4)", "Works on Mobile, PC & Web", "Personal Account", "1 Gmail = 1 Account", "Support & Warranty Available"]', 'আপনার দেওয়া জিমেইল অ্যাড্রেসে টিম ইনভিটেশন পাঠানো হবে। সাপোর্টে যোগাযোগ করুন 01869895549 WhatsApp', '[{"label": "1 Month (Pro)", "price": 50, "originalPrice": 100, "stock": []}, {"label": "1 Year (Education)", "price": 200, "originalPrice": 500, "stock": []}, {"label": "3 Years (Education)", "price": 300, "originalPrice": 900, "stock": []}]', 0, 0),
(4, 'YouTube Premium', 'streaming', false, 120, 200, 'assets/images/Youtube.png', 'Ad-free | Background Play', 'YouTube Premium (Family Invitation Method)\nকিভাবে কাজ করবে:\nআপনার দেওয়া জিমেইল ঠিকানায় YouTube Family Invitation পাঠানো হবে।\nইনভিটেশন Accept করার সাথে সাথেই আপনার একাউন্টে YouTube Premium Active হয়ে যাবে।', '["Ad-free YouTube", "Background Play", "YouTube Music Premium", "Mobile, PC & TV Support", "Family Invitation (Safe & Secure)", "Full Support During Subscription"]', 'সাবস্ক্রিপশন রিনিউ: আপনি যদি ১ মাসের বেশি সময়ের জন্য সাবস্ক্রিপশন নেন, তাহলে প্রতি মাস শেষে আমাদের সাপোর্টে SMS / WhatsApp দিয়ে সহজেই রিনিউ করে নিতে পারবেন।', '[{"label": "1 Month", "price": 120, "originalPrice": 200, "stock": []}, {"label": "3 Months", "price": 350, "originalPrice": 600, "stock": []}, {"label": "6 Months", "price": 680, "originalPrice": 1200, "stock": []}, {"label": "12 Months", "price": 1340, "originalPrice": 2400, "stock": []}]', 0, 0),
(5, 'Free Fire (115 💎)', 'gaming', true, 85, 90, 'assets/images/Freefire.png', 'UID Topup | Instant', 'Top Up Free Fire Diamonds in Bangladesh instantly using your Player ID (UID). Cheapest diamond price in BD. 100% safe and secure top-up with no login required. Get your diamonds within 5-10 minutes.', '["৫–১০ মিনিটের মধ্যে ডায়মন্ড যুক্ত হবে", "১০০% সেফ, কোনো লগইন দরকার নেই", "সব দেশের একাউন্ট সাপোর্ট", "স্কিন, ইমোট, লাকি স্পিন ও ইভেন্টে ব্যবহারযোগ্য"]', 'সঠিক Player ID দিন, ডেলিভারির পর রিফান্ড নেই। ১০ মিনিটের মধ্যে ডায়মন্ড না পেলে আমাদের সাথে যোগাযোগ করুন।', null, 0, 0),
(6, 'PUBG UC (60)', 'gaming', false, 95, 100, 'assets/images/PUBG.jpeg', 'Global ID | Instant', 'Buy PUBG Mobile UC in Bangladesh at the lowest price. secure UID top-up for Global accounts. Get UC instantly within 10 minutes. Trusted PUBG UC shop in BD.', '["৫–১০ মিনিটের মধ্যে UC যুক্ত হবে", "১০০% সেফ, কোনো লগইন প্রয়োজন নেই", "সব দেশের একাউন্ট সাপোর্ট", "স্কিন, রয়্যাল পাস ও স্পিনে ব্যবহারযোগ্য"]', 'সঠিক Player ID দিন। ১০ মিনিটের মধ্যে UC না পেলে আমাদের সাথে যোগাযোগ করুন।', null, 0, 0),
(7, 'NordVPN Premium', 'tools', false, 300, 800, 'assets/images/Nord VPN.png', '6 Devices | Secure', 'Protect your privacy with NordVPN. Access geo-blocked content and browse securely on public Wi-Fi.', '["6 Simultaneous Devices", "5000+ Servers", "No Logs Policy", "High Speed"]', 'You will receive a premium account email and password. Do not change the credentials.', '[{"label": "1 Month", "price": 300, "originalPrice": 800, "stock": []}, {"label": "3 Months", "price": 855, "originalPrice": 2400, "stock": []}, {"label": "6 Months", "price": 1620, "originalPrice": 4800, "stock": []}, {"label": "12 Months", "price": 3060, "originalPrice": 9600, "stock": []}]', 0, 0),
(8, 'Amazon Prime', 'streaming', false, 250, 500, 'assets/images/Amazon Prime.png', '4K Support | Exclusive', 'Amazon Prime Video Premium:\nঅর্ডার কনফার্ম হওয়ার ১০ মিনিটের মধ্যেই আপনার দেওয়া WhatsApp নম্বর অথবা ইমেইলে অ্যাকাউন্ট ডেলিভারি করা হবে।\nঅ্যাকাউন্ট ব্যবহারে কোনো সমস্যা হলে আমাদের WhatsApp সাপোর্টে যোগাযোগ করুন — দ্রুত সমাধান দেওয়া হবে。', '["HD / Full HD Streaming", "Private Profile (Secure Login)", "Works on TV, Mobile & Laptop", "Download Supported", "1 Device Only", "Full Warranty Support"]', 'অর্ডার কনফার্ম হওয়ার ১০ মিনিটের মধ্যেই আপনার দেওয়া WhatsApp নম্বর অথবা ইমেইলে অ্যাকাউন্ট ডেলিভারি করা হবে।', '[{"label": "1 Month", "price": 250, "originalPrice": 500, "stock": []}, {"label": "6 Months", "price": 1500, "originalPrice": 3000, "stock": []}]', 0, 0),
(9, 'Google AI Premium', 'tools', false, 200, 400, 'assets/images/Google Ai Pro.png', 'Gemini Advanced | 2TB', 'Google AI Pro (Invitation Method)\nকিভাবে কাজ করবে:\nআপনার দেওয়া Gmail ঠিকানায় Google AI Pro Invitation পাঠানো হবে।\nইনভিটেশন Accept করার সাথে সাথেই আপনার একাউন্টে Google AI Pro Active হয়ে যাবে।', '["Access to Advanced Google AI Models", "Gemini Advanced (Pro Features)", "Faster & Smarter AI Responses", "Text, Image & Productivity AI Tools", "Works on Mobile & PC", "Personal Gmail Based Access", "Safe Invitiation Method", "Full Support"]', 'সাবস্ক্রিপশন রিনিউ: আপনি যদি ১ মাসের বেশি সময়ের জন্য সাবস্ক্রিপশন নেন, তাহলে আপনার সাবস্ক্রিপশনটি প্রতি মাসে অটোমেটিকভাবে রিনিউ হয়ে যাবে।', '[{"label": "1 Month", "price": 200, "originalPrice": 400, "stock": []}, {"label": "3 Months", "price": 600, "originalPrice": 1200, "stock": []}, {"label": "6 Months", "price": 1200, "originalPrice": 2400, "stock": []}, {"label": "12 Months", "price": 2400, "originalPrice": 5000, "stock": []}]', 0, 0),
(10, 'Combo Pack (YT + 2TB)', 'tools', false, 300, 600, 'assets/images/Combo YT+Storage.png', 'YouTube Premium + 2TB', '🎁 Combo Pack (YouTube Premium + Google Storage 2TB)\nকিভাবে কাজ করবে:\nআপনার দেওয়া জিমেইল ঠিকানায় YouTube Family Invitation ও Google One (2TB) Family Invitation পাঠানো হবে।', '["YouTube Ad-free Experience", "Background Play", "YouTube Music Premium", "Mobile, PC & Smart TV Support", "Google Drive / Gmail / Photos 2TB Storage", "Family Invitation Method", "All Country Supported", "Full Support"]', 'সাবস্ক্রিপশন চলাকালীন কোনো সমস্যা হলে সাথে সাথে আমাদের সাপোর্টে যোগাযোগ করবেন।', '[{"label": "1 Month", "price": 300, "originalPrice": 600, "stock": []}, {"label": "3 Months", "price": 900, "originalPrice": 1800, "stock": []}, {"label": "6 Months", "price": 1800, "originalPrice": 3600, "stock": []}, {"label": "12 Months", "price": 3600, "originalPrice": 7200, "stock": []}]', 0, 0),
(11, 'YouTube Premium (Non-Renewable)', 'streaming', false, 50, 80, 'assets/images/Youtube.png', 'Non-Renewable | 1 Month', '🎬 YouTube Premium (Non-Renewable Package)\nকিভাবে কাজ করবে:\nআপনার দেওয়া জিমেইল ঠিকানায় YouTube Family Invitation পাঠানো হবে।\nইনভিটেশন Accept করার সাথে সাথেই আপনার একাউন্টে YouTube Premium Active হয়ে যাবে。', '["Ad-free YouTube", "Background Play", "YouTube Music Premium", "Mobile, PC & TV Support", "Safe Family Invitation Method", "Full Support During Subscription", "Non-Renewable Package"]', '⚠ এটি Non-Renewable Package. এই প্যাকেজ নিলে প্রতি ২ মাস অন্তর নতুন জিমেইল ব্যবহার করতে হবে।', '[{"label": "1 Month", "price": 50, "originalPrice": 80, "stock": []}]', 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Customers
INSERT INTO customers (id, name, email, phone, dob, password, joined, "isBanned", "isVerified") VALUES
('usr_mk833hq8', 'KAZI EMDADUL HAQUE', 'kaziemdadul5@gmail.com', '+8801869895549', '2000-01-07', '$2a$10$RvnlY5k87aaBvsQ9IFN5cO9MvpEWPiBWmO1VQeENdC6dIxYwy3EMa', '2026-01-10T09:09:48.106Z', false, true)
ON CONFLICT (id) DO NOTHING;

-- System Data
INSERT INTO system_data (key, value) VALUES
('admin2faSecret', '"G5UUI4LLGFJDETTZMJFU2VTCHZNHO2ZFLZJG4QKWLVETE6SKLVCQ"'),
('backup2faSecret', '"GZSGMMREPISHQ4C6PVSXMRRGMEZSIVDT"'),
('payLaterEnabled', 'true')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
