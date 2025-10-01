import axios from 'axios';

const api = axios.create({
    baseURL: 'https://steamybitesbackend.onrender.com/api',
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

