import React, { FC, Suspense, lazy } from 'react';

interface SnackbarProviderProps {
    children: React.ReactNode;
}
const Toaster = lazy(() => import('react-hot-toast').then(module => ({ default: module.Toaster })));
const SnackbarProvider: FC<SnackbarProviderProps> = ({ children }) => {
    return (
        <div>
            {children}
            <Suspense fallback={<div></div>}>
                <Toaster position="top-center" />
            </Suspense>
        </div>
    );
};

export default SnackbarProvider;
