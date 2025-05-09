import api from '../api';
import { useSnackbar } from './useSnackbar';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface AuthProps {
    username: string;
    password: string;
}
interface authResponse {
    access: string;
    refresh: string;
    roles: string[];
}
const fetchAuthTokens = async (data: AuthProps) => {
    const response = await api.post<authResponse>('/auth/token/', data);
    return response.data;
};
export function useAuth() {
    const navigate = useNavigate();
    const { call } = useSnackbar();
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    return useMutation({
        mutationKey: ['token'],
        mutationFn: (data: AuthProps) => fetchAuthTokens(data),
        onSuccess: data => {
            const { access, refresh, roles } = data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('userRoles', JSON.stringify(roles));
            api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            if (redirectPath) {
                navigate(redirectPath);
                localStorage.setItem('redirectAfterLogin', '');
            } else {
                navigate('/');
            }
            call('Log in succesfully!');
        },
    });
}
api.interceptors.request.use(
    config => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);
