import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api',
});

// This interceptor intelligently adds the correct token to every request.
api.interceptors.request.use(config => {
    const adminToken = localStorage.getItem('admin_token');
    const customerToken = localStorage.getItem('customer_token');

    // Prioritize the admin token if it exists, otherwise use the customer token.
    const token = adminToken || customerToken;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { api };
