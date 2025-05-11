import api from '../../api';
import { useSnackbar } from '../useSnackbar';
import { useMutation, useQueryClient } from '@tanstack/react-query';



export interface ExamSubjectData {
 name:string
  }
  

const editExamSubjectById = async ({
  id,
  data,
}: {
  id: string | undefined;
  data: ExamSubjectData;
}) => {
  const response = await api.put(`/admission/subject/${id}/`, data);
  return response.data;
};
export function useEditExamSubjectById() {
  const queryClient = useQueryClient();
  const { call } = useSnackbar();
  return useMutation({
    mutationFn: editExamSubjectById,
    onSuccess: () => {
      call('Exam subject edited');
      queryClient.invalidateQueries({ queryKey: ['exam_subjects'] });
    },
    onError: () => {
      call('Error when editing exam subject');
    },
  });
}
