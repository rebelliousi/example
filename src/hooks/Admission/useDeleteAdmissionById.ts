import api from '../../api';
import { useDialogStore } from '../../store/dialog';
import { useInvalidateQueries } from '../useInvalidateQueries';
import { useSnackbar } from '../useSnackbar';
import { useMutation } from '@tanstack/react-query';

const deleteAdmissionById = async (id: number | undefined) => {
    const response = await api.delete(`/admission/admissions/${id}/`);
    return response.data;
};
export function useDeleteAdmissionById() {
    const setOpen = useDialogStore(store => store.setOpen);
    const { invalidate } = useInvalidateQueries();
    const { call } = useSnackbar();
    return useMutation({
        mutationKey: ['deleted admission'],
        mutationFn: (id: number | undefined) => deleteAdmissionById(id),
        onSuccess: () => {
            call('Admission deleted');
            setOpen(false);
            invalidate('admission');
        },
        onError: () => {
            call('Error when deleting academic year ');
            setOpen(false);
            invalidate('academic year')
        },
    });
}
