import { create } from 'zustand';

type ModalType = 'add' | 'edit' | 'delete' | 'view' | null;

interface ModalStore {
  isModalOpen: boolean;
  modalType: ModalType;
  admissionData: any | null; 
  openModal: (type: ModalType, admissionData?: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isModalOpen: false,
  modalType: null,
  admissionData: null,
  openModal: (type, admissionData = null) => set({ isModalOpen: true, modalType: type, admissionData }),
  closeModal: () => set({ isModalOpen: false, modalType: null, admissionData: null }),
}));
