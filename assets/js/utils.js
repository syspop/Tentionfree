// --- Utilities ---

function createVariants(basePrice, baseOriginal) {
    return [
        { label: "1 Month", price: basePrice, originalPrice: baseOriginal },
        { label: "3 Months", price: basePrice * 3 * 0.95, originalPrice: baseOriginal * 3 }, // 5% off
        { label: "6 Months", price: basePrice * 6 * 0.90, originalPrice: baseOriginal * 6 }, // 10% off
        { label: "12 Months", price: basePrice * 12 * 0.85, originalPrice: baseOriginal * 12 } // 15% off
    ].map(v => ({ ...v, price: Math.round(v.price), originalPrice: Math.round(v.originalPrice) }));
}

function normalizePath(path) {
    if (path && !path.startsWith('/') && !path.startsWith('http')) {
        return '/' + path;
    }
    return path;
}

function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Show Toast Notification
function showToast(msg, type = 'success') {
    // Check if toast container exists, else create
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;";
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
        min-width: 250px;
    `;
    toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'} mr-2"></i> ${msg}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation styles if not present
if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.innerHTML = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
    `;
    document.head.appendChild(style);
}
