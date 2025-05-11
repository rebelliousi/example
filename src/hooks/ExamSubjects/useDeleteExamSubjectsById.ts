import api from '../../api';
import { useDialogStore } from '../../store/dialog';
import { useInvalidateQueries } from '../useInvalidateQueries';
import { useSnackbar } from '../useSnackbar';
import { useMutation } from '@tanstack/react-query';

const deleteExamSubjectsById = async (id: number | undefined) => {
    const response = await api.delete(`/admission/subject/${id}/`);
    return response.data;
};
export function useDeleteExamSubjectsById() {
    const setOpen = useDialogStore(store => store.setOpen);
    const { invalidate } = useInvalidateQueries();
    const { call } = useSnackbar();
    return useMutation({
        mutationKey: ['deleted exam subjects'],
        mutationFn: (id: number | undefined) => deleteExamSubjectsById(id),
        onSuccess: () => {
            call('exam subjects deleted');
            setOpen(false);
            invalidate('exam_subjects');
        },
        onError: () => {
            call('Error when deleting exam subjects');
            setOpen(false);
            invalidate('exam_subjects')
        },
    });
}
