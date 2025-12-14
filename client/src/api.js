import axios from 'axios';

// Use Vite env var to allow switching between deployed and local backends
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://steamybitesbackend.onrender.com/api';

// Basic axios instance
const api = axios.create({
    baseURL,
    // Add a global timeout so stalled cold starts don't freeze UI forever
    timeout: 12000, // 12s
});

// Attach auth header if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('customer_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Simple retry on cold-start failures (network timeout/5xx)
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const config = error.config || {};
        const status = error.response?.status;
        const isTimeout = error.code === 'ECONNABORTED';
        const shouldRetry = isTimeout || (status && status >= 500);

        // retry only idempotent GET requests up to 2 times
        if (shouldRetry && config.method === 'get') {
            config.__retryCount = (config.__retryCount || 0) + 1;
            if (config.__retryCount <= 2) {
                // small backoff
                await new Promise((r) => setTimeout(r, 700 * config.__retryCount));
                // notify UI that backend might be waking up
                try {
                    window.dispatchEvent(new CustomEvent('server:wakeup', { detail: { stage: config.__retryCount } }));
                } catch {}
                return api(config);
            }
        }
        return Promise.reject(error);
    }
);

// Lightweight keep-alive ping to reduce cold starts
export async function pingBackend() {
    try {
        // Health endpoint if available; fallback to a very cheap route
        await api.get('/health', { timeout: 6000 }).catch(() => api.get('/menu', { params: { limit: 1 } }));
    } catch (_) {
        // swallow errors; this is best-effort only
    }
}

// Stale-while-revalidate cache helpers for GET resources
function readCache(key, maxAgeMs = 10 * 60 * 1000) { // 10 minutes
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.data || !parsed.ts) return null;
        if (Date.now() - parsed.ts > maxAgeMs) return null;
        return parsed.data;
    } catch {
        return null;
    }
}

function writeCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
    } catch {}
}

// Cached fetchers for common endpoints
export async function getMenuCached() {
    const cached = readCache('cache_menu');
    if (cached) return cached;
    const res = await api.get('/menu');
    writeCache('cache_menu', res.data);
    return res.data;
}

export async function getCouponsCached() {
    const cached = readCache('cache_coupons');
    if (cached) return cached;
    const res = await api.get('/coupons');
    writeCache('cache_coupons', res.data);
    return res.data;
}

export { api };

