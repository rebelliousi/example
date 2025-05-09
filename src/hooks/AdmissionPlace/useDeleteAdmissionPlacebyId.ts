import api from '../../api';
import { useDialogStore } from '../../store/dialog';
import { useInvalidateQueries } from '../useInvalidateQueries';
import { useSnackbar } from '../useSnackbar';
import { useMutation } from '@tanstack/react-query';

const deleteAdmissionPlaceById = async (id: number | undefined) => {
    const response = await api.delete(`/admission/places/${id}/`);
    return response.data;
};
export function useDeleteAdmissionPlaceById() {
    const setOpen = useDialogStore(store => store.setOpen);
    const { invalidate } = useInvalidateQueries();
    const { call } = useSnackbar();
    return useMutation({
        mutationKey: ['deleted admission place'],
        mutationFn: (id: number | undefined) => deleteAdmissionPlaceById(id),
        onSuccess: () => {
            call('Admission Place deleted');
            setOpen(false);
            invalidate('admission_places');
        },
        onError: () => {
            call('Error when deleting admission place ');
            setOpen(false);
            invalidate('admission_places')
        },
    });
}
