import api from '../../api';
import { useQuery } from '@tanstack/react-query';

export interface IStaffId {
    id: number;
    admission: number;
    place: number;
    role: 'DIRECTOR' | 'REGISTRAR';
    staff: number;
  }
  
  


const getAdmissionStaffById = async (id: string | undefined): Promise<IStaffId> => {
  const response = await api.get(`/admission/staff/${id}/`);
  return response.data;
};

export function useAdmissionStaffById(id: string | undefined) {
  return useQuery<IStaffId>({
    queryKey: ['staff', id],
    queryFn: () => getAdmissionStaffById(id),
    enabled: !!id, 
    
  });
}
