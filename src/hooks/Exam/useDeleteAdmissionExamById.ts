import api from '../../api';
import { useDialogStore } from '../../store/dialog';
import { useInvalidateQueries } from '../useInvalidateQueries';
import { useSnackbar } from '../useSnackbar';
import { useMutation } from '@tanstack/react-query';

const deleteAdmissionExamById = async (id: number | undefined) => {
    const response = await api.delete(`/admission/exams/${id}/`);
    return response.data;
};
export function useDeleteAdmissionExamById() {
    const setOpen = useDialogStore(store => store.setOpen);
    const { invalidate } = useInvalidateQueries();
    const { call } = useSnackbar();
    return useMutation({
        mutationKey: ['deleted admission exam'],
        mutationFn: (id: number | undefined) => deleteAdmissionExamById(id),
        onSuccess: () => {
            call('Admission Exam deleted');
            setOpen(false);
            invalidate('admission_exams');
        },
        onError: () => {
            call('Error when deleting admission exams ');
            setOpen(false);
            invalidate('admission_exams')
        },
    });
}
