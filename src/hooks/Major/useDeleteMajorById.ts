import api from '../../api';
import { useDialogStore } from '../../store/dialog';
import { useInvalidateQueries } from '../useInvalidateQueries';
import { useSnackbar } from '../useSnackbar';
import { useMutation } from '@tanstack/react-query';

const deleteMajorById = async (id: number | undefined) => {
    const response = await api.delete(`/admission/majors/${id}/`);
    return response.data;
};
export function useDeleteMajorById() {
    const setOpen = useDialogStore(store => store.setOpen);
    const { invalidate } = useInvalidateQueries();
    const { call } = useSnackbar();
    return useMutation({
        mutationKey: ['deleted major'],
        mutationFn: (id: number | undefined) => deleteMajorById(id),
        onSuccess: () => {
            call('Major deleted');
            setOpen(false);
            invalidate('admission');
        },
        onError: () => {
            call('Error when deleting major ');
            setOpen(false);
            invalidate('major')
        },
    });
}
