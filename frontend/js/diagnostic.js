/**
 * Diagnostic Script for OLT Monitor
 * Checks for library loading and API availability.
 */
(function() {
    // Helper to show error banner
    function showBanner(message) {
        if (document.getElementById('diag-banner')) return;
        const banner = document.createElement('div');
        banner.id = 'diag-banner';
        banner.style.cssText = "position:fixed; top:0; left:0; right:0; background:#ef4444; color:white; padding:12px; z-index:10000; text-align:center; font-weight:800; font-size:12px; box-shadow:0 4px 15px rgba(0,0,0,0.4); font-family:sans-serif; border-bottom:2px solid rgba(0,0,0,0.1);";
        banner.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; gap:12px;">
                <svg style="width:18px; height:18px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.3); color:white; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:10px; font-weight:bold; transition:all 0.2s">RESET / TUTUP</button>
            </div>
        `;
        document.body.prepend(banner);
    }

    // Global error handler to catch initialization errors (like supabase-client failing)
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        const errorMsg = `JavaScript Error: ${msg} di ${url}:${lineNo}`;
        console.error(errorMsg, error);
        showBanner("CRITICAL ERROR: " + msg + " (Cek F12)");
        return false;
    };

    window.addEventListener('load', function() {
        const issues = [];
        
        if (typeof window.supabase === 'undefined') {
            issues.push("Library Supabase (CDN) gagal dimuat. Periksa koneksi internet.");
        } else if (typeof window.supabaseClient === 'undefined') {
            issues.push("Client Supabase (js/supabase-client.js) gagal diinisialisasi.");
        }
        
        if (typeof window.CustomerAPI === 'undefined' || typeof window.OltAPI === 'undefined' || typeof window.RouterAPI === 'undefined') {
            issues.push("API Service (js/api.js) gagal dimuat atau ada error syntax.");
        }

        if (issues.length > 0) {
            showBanner("SISTEM ERROR: " + issues[0]);
        } else {
            console.log("Diagnostic: Semua core library terdeteksi OK.");
            // Test reachability to Backend API
            fetch("http://103.110.10.198:60981/", { mode: 'no-cors' })
                .then(() => console.log("Diagnostic: Backend API reachable."))
                .catch(() => {
                    console.warn("Diagnostic WARNING: Backend API (103.x.x.x) tidak dapat dijangkau.");
                });

            // --- TEST 2: REAL CORS FETCH ---
            console.log("Diagnostic: Testing Real Fetch (with CORS)...");
            fetch("http://103.110.10.198:60981/api/devices/")
                .then(res => {
                    console.log("Diagnostic: Real API Fetch SUCCESS. (Status: " + res.status + ")");
                })
                .catch(err => {
                    console.error("Diagnostic: Real API Fetch FAILED (CORS/Network Block):", err);
                    showBanner("PENYEBAB UTAMA: Browser memblokir koneksi ke port 60981 karena alasan keamanan (CORS) atau Port Forwarding.");
                });

            // Test Supabase reachability
            if (typeof SUPABASE_CONFIG !== 'undefined') {
                console.log("Diagnostic: Testing Supabase Connectivity...");
                fetch(SUPABASE_CONFIG.URL, { mode: 'no-cors' })
                    .then(() => {
                        console.log("Diagnostic: Supabase Cloud reachable.");
                        // Try direct REST query
                        return fetch(`${SUPABASE_CONFIG.URL}/rest/v1/olt_devices?select=id&limit=1`, {
                            headers: {
                                'apikey': SUPABASE_CONFIG.ANON_KEY,
                                'Authorization': `Bearer ${SUPABASE_CONFIG.ANON_KEY}`
                            }
                        });
                    })
                    .then(res => {
                        if (res.ok) {
                            console.log("Diagnostic: Supabase REST Query OK.");
                        } else {
                            console.warn("Diagnostic: Supabase REST Query returned status " + res.status);
                        }
                    })
                    .catch((err) => {
                        console.error("Diagnostic: Supabase Connection/Query FAILED:", err);
                        showBanner("KONEKSI ERROR: Tidak dapat menjangkau Supabase Cloud. Cek internet Anda atau firewall.");
                    });
            }
        }
    });
})();
