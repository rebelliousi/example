import api from '../../api';
import { useQuery } from '@tanstack/react-query';

export interface IPlaceId {
    id: number;
    admission: number;
    address: string;
    region: number;
    region_name: string;
    area: number;
    area_name: string;
  }
  
  
  


const getAdmissionPlaceById = async (id: string | undefined): Promise<IPlaceId> => {
  const response = await api.get(`/admission/places/${id}/`);
  return response.data;
};

export function useAdmissionPlaceById(id: string | undefined) {
  return useQuery<IPlaceId>({
    queryKey: ['place', id],
    queryFn: () => getAdmissionPlaceById(id),
    enabled: !!id, 
    
  });
}
