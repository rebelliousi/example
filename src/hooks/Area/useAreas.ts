import { useQuery } from '@tanstack/react-query';
import {  IPagination } from '../../models/models';
import api from '../../api';


export interface IArea {
  id: number;
  name: string;
  type: string; 
   region: "ashgabat" | "ahal" | "balkan" | "dashoguz" | "lebap" | "mary";
}

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
