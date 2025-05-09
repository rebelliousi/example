import { useModalStore } from '../../store/modal';
import DialogModal from './DiologModal';
import React, { FC } from 'react';

interface IModalProvider {
    children: React.ReactNode;
}
export const ModalProvider: FC<IModalProvider> = ({ children }) => {
    const { open } = useModalStore();

    return (
        <>
            {children}
            {open && <DialogModal />}
        </>
    );
};
