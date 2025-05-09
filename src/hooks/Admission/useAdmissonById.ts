import api from '../../api';
import { useQuery } from '@tanstack/react-query';
import { IAdmissionId } from '../../models/models';


const getAdmissionById = async (id: string | undefined): Promise<IAdmissionId> => {
  const response = await api.get(`/admission/admissions/${id}/`);
  return response.data;
};

export function useAdmissionById(id: string | undefined) {
  return useQuery<IAdmissionId>({
    queryKey: ['admission', id],
    queryFn: () => getAdmissionById(id),
    enabled: !!id, 
    
  });
}
