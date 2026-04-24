/**
 * API Centralized Service for OLT Multi-Monitoring
 */

const API_CONFIG = {
    BASE_URL: "http://103.110.10.198:60981/api",
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

var OltAPI = {
    BASE_URL: "http://103.110.10.198:60981/api",
    /**
     * Devices API
     */
    // --- CRUD OPERATIONS (Direct to Supabase Cloud) ---
    async listDevices() {
        try {
            // Using Backend Proxy to avoid Supabase connectivity hangs in browser
            const response = await fetch(this.BASE_URL + "/devices/");
            if (!response.ok) throw new Error("Gagal mengambil data OLT dari Backend");
            const data = await response.json();
            // Ensure data is always an array for list operations
            const finalData = Array.isArray(data) ? data : [];
            return { status: 'success', data: finalData };
        } catch (error) {
            console.error("Error listing devices from Backend:", error);
            return { status: 'error', message: error.message, data: [] };
        }
    },

    async addDevice(deviceData) {
        try {
            const response = await fetch(this.BASE_URL + "/devices/", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deviceData)
            });
            return await response.json();
        } catch (error) {
            console.error("Error adding device to Backend:", error);
            return { status: 'error', message: error.message };
        }
    },

    async updateDevice(deviceId, deviceData) {
        try {
            const response = await fetch(`${this.BASE_URL}/devices/${deviceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(deviceData)
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating device in Backend:", error);
            return { status: 'error', message: error.message };
        }
    },

    async deleteDevice(deviceId) {
        try {
            const response = await fetch(`${this.BASE_URL}/devices/${deviceId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error("Error deleting device from Backend:", error);
            return { status: 'error', message: error.message };
        }
    },

    // --- REAL-TIME ACTIONS (Requires Python SSH Bridge) ---
    async testConnection(credentials) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/test-connection`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error("Error testing connection:", error);
            throw error;
        }
    },

    async testSnmpConnection(credentials) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/test-snmp`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error("Error testing SNMP:", error);
            throw error;
        }
    },

    async getPonStats(credentials) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/pon-stats`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error("Error getting PON stats:", error);
            throw error;
        }
    },

    async getPonOnuStatus(credentials, interfaceName) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/pon-onu-status`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ ...credentials, interface: interfaceName })
            });
            return await response.json();
        } catch (error) {
            console.error("Error getting PON ONU status status:", error);
            throw error;
        }
    },

    async getSystemResources(credentials) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/system-resources`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error("Error getting system resources:", error);
            return { status: 'error', data: { cpu: 'N/A', pon: 0, temp: 'N/A' } };
        }
    },

    async checkStatus(credentials) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/check-status`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error("Error checking OLT status:", error);
            return { status: 'error', online: false };
        }
    },

    async getUnconfiguredOnus(credentials) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/unconfigured-onus`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error("Error getting unconfigured ONUs:", error);
            throw error;
        }
    },

    async getOnuList(credentials, interfaceName = null, signal = null) {
        try {
            const body = { ...credentials };
            if (interfaceName) body.interface = interfaceName;
            
            const fetchOptions = {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(body)
            };
            if (signal) fetchOptions.signal = signal;
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/onu-list`, fetchOptions);
            return await response.json();
        } catch (error) {
            console.error("Error getting ONU list:", error);
            throw error;
        }
    },

    async syncOnuList(credentials) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/onu-list/sync`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error("Error syncing ONU list:", error);
            throw error;
        }
    },

    async getOnuSignal(credentials, interfaceName) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/check-signal`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ ...credentials, interface: interfaceName })
            });
            return await response.json();
        } catch (error) {
            console.error("Error checking ONU signal:", error);
            throw error;
        }
    },

    async getPonConfig(credentials, interfaceName) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/pon-config`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ ...credentials, interface: interfaceName })
            });
            return await response.json();
        } catch (error) {
            console.error("Error getting PON config:", error);
            throw error;
        }
    },

    async getOnuDetail(credentials, interfaceName) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/onu-detail`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ ...credentials, interface: interfaceName })
            });
            return await response.json();
        } catch (error) {
            console.error("Error getting ONU detail:", error);
            throw error;
        }
    },

    async executeCommand(credentials, interfaceName, commandType, customCmd = null) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/execute`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({
                    ...credentials,
                    interface: interfaceName,
                    command_type: commandType,
                    custom_cmd: customCmd
                })
            });
            return await response.json();
        } catch (error) {
            console.error("Error executing command:", error);
            throw error;
        }
    },

    async configureVlan(credentials, interfaceName, vlanId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/actions/configure`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({
                    ...credentials,
                    interface: interfaceName,
                    vlan_id: vlanId
                })
            });
            return await response.json();
        } catch (error) {
            console.error("Error configuring VLAN:", error);
            throw error;
        }
    }
};

/**
 * Account Management API (Supabase)
 */
const AccountAPI = {
    async listAccounts() {
        try {
            const response = await fetch(OltAPI.BASE_URL + "/accounts/");
            if (!response.ok) throw new Error("Gagal mengambil data Akun dari Backend");
            const data = await response.json();
            return { status: 'success', data: data };
        } catch (error) {
            console.error("Error listing accounts from Backend:", error);
            return { status: 'error', message: error.message };
        }
    },

    async addAccount(userData) {
        try {
            const response = await fetch(OltAPI.BASE_URL + "/accounts/", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error("Error adding account:", error);
            return { status: 'error', message: error.message };
        }
    },

    async updateAccount(userId, userData) {
        try {
            const response = await fetch(`${OltAPI.BASE_URL}/accounts/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating account:", error);
            return { status: 'error', message: error.message };
        }
    },

    async deleteAccount(userId) {
        try {
            const response = await fetch(`${OltAPI.BASE_URL}/accounts/${userId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error("Error deleting account:", error);
            return { status: 'error', message: error.message };
        }
    }
};

// Export for use in other scripts
window.OltAPI = OltAPI;
window.AccountAPI = AccountAPI;

/**
 * Router Management API (MikroTik)
 */
var RouterAPI = {
    BASE_URL: "http://103.110.10.198:60981/api",
    async listRouters() {
        try {
            // Using Backend Proxy
            const response = await fetch(OltAPI.BASE_URL + "/routers/");
            if (!response.ok) throw new Error("Gagal mengambil data Router dari Backend");
            const data = await response.json();
            // Ensure data is always an array for list operations
            const finalData = Array.isArray(data) ? data : [];
            return { status: 'success', data: finalData };
        } catch (error) {
            console.error("Error listing routers from Backend:", error);
            return { status: 'error', message: error.message, data: [] };
        }
    },

    async addRouter(routerData) {
        try {
            const response = await fetch(OltAPI.BASE_URL + "/routers/", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(routerData)
            });
            return await response.json();
        } catch (error) {
            console.error("Error adding router to Backend:", error);
            return { status: 'error', message: error.message };
        }
    },

    async updateRouter(routerId, routerData) {
        try {
            const response = await fetch(`${OltAPI.BASE_URL}/routers/${routerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(routerData)
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating router in Backend:", error);
            return { status: 'error', message: error.message };
        }
    },

    async deleteRouter(routerId) {
        try {
            const response = await fetch(`${OltAPI.BASE_URL}/routers/${routerId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error("Error deleting router from Backend:", error);
            return { status: 'error', message: error.message };
        }
    },

    async testConnection(credentials) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/routers/test-connection`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(credentials)
            });
            return await response.json();
        } catch (error) {
            console.error("Error testing router connection:", error);
            return { status: 'error', message: "Gagal menghubungi Backend" };
        }
    },

    async getActivePppoe(routerId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/routers/active-pppoe`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ router_id: routerId })
            });
            return await response.json();
        } catch (error) {
            console.error("Error getting active PPPOE:", error);
            throw error;
        }
    },

    async getIsolirList(routerId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/routers/isolir-list`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ router_id: routerId })
            });
            return await response.json();
        } catch (error) {
            console.error("Error getting isolir list:", error);
            throw error;
        }
    },

    async getPppoeSecrets(routerId) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/routers/pppoe-secrets`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify({ router_id: routerId })
            });
            return await response.json();
        } catch (error) {
            console.error("Error getting PPPOE secrets:", error);
            throw error;
        }
    },

    async ping(ip, routerId = null) {
        try {
            const body = { ip: ip };
            if (routerId) body.router_id = routerId;

            const response = await fetch(`${API_CONFIG.BASE_URL}/routers/ping`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(body)
            });
            return await response.json();
        } catch (error) {
            console.error("Error pinging:", error);
            return { status: 'error', message: "Gagal menghubungi Backend" };
        }
    },

    async batchPing(ips, routerId = null) {
        try {
            const body = { ips: ips };
            if (routerId) body.router_id = routerId;

            const response = await fetch(`${API_CONFIG.BASE_URL}/routers/batch-ping`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(body)
            });
            return await response.json();
        } catch (error) {
            console.error("Error batch pinging:", error);
            return { status: 'error', message: "Gagal menghubungi Backend" };
        }
    },

    async setupRemoteOnu(ip, routerId, dstPort = null) {
        try {
            const body = { ip: ip, router_id: routerId };
            if (dstPort) body.dst_port = dstPort;
            
            const response = await fetch(`${API_CONFIG.BASE_URL}/routers/remote-onu`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(body)
            });
            return await response.json();
        } catch (error) {
            console.error("Error setting up remote ONU:", error);
            return { status: 'error', message: "Gagal menghubungi Backend" };
        }
    }
};

window.RouterAPI = RouterAPI;

/**
 * Customer Management API (Supabase)
 */
var CustomerAPI = {
    BASE_URL: "http://103.110.10.198:60981/api",
    async listCustomers() {
        try {
            // Using Backend Proxy
            const response = await fetch(OltAPI.BASE_URL + "/customers/");
            if (!response.ok) throw new Error("Gagal mengambil data Pelanggan dari Backend");
            const data = await response.json();
            return { status: 'success', data: data };
        } catch (error) {
            console.error("Error listing customers from Backend:", error);
            return { status: 'error', message: error.message };
        }
    },

    async addCustomer(customerData) {
        try {
            const response = await fetch(OltAPI.BASE_URL + "/customers/", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            });
            return await response.json();
        } catch (error) {
            console.error("Error adding customer to Backend:", error);
            return { status: 'error', message: error.message };
        }
    },

    async updateCustomer(customerId, customerData) {
        try {
            const response = await fetch(`${OltAPI.BASE_URL}/customers/${customerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData)
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating customer in Backend:", error);
            return { status: 'error', message: error.message };
        }
    },

    async deleteCustomer(customerId) {
        try {
            const response = await fetch(`${OltAPI.BASE_URL}/customers/${customerId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error("Error deleting customer from Backend:", error);
            return { status: 'error', message: error.message };
        }
    }
};

// Export to window for global access
window.OltAPI = OltAPI;
window.RouterAPI = RouterAPI;
window.CustomerAPI = CustomerAPI;

/**
 * Activity Log API
 */
var ActivityAPI = {
    async listActivities(limit = 10, offset = 0, search = '') {
        try {
            let url = `${API_CONFIG.BASE_URL}/activity/?limit=${limit}&offset=${offset}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error("Gagal mengambil riwayat aktivitas");
            return await response.json();
        } catch (error) {
            console.error("Error listing activities:", error);
            return { status: 'error', message: error.message };
        }
    },

    async addLog(logData) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/activity/`, {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(logData)
            });
            return await response.json();
        } catch (error) {
            console.error("Error recording log:", error);
            return { status: 'error', message: error.message };
        }
    }
};

window.ActivityAPI = ActivityAPI;


