import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../api';

export interface IExamSubjectPost {
  name:string
}

export const useAddExamSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newExamSubject: IExamSubjectPost) => {
      return await api.post('/admission/subject/', newExamSubject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam_subjects'] });
    },
  });
};
