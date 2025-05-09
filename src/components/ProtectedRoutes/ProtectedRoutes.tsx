import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = () => {
    const isAuthencticated = localStorage.getItem('refresh_token');
    return isAuthencticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
