import api from '../../api';
import { IAdmission } from '../../models/models';
import { useSnackbar } from '../useSnackbar';
import { useMutation, useQueryClient } from '@tanstack/react-query';


const editAdmissionById = async ({ id, data }: { id: string | undefined; data: IAdmission }) => {
    const response = await api.put(`/admission/admissions/${id}/`, data);
    return response.data;
};
export function useEditAdmissionById() {
    const queryClient = useQueryClient();
    const { call } = useSnackbar();
    return useMutation({
        mutationFn: editAdmissionById,
        onSuccess: () => {
            call('Admission edited');
            queryClient.invalidateQueries({ queryKey: ['admission'] });
            
        },
        onError: () => {
            call('Error when editing admission');
        },
    });
}
