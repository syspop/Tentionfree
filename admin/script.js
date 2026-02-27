// Auth Check
if (!localStorage.getItem('adminToken')) {
    window.location.href = '/chodir-vai'; // Redirect to login
} else {
    // Auth OK - Reveal Content
    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
        setupInactivityTimer(); // Start Inactivity Timer
    });
}

function logout() {
    localStorage.removeItem('adminToken'); // Clear Token
    window.location.href = '/chodir-vai';
}

// --- INACTIVITY TIMER ---
let inactivityTimer;
const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 Minutes

function setupInactivityTimer() {
    window.onload = resetTimer;
    // DOM Events
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onclick = resetTimer;
    document.onscroll = resetTimer;
    document.ontouchmove = resetTimer;
}

function resetTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logout, INACTIVITY_LIMIT);
}

document.addEventListener('DOMContentLoaded', () => {
    // Inject Tailwind if missing (Fallsafe)
    if (!document.querySelector('script[src*="tailwindcss"]')) {
        const script = document.createElement('script');
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
    }

    // Inject Sidebar & Mobile Header
    const sidebarHTML = `
    <!-- Mobile Header -->
    <div class="md:hidden fixed top-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
             <img src="/assets/images/logo.png" alt="Logo" class="w-8 h-8 object-contain">
             <span class="font-bold text-white tracking-wide">Admin<span class="text-brand-500">Panel</span></span>
        </div>
        <button onclick="toggleSidebar()" class="text-slate-300 hover:text-white p-2">
            <i class="fa-solid fa-bars text-xl"></i>
        </button>
    </div>

    <!-- Sidebar Overlay (Mobile) -->
    <div id="sidebar-overlay" onclick="toggleSidebar()" class="fixed inset-0 bg-black/50 z-40 hidden md:hidden backdrop-blur-sm transition-opacity"></div>

    <!-- Sidebar -->
    <aside id="sidebar" class="fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out overflow-y-auto custom-scrollbar">
        <div class="p-6 flex items-center gap-3 border-b border-slate-800/50">
            <img src="/assets/images/logo.png" alt="Logo" class="w-10 h-10 object-contain drop-shadow-lg">
            <div>
                <h1 class="font-bold text-xl text-white tracking-tight leading-none">Tention<span class="text-blue-500">Free</span></h1>
                <span class="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Workspace</span>
            </div>
            <button onclick="toggleSidebar()" class="md:hidden absolute right-4 text-slate-500 hover:text-white">
                <i class="fa-solid fa-xmark text-lg"></i>
            </button>
        </div>

        <nav class="p-4 space-y-1">
            <p class="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">Main Menu</p>
            ${renderNavLink('dashboard', 'fa-chart-pie', 'Dashboard')}
            ${renderNavLink('manage-orders', 'fa-cart-shopping', 'Orders')}
            ${renderNavLink('manage-manual-payments', 'fa-money-bill-transfer', 'Manual Pays')}
            ${renderNavLink('order-history', 'fa-clock-rotate-left', 'History')}
            ${renderNavLink('customers', 'fa-users', 'Customers')}
            
            <p class="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Product Management</p>
            ${renderNavLink('products', 'fa-box', 'All Products')}
            ${renderNavLink('add-product', 'fa-plus-circle', 'Add Product')}
            ${renderNavLink('manage-categories', 'fa-tags', 'Categories')}
            ${renderNavLink('manage-stock', 'fa-boxes-stacked', 'Stock Control')}
            
            <p class="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">Marketing & Support</p>
            ${renderNavLink('manage-banners', 'fa-images', 'Banners')}
            ${renderNavLink('manage-coupons', 'fa-ticket', 'Coupons')}
            ${renderNavLink('manage-reviews', 'fa-star', 'Reviews')}
            ${renderNavLink('tickets', 'fa-headset', 'Tickets')}
            <p class="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6">System & Security</p>
            ${renderNavLink('passkey-manager', 'fa-fingerprint', 'Passkeys')}
            ${renderNavLink('settings', 'fa-gear', 'Settings')}
        </nav>

        <div class="p-4 border-t border-slate-800 mt-auto">
            <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all group">
                <i class="fa-solid fa-right-from-bracket group-hover:rotate-180 transition-transform"></i>
                <span class="font-medium text-sm">Logout</span>
            </button>
        </div>
    </aside>
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // Remove old nav placeholder content if any
    const oldNav = document.getElementById('admin-nav');
    if (oldNav) oldNav.style.display = 'none';

    // Inject Custom Modal HTML (Modernized)
    const modalHTML = `
    <div id="custom-modal" class="fixed inset-0 z-[60] hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-slate-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-slate-700">
                <div class="bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                        <div id="modal-icon-container" class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10"></div>
                        <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 class="text-lg leading-6 font-bold text-white" id="modal-title"></h3>
                            <div class="mt-2">
                                <p class="text-sm text-slate-300" id="modal-msg"></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="modal-actions" class="bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2"></div>
            </div>
        </div>
    </div>
    <div id="toast-container" class="fixed top-5 right-5 z-[70] space-y-3"></div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add Main Layout Classes to content box
    const box = document.querySelector('.admin-box');
    if (box) {
        box.classList.add('md:ml-72', 'p-4', 'md:p-8', 'pt-20', 'md:pt-8', 'min-h-screen', 'bg-slate-950', 'text-slate-100', 'transition-all');
        box.style.marginLeft = ""; // Remove inline style if any
    }
});

function renderNavLink(href, icon, text) {
    const isActive = window.location.pathname.includes(href);
    const activeClass = isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white';

    return `
    <a href="${href}" class="${activeClass} flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group">
        <i class="fa-solid ${icon} w-5 text-center ${isActive ? '' : 'group-hover:text-blue-400 transition-colors'}"></i>
        <span class="font-medium text-sm tracking-wide">${text}</span>
        ${isActive ? '<i class="fa-solid fa-chevron-right ml-auto text-xs opacity-50"></i>' : ''}
    </a>
    `;
}

// Sidebar Toggle (Mobile)
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sb) {
        if (sb.classList.contains('-translate-x-full')) {
            sb.classList.remove('-translate-x-full'); // Show
            if (overlay) overlay.classList.remove('hidden');
        } else {
            sb.classList.add('-translate-x-full'); // Hide
            if (overlay) overlay.classList.add('hidden');
        }
    }
}

// --- GLOBAL MODAL FUNCTIONS ---
window.showConfirm = function (title, msg, onConfirm) {
    const modal = document.getElementById('custom-modal');
    document.getElementById('modal-icon-container').innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i>';
    document.getElementById('modal-icon-container').className = 'mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 bg-red-900/20 mb-4 sm:mb-0';

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-msg').innerText = msg;

    const actions = document.getElementById('modal-actions');
    actions.innerHTML = `
        <button id="modal-confirm-btn" class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-bold text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-all transform active:scale-95">Yes, I'm sure</button>
        <button onclick="closeCustomModal()" class="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-600 shadow-sm px-4 py-2 bg-slate-700 text-base font-medium text-slate-300 hover:bg-slate-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
    `;

    document.getElementById('modal-confirm-btn').onclick = function () {
        onConfirm();
        closeCustomModal();
    };

    modal.classList.remove('hidden');
};

window.showAlert = function (title, msg, type = 'success') {
    const modal = document.getElementById('custom-modal');
    let icon = '<i class="fa-solid fa-check" style="color:#10b981;"></i>';
    let bgClass = 'bg-green-900/20';
    let btnClass = 'bg-green-600 hover:bg-green-700';

    if (type === 'error') {
        icon = '<i class="fa-solid fa-xmark" style="color:#ef4444;"></i>';
        bgClass = 'bg-red-900/20';
        btnClass = 'bg-red-600 hover:bg-red-700';
    }

    document.getElementById('modal-icon-container').innerHTML = icon;
    document.getElementById('modal-icon-container').className = `mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${bgClass} mb-4 sm:mb-0`;

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-msg').innerText = msg;

    const actions = document.getElementById('modal-actions');
    actions.innerHTML = `
        <button class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 text-base font-bold text-white focus:outline-none sm:w-auto sm:text-sm transition-all transform active:scale-95 ${btnClass}" onclick="closeCustomModal()">OK</button>
    `;

    modal.classList.remove('hidden');
};

window.closeCustomModal = function () {
    document.getElementById('custom-modal').classList.add('hidden');
};

// --- TOAST NOTIFICATIONS ---
window.showToast = function (msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');

    // Tailwind Toast Classes
    let colorClass = type === 'error' ? 'bg-red-500' : 'bg-emerald-500';
    let icon = type === 'error' ? '<i class="fa-solid fa-circle-xmark"></i>' : '<i class="fa-solid fa-check-circle"></i>';

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transform transition-all duration-300 translate-x-10 opacity-0 text-white font-medium text-sm ${colorClass} min-w-[300px]`;
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
    }, 3000);
}

// Start Helper: Read File as Base64 (Missing Fix)
window.readFileAsBase64 = function (file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};
// End Helper
