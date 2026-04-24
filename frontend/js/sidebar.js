// Define toggle function globally and immediately
window.toggleSidebar = function () {
    const body = document.body;
    const sidebar = document.getElementById('sidebar');
    if (!body || !sidebar) return;

    if (window.innerWidth < 768) { // Mobile View
        const isHidden = sidebar.classList.contains('-translate-x-full');
        if (isHidden) {
            sidebar.classList.remove('-translate-x-full');
            createBackdrop();
        } else {
            sidebar.classList.add('-translate-x-full');
            removeBackdrop();
        }
        body.classList.remove('sidebar-collapsed');
    } else { // Desktop View
        // Cycle: Mini-Sidebar -> Full Sidebar -> Hidden Sidebar -> Mini-Sidebar
        if (body.classList.contains('mini-sidebar')) {
            body.classList.remove('mini-sidebar');
            body.classList.remove('sidebar-collapsed');
            localStorage.setItem('sidebar-mode', 'full');
        } else if (!body.classList.contains('sidebar-collapsed')) {
            body.classList.add('sidebar-collapsed');
            localStorage.setItem('sidebar-mode', 'hidden');
        } else {
            body.classList.remove('sidebar-collapsed');
            body.classList.add('mini-sidebar');
            localStorage.setItem('sidebar-mode', 'mini');
        }
    }
};

function createBackdrop() {
    if (document.getElementById('sidebar-backdrop')) return;
    const backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    backdrop.className = 'fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 transition-opacity duration-300 opacity-0';
    document.body.appendChild(backdrop);
    // Force reflow
    backdrop.offsetHeight;
    backdrop.classList.add('opacity-100');
    backdrop.onclick = window.toggleSidebar;
}

function removeBackdrop() {
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) {
        backdrop.classList.remove('opacity-100');
        setTimeout(() => backdrop.remove(), 300);
    }
}

function highlightActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('#sidebar nav a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            // Remove regular coloring
            link.classList.remove('text-gray-500', 'dark:text-gray-400');
            // Add active coloring
            link.classList.add('bg-blue-50', 'dark:bg-blue-600/10', 'text-blue-600', 'dark:text-blue-400', 'font-semibold');
            
            // Expand parent dropdown if exists
            const dropdown = link.closest('.dropdown-container');
            if (dropdown) {
                const menu = dropdown.querySelector('.dropdown-menu');
                const arrow = dropdown.querySelector('.dropdown-arrow');
                if (menu) {
                    menu.classList.remove('hidden');
                }
                if (arrow) arrow.classList.add('rotate-180', 'text-blue-600');
            }
        }
    });
}

(function () {
    const checkState = () => {
        const body = document.body;
        const sidebar = document.getElementById('sidebar');
        if (!body || !sidebar) {
            setTimeout(checkState, 10);
            return;
        }

        let mode = 'mini'; // Default desktop mode
        try {
            mode = localStorage.getItem('sidebar-mode') || 'mini';
        } catch (e) { console.error("LocalStorage check failed", e); }

        if (window.innerWidth >= 768) {
            body.classList.remove('sidebar-collapsed', 'mini-sidebar');
            if (mode === 'mini') {
                body.classList.add('mini-sidebar');
            } else if (mode === 'hidden') {
                body.classList.add('sidebar-collapsed');
            }
        } else {
            // On mobile, ensure sidebar starts hidden and body is clean
            sidebar.classList.add('-translate-x-full');
            body.classList.remove('sidebar-collapsed', 'mini-sidebar');
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkState);
    } else {
        checkState();
    }
})();

// General initialization
document.addEventListener('DOMContentLoaded', () => {
    // Highlight active link
    highlightActiveLink();

    // ESC key to close on mobile
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.innerWidth < 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
                window.toggleSidebar();
            }
        }
    });

    // Auto-hide sidebar on mobile after clicking a link
    const sidebarLinks = document.querySelectorAll('#sidebar nav a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth < 768) {
                // Don't close if it's a dropdown toggle (if any)
                if (!link.hasAttribute('onclick')) {
                    window.toggleSidebar();
                }
            }
        });
    });

    // Initialize User Profile in Sidebar
    const username = localStorage.getItem('olt_username') || 'Unknown User';
    const role = localStorage.getItem('olt_role') || 'Operator';
    const userDisplay = document.getElementById('sidebar-user-name');
    const roleDisplay = document.getElementById('sidebar-user-role');
    const initialDisplay = document.getElementById('sidebar-user-initial');

    if (userDisplay) userDisplay.textContent = username;
    if (roleDisplay) roleDisplay.textContent = role.charAt(0).toUpperCase() + role.slice(1);
    if (initialDisplay) initialDisplay.textContent = username.charAt(0).toUpperCase();
});

window.toggleDropdown = function (id) {
    const menu = document.getElementById(id);
    const arrow = document.getElementById(id + '-arrow');
    if (!menu) return;

    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
        menu.classList.remove('hidden');
        if (arrow) arrow.classList.add('rotate-180');
    } else {
        menu.classList.add('hidden');
        if (arrow) arrow.classList.remove('rotate-180');
    }
};
