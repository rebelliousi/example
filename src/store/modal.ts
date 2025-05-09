import { create } from 'zustand';

interface IModalStore {
    status: 'pending' | 'waiting' | 'submit';
    setStatus: (status: IModalStore['status']) => void;
    onSubmit: () => void;
    setOnSubmit: (fn: () => Promise<void> | void) => void;
    open: boolean;
    setOpen: (value: boolean) => void;
    title: string;
    setTitle: (value: string) => void;
}

export const useModalStore = create<IModalStore>(set => ({
    status: 'waiting',
    setStatus: status => set({ status }),
    onSubmit: () => {},
    setOnSubmit: fn => set({ onSubmit: fn }),
    open: false,
    setOpen: open => set({ open }),
    title: 'Do you want to delete?',
    setTitle: title => set({ title }),
}));
