import { useQuery } from '@tanstack/react-query';
import {  IAdmissionSubject, IPagination } from '../../models/models';
import api from '../../api';


const getAdmissionSubjects = async (page: number): Promise<IPagination<IAdmissionSubject>> => {
  const response = await api.get(`/admission/subject?page=${page}`);
  return response.data;
};

export const useAdmissionSubjects = (page: number) => {
  return useQuery<IPagination<IAdmissionSubject>, Error>({
    queryKey: ['subjects', page], 
    queryFn: () => getAdmissionSubjects(page),
  });
};
