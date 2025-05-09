import { useQuery } from '@tanstack/react-query';
import { IPagination, IStaff } from '../../models/models';
import api from '../../api';


const getStaffs = async (page: number): Promise<IPagination<IStaff>> => {
  const response = await api.get(`/staff?page=${page}`);
  return response.data;
};

export const useStaffs = (page: number) => {
  return useQuery<IPagination<IStaff>, Error>({
    queryKey: ['staffs', page], 
    queryFn: () => getStaffs(page),
  });
};
