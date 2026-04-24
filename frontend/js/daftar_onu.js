/**
 * Logic for Daftar ONU Page
 */

let allOnus = [];
let filteredOnus = [];
let currentOlt = null;

async function initPage() {
    await loadOlts();
    
    // Check for OLT ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const oltId = urlParams.get('id') || urlParams.get('olt_id');
    if (oltId) {
        const select = document.getElementById('oltSelect');
        select.value = oltId;
        await handleOltChange();
    }
}

async function loadOlts() {
    const select = document.getElementById('oltSelect');
    try {
        const result = await OltAPI.listDevices();
        const devices = result.data || [];
        
        select.innerHTML = '<option value="">-- Pilih OLT --</option>' + 
            devices.map(olt => `<option value="${olt.id}" data-olt='${JSON.stringify(olt)}'>${olt.name} (${olt.ip})</option>`).join('');
    } catch (err) {
        console.error("Failed to load OLTs:", err);
    }
}

async function handleOltChange() {
    const select = document.getElementById('oltSelect');
    const oltId = select.value;
    if (!oltId) {
        resetPage();
        return;
    }

    const selectedOption = select.options[select.selectedIndex];
    currentOlt = JSON.parse(selectedOption.dataset.olt);

    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.remove('hidden');

    // Tampilkan progress agar user tahu proses sedang berjalan
    const loadingText = loadingOverlay.querySelector('p, span, .loading-text');
    let dots = 0;
    const progressInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        if (loadingText) loadingText.textContent = 'Syncing ONU Data' + '.'.repeat(dots);
    }, 600);

    // Timeout 90 detik
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
        const response = await OltAPI.getOnuList({ olt_id: oltId }, controller.signal);
        console.log('ONU list response', response);
        if (response.status === 'success') {
            const rawData = response.data || [];
            allOnus = rawData.map(o => ({
                name: o.name,
                sn: o.sn,
                pon: o.pon_port || o.pon,
                id: o.onu_id || o.id,
                status: o.status,
                signal: o.rx_power || o.signal,
                last_sync: o.last_sync
            }));
            filteredOnus = [...allOnus];
            updatePonFilter();
            updateStats();
            renderTable();
        } else {
            alert("Gagal mengambil data ONU: " + (response.message || 'Unknown error'));
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            alert("Timeout: Server tidak merespons dalam 90 detik. Coba lagi atau periksa koneksi OLT di backend.");
        } else {
            console.error("Error fetching ONU list:", err);
            alert("Terjadi kesalahan: " + err.message);
        }
    } finally {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        loadingOverlay.classList.add('hidden');
    }
}

function resetPage() {
    allOnus = [];
    filteredOnus = [];
    document.getElementById('onuTableBody').innerHTML = '<tr><td colspan="7" class="px-6 py-10 text-center text-gray-400 italic font-medium">Silakan pilih OLT untuk menampilkan data.</td></tr>';
    document.getElementById('ponFilter').innerHTML = '<option value="">Semua PON</option>';
    updateStats();
}

async function syncManual() {
    const select = document.getElementById('oltSelect');
    const oltId = select.value;
    if (!oltId) {
        alert("Pilih OLT terlebih dahulu");
        return;
    }
    const btn = document.querySelector('button[title="Refresh"]');
    if(btn) {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'animate-pulse');
    }
    
    try {
        const response = await OltAPI.syncOnuList({ olt_id: oltId });
        if(response.status === 'success') {
            alert(response.message || "Proses sinkronisasi latar belakang telah dimulai. Silakan tunggu beberapa saat dan refresh ulang untuk melihat data terbaru.");
        } else {
            alert("Gagal memulai sinkronisasi: " + response.message);
        }
    } catch (err) {
        alert("Error sinkronisasi: " + err.message);
    } finally {
        if(btn) {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'animate-pulse');
            // Auto reload after trigger
            setTimeout(() => handleOltChange(), 15000); // Attempt to fetch from DB after 15 seconds
        }
    }
}

function updatePonFilter() {
    const ponFilter = document.getElementById('ponFilter');
    const pons = [...new Set(allOnus.map(onu => onu.pon))].sort();
    
    ponFilter.innerHTML = '<option value="">Semua PON</option>' + 
        pons.map(pon => `<option value="${pon}">${pon}</option>`).join('');
}

function updateStats() {
    const total = allOnus.length;
    const online = allOnus.filter(o => o.status === 'Working' || o.status === 'online' || o.status === 'up').length;
    const offline = allOnus.filter(o => o.status === 'Offline' || o.status === 'offline' || o.status === 'down').length;
    const los = allOnus.filter(o => o.status === 'LOS' || o.status === 'DyingGasp').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statOnline').textContent = online;
    document.getElementById('statOffline').textContent = offline;
    document.getElementById('statLos').textContent = los;
}

function filterData() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const ponQuery = document.getElementById('ponFilter').value;
    const statusQuery = document.getElementById('statusFilter').value;

    filteredOnus = allOnus.filter(onu => {
        const matchesSearch = !searchQuery || 
            (onu.name && onu.name.toLowerCase().includes(searchQuery)) || 
            (onu.sn && onu.sn.toLowerCase().includes(searchQuery));
        
        const matchesPon = !ponQuery || onu.pon === ponQuery;
        
        const matchesStatus = !statusQuery || 
            (statusQuery === 'online' && (onu.status === 'Working' || onu.status === 'online' || onu.status === 'up')) ||
            (statusQuery === 'offline' && (onu.status === 'Offline' || onu.status === 'offline' || onu.status === 'down')) ||
            (statusQuery === 'los' && (onu.status === 'LOS' || onu.status === 'DyingGasp'));

        return matchesSearch && matchesPon && matchesStatus;
    });

    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('onuTableBody');
    if (filteredOnus.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-10 text-center text-gray-400 italic font-medium">Data tidak ditemukan.</td></tr>';
        return;
    }

    tbody.innerHTML = filteredOnus.map(onu => {
        let statusBadge = '';
        const status = (onu.status || '').toLowerCase();

        if (status === 'working' || status === 'online' || status === 'up') {
            statusBadge = `<span class="flex items-center text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase ring-1 ring-emerald-200 dark:ring-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/10 px-2.5 py-1 rounded-lg w-max">
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>Working</span>`;
        } else if (status === 'los' || status === 'dyinggasp' || status === 'poweroff') {
            statusBadge = `<span class="flex items-center text-red-500 text-[10px] font-black uppercase ring-1 ring-red-100 dark:ring-red-900/20 bg-red-50 dark:bg-red-900/10 px-2.5 py-1 rounded-lg w-max">
                <span class="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>LOS / OFF</span>`;
        } else {
            statusBadge = `<span class="flex items-center text-gray-500 text-[10px] font-black uppercase ring-1 ring-gray-200 dark:ring-gray-700/50 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg w-max">
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>Offline</span>`;
        }

        const signalColor = parseFloat(onu.signal) > -27 ? 'text-emerald-600' : 'text-red-500';

        return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition group">
                <td class="px-6 py-4">
                    <div class="flex flex-col">
                        <span class="font-bold text-gray-800 dark:text-gray-100">${onu.name || 'N/A'}</span>
                        <span class="text-[10px] font-mono text-gray-400">${onu.sn || 'N/A'}</span>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">${onu.pon || '-'}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="text-xs font-bold text-gray-600 dark:text-gray-300">${onu.id || '-'}</span>
                </td>
                <td class="px-6 py-4">
                    ${statusBadge}
                </td>
                <td class="px-6 py-4">
                    <span class="font-mono text-xs font-bold ${signalColor}">${onu.signal || '-'} dBm</span>
                </td>
                <td class="px-6 py-4">
                    <span class="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">${onu.sn || '-'}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center space-x-2">
                        <a href="onu_monitor.html?id=${currentOlt.id}&onu=${onu.pon}:${onu.id}" 
                           class="p-2 bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                           title="Monitor">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                           </svg>
                        </a>
                        <button onclick="rebootOnu('${onu.pon}', '${onu.id}')"
                           class="p-2 bg-amber-600/10 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm"
                           title="Reboot">
                           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                           </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function rebootOnu(pon, id) {
    if (!currentOlt) return;
    if (!confirm(`Yakin ingin melakukan REBOOT pada ONU ${pon}:${id}?`)) return;
    
    // Determine prefix based on vendor and interface naming
    const isEpon = pon.toLowerCase().includes('epon');
    const prefixOnu = isEpon ? 'epon-onu' : 'gpon-onu';
    
    const script = `conf t\npon-onu-mng ${prefixOnu}_${pon}:${id}\n  reboot\nend\nwrite`;
    
    try {
        const response = await OltAPI.executeCommand({ olt_id: currentOlt.id }, 'TEMPLATE', 'raw', script);
        if (response.status === 'success') {
            alert(`Berhasil mengirim perintah reboot ke ONU ${pon}:${id}`);
        } else {
            alert(`Gagal reboot: ${response.message}`);
        }
    } catch (err) {
        console.error("Reboot error:", err);
        alert("Terjadi kesalahan saat mengeksekusi perintah reboot.");
    }
}

document.addEventListener('DOMContentLoaded', initPage);
