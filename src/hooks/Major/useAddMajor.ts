import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../api';

interface MajorFormValues {
  admission: number;
  order_number: number;
  quota: number;
  major: number;
  exams:Exam[]
}
interface ExamDate {
  region: string;
  date_of_exam: string; 
  subject: number;
}

interface Exam {
  admission_major: number;
  exam_dates: ExamDate[];
}

export const useAddMajor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMajor: MajorFormValues) => {
      return await api.post('/admission/majors/', newMajor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission'] });
    },
  });
};
