import { useQuery } from '@tanstack/react-query';

import api from '../../api';
import { IMajor } from '../../models/models';


const getMajor = async (): Promise<IMajor> => {
  const response = await api.get(`/majors/`);
  return response.data;
};

export const useMajor = () => {
  return useQuery<IMajor>({
    queryKey: ['major'], 
    queryFn: () => getMajor(),
  });
};
