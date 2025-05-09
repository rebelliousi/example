import { create } from "zustand";

interface ISidebarStore{
    isOpen:boolean;
    setIsOpen:(value:boolean)=>void
}

export const  useSidebarStore=create<ISidebarStore>(set=>({
    isOpen:true,
    setIsOpen:value=>set({isOpen:value})
}))