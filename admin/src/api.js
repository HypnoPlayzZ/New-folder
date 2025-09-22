import axios from 'axios';

// Create an Axios instance for the admin portal
const api = axios.create({
    baseURL: 'https://new-folder-946c.vercel.app/api', // Or your live backend URL
});

// Use an interceptor to attach the admin token to all requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export { api };
