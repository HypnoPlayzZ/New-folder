import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api',
    timeout: 15000,
});

// Attach the right bearer token: admin token wins over customer token.
api.interceptors.request.use(config => {
    const adminToken = localStorage.getItem('admin_token');
    const customerToken = localStorage.getItem('customer_token');
    const token = adminToken || customerToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// On 401 the admin token has expired — clear it and bounce the user back to login.
// Skipping for the login route itself so a wrong-password error still surfaces.
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        if (status === 401 && !url.includes('/auth/admin/login')) {
            try {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_name');
                window.location.hash = '#/admin-login';
            } catch {}
        }
        return Promise.reject(error);
    }
);

export { api };
