import { create } from 'zustand';

interface IDialogStore {
    title: string;
    setTitle: (title: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    confirmAction: () => void;
    setConfirmAction: (action: () => void) => void;
    isFetching: boolean;
    setIsFetching: (isFetching: boolean) => void;
}
export const useDialogStore = create<IDialogStore>(set => ({
    title: 'Do you delete?',
    setTitle: title => set(() => ({ title: title })),
    open: false,
    setOpen: open => set(() => ({ open: open })),
    confirmAction: () => {},
    setConfirmAction: action => set({ confirmAction: action }),
    isFetching: false,
    setIsFetching: fetching => set(() => ({ isFetching: fetching })),
}));
