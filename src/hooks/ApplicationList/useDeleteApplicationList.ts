import api from '../../api';
import { useDialogStore } from '../../store/dialog';
import { useInvalidateQueries } from '../useInvalidateQueries';
import { useSnackbar } from '../useSnackbar';
import { useMutation } from '@tanstack/react-query';

const deleteApplicationById = async (id: number | undefined) => {
    const response = await api.delete(`/admission/application/${id}/`);
    return response.data;
};
export function useDeleteApplicationById() {
    const setOpen = useDialogStore(store => store.setOpen);
    const { invalidate } = useInvalidateQueries();
    const { call } = useSnackbar();
    return useMutation({
        mutationKey: ['deleted application'],
        mutationFn: (id: number | undefined) => deleteApplicationById(id),
        onSuccess: () => {
            call('Application deleted');
            setOpen(false);
            invalidate('application');
        },
        onError: () => {
            call('Error when deleting application ');
            setOpen(false);
            invalidate('application')
        },
    });
}
