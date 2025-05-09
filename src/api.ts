import { host } from './host';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const api = axios.create({
    baseURL: host,
    headers: {
        'Content-Type': 'application/json',
        'Accept-language': 'tk',
    },
});

const getRefreshTokenData = (): { refresh: string | null } => {
    return {
        refresh: localStorage.getItem('refresh_token'),
    };
};

const refreshToken = async () => {
    const refreshTokenData = getRefreshTokenData();
    if (!refreshTokenData) return null;
    try {
        const response = await axios.post(`${host}/auth/token/refresh`, refreshTokenData);
        const { access, refresh } = response.data;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        return access;
    } catch (err) {
        const axiosError = err as AxiosError;

        if (axiosError.response?.status === 401) {
            console.warn('Refresh token expired or invalid. Redirecting to login...');
            // Clear session storage and redirect to login
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('access_token');
            window.location.pathname = '/login';
        } else {
            console.error('Failed to refresh token:', axiosError.message);
        }
    }
    return null;
};

api.interceptors.response.use(
    (response: AxiosResponse) => response, // Pass through successful responses
    async (error: AxiosError) => {
        const { response, config } = error;

        if (response?.status === 401) {
            const originalRequest = config as AxiosRequestConfig;

            // Refresh the token
            if (originalRequest.url !== '/auth/token/') {
                const newAccessToken = await refreshToken();
                if (newAccessToken && originalRequest) {
                    // Retry the original request with a new access token
                    originalRequest.headers = {
                        ...originalRequest.headers,
                        Authorization: `Bearer ${newAccessToken}`,
                    };
                    return api(originalRequest); // Retry request
                }
            }
        }

        console.error('Request failed with error:', error.message);
        return Promise.reject(error);
    }
);
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

export default api;
