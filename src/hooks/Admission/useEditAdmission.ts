import api from '../../api';
import { IAdmission } from '../../models/models';

import { useMutation, useQueryClient } from '@tanstack/react-query';


const editAdmissionById = async ({ id, data }: { id: string | undefined; data: IAdmission }) => {
    const response = await api.put(`/admission/admissions/${id}/`, data);
    return response.data;
};
export function useEditAdmissionById() {
    const queryClient = useQueryClient();
  
    return useMutation({
        mutationFn: editAdmissionById,
        onSuccess: () => {
           
            queryClient.invalidateQueries({ queryKey: ['admission'] });
            
        }
    });
}
