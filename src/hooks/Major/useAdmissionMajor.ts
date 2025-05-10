import { useQuery } from '@tanstack/react-query';
import {  IAdmissionMajor, IPagination } from '../../models/models';
import api from '../../api';


const getAdmissionMajor = async (page: number): Promise<IPagination<IAdmissionMajor>> => {
  const response = await api.get(`/admission/majors?page=${page}`);
  return response.data;
};

export const useAdmissionMajor = (page: number) => {
  return useQuery<IPagination<IAdmissionMajor>, Error>({
    queryKey: ['admission', page], 
    queryFn: () => getAdmissionMajor(page),
  });
};
