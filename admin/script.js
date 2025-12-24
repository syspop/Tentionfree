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
});
