// --- Authentication UI Helpers ---

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

function updateNavbar() {
    const userStr = localStorage.getItem('user');
    const loginButtons = document.querySelectorAll('nav a[href="login"], nav a[href="login.html"]');

    if (userStr) {
        const user = JSON.parse(userStr);
        const name = user.name ? user.name.split(' ')[0] : 'User';

        loginButtons.forEach(btn => {
            btn.href = 'profile.html';

            if (btn.classList.contains('md:flex')) {
                // Desktop
                btn.className = "hidden md:flex items-center gap-2 bg-brand-500/20 text-brand-400 px-4 py-2 rounded-full font-bold hover:bg-brand-500 hover:text-white transition-all border border-brand-500/30 ml-4";
                btn.innerHTML = `<i class="fa-solid fa-user-circle"></i> <span>${name}</span>`;
            } else {
                // Mobile
                btn.innerHTML = `<i class="fa-solid fa-user-circle mr-2"></i> ${name}`;
                btn.classList.remove('text-slate-300');
                btn.classList.add('text-brand-400', 'font-bold');
            }
        });
    }
}

function showLoginRequiredModal() {
    let modal = document.getElementById('login-req-modal');
    if (modal) modal.remove();

    const modalHTML = `
    <div id="login-req-modal" class="fixed inset-0 z-[180] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity animate-[fadeIn_0.3s_ease-out]">
        <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-brand-500/20 relative overflow-hidden transform animate-[blob_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            <div class="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -z-10"></div>
            <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-brand-500/10 to-brand-600/20 mb-6 border border-brand-500/30 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                <i class="fa-solid fa-lock text-4xl text-brand-500 drop-shadow-lg"></i>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">Login Required</h3>
            <p class="text-slate-400 text-sm mb-8 leading-relaxed">
                Security Check: To use this feature, you need to sign in to your account.
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
