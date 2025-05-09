import { useQuery } from '@tanstack/react-query';
import { IPagination, IRegions } from '../../models/models';
import api from '../../api';

const getRegions = async (): Promise<IPagination<IRegions>> => {
  const response = await api.get(`/regions/region/`);
  return response.data;
};

export const useRegions = () => {
  return useQuery<IPagination<IRegions>, Error>({
    queryKey: ['regions'],
    queryFn: () => getRegions(),
  });
};
