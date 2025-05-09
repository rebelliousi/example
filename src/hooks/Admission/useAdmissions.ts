import { useQuery } from '@tanstack/react-query';
import { IAdmission, IPagination } from '../../models/models';
import api from '../../api';


const getAdmission = async (page: number): Promise<IPagination<IAdmission>> => {
  const response = await api.get(`/admission/admissions?page=${page}`);
  return response.data;
};

export const useAdmission = (page: number) => {
  return useQuery<IPagination<IAdmission>, Error>({
    queryKey: ['admission', page], 
    queryFn: () => getAdmission(page),
  });
};
