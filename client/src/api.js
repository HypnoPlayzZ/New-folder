import axios from 'axios';

// Use Vite env var to allow switching between deployed and local backends
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://steamybitesbackend.onrender.com/api';

const api = axios.create({
    baseURL,
});

api.interceptors.request.use(config => {
    // This function specifically looks for the customer token
    const token = localStorage.getItem('customer_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { api };

