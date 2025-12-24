// Auth Check
if (sessionStorage.getItem('adminAuth') !== 'true') {
    window.location.href = '../secure-admin.html';
}

function logout() {
    sessionStorage.removeItem('adminAuth');
    window.location.href = '../secure-admin.html';
}

document.addEventListener('DOMContentLoaded', () => {
    // Inject Nav
    const navHTML = `
    <div style="text-align:right; margin-bottom:20px;">
        <button onclick="logout()" style="background:none; border:none; color:var(--red); cursor:pointer; font-size:12px;">🔒 Logout</button>
    </div>
    <h2>Admin Center</h2>
    <div class="tabs">
        <a href="dashboard.html" class="tab-btn ${window.location.pathname.includes('dashboard') ? 'active' : ''}">Dashboard</a>
        <a href="add-product.html" class="tab-btn ${window.location.pathname.includes('add-product') ? 'active' : ''}">Add Product</a>
        <a href="manage-orders.html" class="tab-btn ${window.location.pathname.includes('manage-orders') ? 'active' : ''}">Manage Orders</a>
        <a href="order-history.html" class="tab-btn ${window.location.pathname.includes('order-history') ? 'active' : ''}">Order History</a>
        <a href="products.html" class="tab-btn ${window.location.pathname.includes('products') ? 'active' : ''}">Products</a>
        <a href="customers.html" class="tab-btn ${window.location.pathname.includes('customers') ? 'active' : ''}">Customers</a>
        <a href="tickets.html" class="tab-btn ${window.location.pathname.includes('tickets') ? 'active' : ''}" style="color:#e17055;"><i class="fa-solid fa-headset mr-1"></i> Tickets</a>
    </div>
    `;

    const navContainer = document.getElementById('admin-nav');
    if (navContainer) navContainer.innerHTML = navHTML;

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
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
});

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
