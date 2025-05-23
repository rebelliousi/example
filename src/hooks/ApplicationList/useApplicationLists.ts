import { useQuery } from '@tanstack/react-query';
import {  IPagination } from '../../models/models';
import api from '../../api';

export interface AdmissionMajor {
    id: number;
    major: string;
  }
  
 export  interface User {
    id: number;
    area: string;
  }
  
  export interface IApplication {
    id:number;
    user: User;
    full_name: string;
    primary_major: AdmissionMajor;
    admission: number;
    admission_year: string;
    status: "PENDING" | "APPROVED" | "REJECTED"; 
  }
  
  


const getApplication = async (page: number): Promise<IPagination<IApplication>> => {
  const response = await api.get(`/admission/application?page=${page}`);
  return response.data;
};

export const useApplication = (page: number) => {
  return useQuery<IPagination<IApplication>, Error>({
    queryKey: ['application', page], 
    queryFn: () => getApplication(page),
  });
};
