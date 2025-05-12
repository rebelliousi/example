import { useQuery } from '@tanstack/react-query';
import {  IPagination } from '../../models/models';
import api from '../../api';

export interface IActiveMajors{
    id:number;
    major:number;
    major_name:string;
    order_number:number;
    quota:number;
    exams:string;
}


const getActiveMajors = async (page: number): Promise<IPagination<IActiveMajors>> => {
  const response = await api.get(`/admission/active_majors?page=${page}`);
  return response.data;
};

export const useActiveMajors = (page: number) => {
  return useQuery<IPagination<IActiveMajors>, Error>({
    queryKey: ['active_majors', page], 
    queryFn: () => getActiveMajors(page),
  });
};
