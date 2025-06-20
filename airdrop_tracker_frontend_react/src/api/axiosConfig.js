// airdrop_tracker_frontend_react/src/api/axiosConfig.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const decodedToken = jwtDecode(refreshToken);
                    if (decodedToken.exp * 1000 > Date.now()) {
                        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh`, { refresh: refreshToken });
                        localStorage.setItem('access_token', response.data.access);
                        localStorage.setItem('refresh_token', response.data.refresh);
                        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                        return axiosInstance(originalRequest);
                    }
                } catch (e) { console.error("Refresh token invalid or expired:", e); }
            }
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;