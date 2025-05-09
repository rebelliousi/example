import api from '../../api';
import { useDialogStore } from '../../store/dialog';
import { useInvalidateQueries } from '../useInvalidateQueries';
import { useSnackbar } from '../useSnackbar';
import { useMutation } from '@tanstack/react-query';

const deleteAdmissionStaffById = async (id: number | undefined) => {
    const response = await api.delete(`/admission/staff/${id}/`);
    return response.data;
};
export function useDeleteAdmissionStaffById() {
    const setOpen = useDialogStore(store => store.setOpen);
    const { invalidate } = useInvalidateQueries();
    const { call } = useSnackbar();
    return useMutation({
        mutationKey: ['deleted admission staff'],
        mutationFn: (id: number | undefined) => deleteAdmissionStaffById(id),
        onSuccess: () => {
            call('Admission Staff deleted');
            setOpen(false);
            invalidate('admission_staff');
        },
        onError: () => {
            call('Error when deleting admission staff ');
            setOpen(false);
            invalidate('admission_staff')
        },
    });
}
