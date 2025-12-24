// Auth Check
if (sessionStorage.getItem('adminAuth') !== 'true') {
    window.location.href = '../secure-admin.html';
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    window.location.href = '../secure-admin.html';
}

document.addEventListener('DOMContentLoaded', () => {
    // Inject Sidebar & Main Layout
    // We need to move the existing .admin-box content into the new .admin-main wrapper
    // But since the pages have .admin-box hardcoded in HTML, we can leave them but wrap them or just let the script restructure?
    // Actually, simpler: The HTML pages have `<div class="admin-box"> <nav id="admin-nav"></nav> ...content... </div>`
    // We will target #admin-nav to inject the SIDEBAR relative to the body (fixed), and we need to wrap the REST of the content in .admin-main.

    // Better approach without rewriting all HTML files: 
    // 1. Identify .admin-box.
    // 2. Prepend sidebar to body.
    // 3. Add class .admin-main to .admin-box (or wrap it).

    // Let's rewrite the navHTML to be the Sidebar, and since .admin-sidebar is fixed, it can live inside or outside .admin-box.
    // To make it easiest: append sidebar to body, and add margin to .admin-box via JS or CSS class.

    // Wait, the CSS change makes .admin-main have margin-left. 
    // The current HTML structure is: <body> <div class="admin-box"> <nav id="admin-nav"></nav> ... </div> </body>
    // We can hide #admin-nav (or make it empty) and inject the REAL sidebar directly into body.
    // Then add .admin-main class to .admin-box.

    const box = document.querySelector('.admin-box');
    if (box) box.classList.add('admin-main');

    const sidebarHTML = `
    <button class="menu-toggle" onclick="toggleSidebar()"><i class="fa-solid fa-bars"></i></button>
    <div class="admin-sidebar" id="sidebar">
        <div class="admin-logo">
            <i class="fa-solid fa-layer-group"></i> AdminPanel
        </div>
        <div class="sidebar-menu">
            <a href="dashboard.html" class="nav-link ${window.location.pathname.includes('dashboard') ? 'active' : ''}">
                <i class="fa-solid fa-chart-pie"></i> Dashboard
            </a>
            <a href="add-product.html" class="nav-link ${window.location.pathname.includes('add-product') ? 'active' : ''}">
                <i class="fa-solid fa-plus-circle"></i> Add Product
            </a>
            <a href="products.html" class="nav-link ${window.location.pathname.includes('products') ? 'active' : ''}">
                <i class="fa-solid fa-box-open"></i> Products
            </a>
            <a href="manage-orders.html" class="nav-link ${window.location.pathname.includes('manage-orders') ? 'active' : ''}">
                <i class="fa-solid fa-clipboard-list"></i> Orders
            </a>
            <a href="order-history.html" class="nav-link ${window.location.pathname.includes('order-history') ? 'active' : ''}">
                <i class="fa-solid fa-clock-rotate-left"></i> History
            </a>
            <a href="customers.html" class="nav-link ${window.location.pathname.includes('customers') ? 'active' : ''}">
                <i class="fa-solid fa-users"></i> Customers
            </a>
            <a href="tickets.html" class="nav-link ${window.location.pathname.includes('tickets') ? 'active' : ''}" style="color:${window.location.pathname.includes('tickets') ? 'white' : '#fab1a0'}">
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

    // Inject sidebar at start of body
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    // Remove old nav placeholder content if any
    const oldNav = document.getElementById('admin-nav');
    if (oldNav) oldNav.style.display = 'none';

    // Inject Custom Modal HTML (keep this)
    const modalHTML = `
    <div id="custom-modal" class="custom-modal-overlay">
        <div class="custom-modal-card">
            <div id="modal-icon-container" class="modal-icon"></div>
            <h3 id="modal-title" class="modal-title"></h3>
            <p id="modal-msg" class="modal-msg"></p>
            <div id="modal-actions" class="modal-actions"></div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
});

// Sidebar Toggle (Mobile)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
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
