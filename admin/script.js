// Auth Check
if (sessionStorage.getItem('adminAuth') !== 'true' || !localStorage.getItem('adminToken')) {
    window.location.href = '/chodir-vai'; // Redirect to login
} else {
    // Auth OK - Reveal Content
    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
    });
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    localStorage.removeItem('adminToken'); // Clear Token
    window.location.href = '../chodir-vai';
}

document.addEventListener('DOMContentLoaded', () => {
    // Inject Sidebar at start of body
    const sidebarHTML = `
    <button class="menu-toggle" onclick="toggleSidebar()"><i class="fa-solid fa-bars"></i></button>
    <div class="admin-sidebar" id="sidebar">
        <div class="admin-logo">
            <i class="fa-solid fa-layer-group"></i> AdminPanel
        </div>
        <div class="sidebar-menu">
            <a href="dashboard" class="nav-link ${window.location.pathname.includes('dashboard') ? 'active' : ''}">
                <i class="fa-solid fa-chart-pie"></i> Dashboard
            </a>
            <a href="add-product" class="nav-link ${window.location.pathname.includes('add-product') ? 'active' : ''}">
                <i class="fa-solid fa-plus-circle"></i> Add Product
            </a>
            <a href="manage-categories" class="nav-link ${window.location.pathname.includes('manage-categories') ? 'active' : ''}">
                <i class="fa-solid fa-tags"></i> Categories
            </a>
            <a href="products" class="nav-link ${window.location.pathname.includes('products') ? 'active' : ''}">
                <i class="fa-solid fa-box-open"></i> Products
            </a>
            <a href="manage-stock" class="nav-link ${window.location.pathname.includes('manage-stock') ? 'active' : ''}">
                <i class="fa-solid fa-boxes-stacked"></i> Manage Stock
            </a>
            <a href="manage-orders" class="nav-link ${window.location.pathname.includes('manage-orders') ? 'active' : ''}">
                <i class="fa-solid fa-clipboard-list"></i> Orders
            </a>
            <a href="manage-coupons" class="nav-link ${window.location.pathname.includes('manage-coupons') ? 'active' : ''}">
                <i class="fa-solid fa-ticket"></i> Coupons
            </a>
            <a href="order-history" class="nav-link ${window.location.pathname.includes('order-history') ? 'active' : ''}">
                <i class="fa-solid fa-clock-rotate-left"></i> History
            </a>
            <a href="customers" class="nav-link ${window.location.pathname.includes('customers') ? 'active' : ''}">
                <i class="fa-solid fa-users"></i> Customers
            </a>
            <a href="manage-banners" class="nav-link ${window.location.pathname.includes('manage-banners') ? 'active' : ''}">
                <i class="fa-solid fa-images"></i> Banners
            </a>
            <a href="manage-reviews" class="nav-link ${window.location.pathname.includes('manage-reviews') ? 'active' : ''}">
                <i class="fa-solid fa-star"></i> Reviews
            </a>
            <a href="tickets" class="nav-link ${window.location.pathname.includes('tickets') ? 'active' : ''}" style="color:${window.location.pathname.includes('tickets') ? 'white' : '#fab1a0'}">
                <i class="fa-solid fa-headset"></i> Tickets
            </a>
        </div>
        <div class="sidebar-footer">
            <button onclick="logout()" class="logout-btn">
                <i class="fa-solid fa-right-from-bracket"></i> Logout
            </button>
        </div>
    </div>
    <div class="custom-modal-overlay" onclick="toggleSidebar()"></div> 
    `;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // Remove old nav placeholder content if any
    const oldNav = document.getElementById('admin-nav');
    if (oldNav) oldNav.style.display = 'none';

    // Inject Custom Modal HTML
    const modalHTML = `
    <div id="custom-modal" class="custom-modal-overlay">
        <div class="custom-modal-card">
            <div id="modal-icon-container" class="modal-icon"></div>
            <h3 id="modal-title" class="modal-title"></h3>
            <p id="modal-msg" class="modal-msg"></p>
            <div id="modal-actions" class="modal-actions"></div>
        </div>
    </div>
    <div id="toast-container" class="toast-container"></div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add Main Layout Class if not present
    const box = document.querySelector('.admin-box');
    if (box) box.classList.add('admin-main');
});

// Sidebar Toggle (Mobile)
function toggleSidebar() {
    const sidebar = document.querySelectorAll('.admin-sidebar')[0];
    // Fix: querySelectorAll returns NodeList, earlier referenced id 'sidebar' but injected HTML has id 'sidebar' too.
    // Ideally use id directly.
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.toggle('active');
}

// --- GLOBAL MODAL FUNCTIONS ---
window.showConfirm = function (title, msg, onConfirm) {
    const modal = document.getElementById('custom-modal');
    document.getElementById('modal-icon-container').innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:#ef4444;"></i>';
    document.getElementById('modal-icon-container').style.background = 'rgba(239, 68, 68, 0.1)';

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-msg').innerText = msg;

    const actions = document.getElementById('modal-actions');
    actions.innerHTML = `
        <button class="modal-btn cancel" onclick="closeCustomModal()">Cancel</button>
        <button id="modal-confirm-btn" class="modal-btn confirm-danger">Yes, I'm sure</button>
    `;

    document.getElementById('modal-confirm-btn').onclick = function () {
        onConfirm();
        closeCustomModal();
    };

    modal.style.display = 'flex';
};

window.showAlert = function (title, msg, type = 'success') {
    const modal = document.getElementById('custom-modal');
    let icon = '<i class="fa-solid fa-check" style="color:#10b981;"></i>';
    let bg = 'rgba(16, 185, 129, 0.1)';
    let btnClass = 'confirm-success';

    if (type === 'error') {
        icon = '<i class="fa-solid fa-xmark" style="color:#ef4444;"></i>';
        bg = 'rgba(239, 68, 68, 0.1)';
        btnClass = 'confirm-danger';
    }

    document.getElementById('modal-icon-container').innerHTML = icon;
    document.getElementById('modal-icon-container').style.background = bg;

    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-msg').innerText = msg;

    const actions = document.getElementById('modal-actions');
    actions.innerHTML = `
        <button class="modal-btn ${btnClass}" onclick="closeCustomModal()">OK</button>
    `;

    modal.style.display = 'flex';
};

window.closeCustomModal = function () {
    document.getElementById('custom-modal').style.display = 'none';
};

// --- TOAST NOTIFICATIONS ---
window.showToast = function (msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = '<i class="fa-solid fa-check-circle"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-circle-xmark"></i>';

    toast.innerHTML = `${icon} <span>${msg}</span>`;

    container.appendChild(toast);

    // Remove after 3s
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
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
