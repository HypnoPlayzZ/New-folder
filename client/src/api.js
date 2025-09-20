import axios from 'axios';

const api = axios.create({
    baseURL: 'https://steamy-bites.vercel.app/api', 
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('customer_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { api };

