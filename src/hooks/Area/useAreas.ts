import { useQuery } from '@tanstack/react-query';
import { IArea, IPagination } from '../../models/models';
import api from '../../api';

const getArea = async (): Promise<IPagination<IArea>> => {
  const response = await api.get(`/regions/area/`);
  return response.data;
};

export const useArea = () => {
  return useQuery<IPagination<IArea>, Error>({
    queryKey: ['area'],
    queryFn: () => getArea(),
  });
};
