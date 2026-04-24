// Check auth status immediately to prevent content flashing
(function() {
    if (!localStorage.getItem('olt_auth') && !window.location.pathname.includes('login.html')) {
        window.location.href = "login.html";
        return;
    }

    const role = localStorage.getItem('olt_role');
    const path = window.location.pathname;
})();

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');
    const submitBtn = e.target.querySelector('button');

    // Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = "VERIFIKASI...";

    try {
        // Query user from Backend Proxy to avoid Supabase connectivity hangs in browser
        const response = await fetch("http://103.110.10.198:60981/api/accounts/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        const result = await response.json();

        if (result.status === 'error') {
            throw new Error(result.message || "Username atau password salah!");
        }

        const user = result.data;

        // Login success
        localStorage.setItem('olt_auth', 'true');
        localStorage.setItem('olt_username', user.username);
        localStorage.setItem('olt_role', user.role || 'admin');
        
        window.location.href = "index.html";
    } catch (error) {
        console.error("Login bias:", error.message);
        errorMsg.textContent = error.message;
        errorMsg.classList.remove('hidden');
        
        setTimeout(() => {
            errorMsg.classList.add('hidden');
        }, 3000);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "MASUK KE PANEL";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Other DOM content loaded tasks
});
window.logout = async function() {
    try {
        const username = localStorage.getItem('olt_username') || 'Unknown';
        if (window.ActivityAPI) {
            await ActivityAPI.addLog({
                username: username,
                action: 'LOGOUT',
                description: `User ${username} telah keluar dari sistem`
            });
        }
    } catch (e) {
        console.error("Failed to log logout:", e);
    } finally {
        localStorage.removeItem('olt_auth');
        localStorage.removeItem('olt_username');
        localStorage.removeItem('olt_role');
        window.location.href = "login.html";
    }
};
