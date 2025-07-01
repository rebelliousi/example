import { useQuery } from '@tanstack/react-query';

import api from '../../api';
import { IMajor } from '../../models/models';



const getMajor = async (): Promise<IMajor> => {
  const response = await api.get(`/majors/`);
  console.log(response.data)
  return response.data;
};


export const useMajor = () => {
  return useQuery<IMajor>({
    queryKey: ['major'], 
    queryFn: () => getMajor(),
  });
};
