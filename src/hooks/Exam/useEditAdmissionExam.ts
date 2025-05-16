import api from '../../api';
import { useSnackbar } from '../useSnackbar';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface ExamDate {
    region: "ashgabat" | "ahal" | "balkan" | "dashoguz" | "lebap" | "mary";
    date_of_exam: string;
    subject: number;
}
  
  export interface AdmissionData {
    admission_major: number;
    exam_dates: ExamDate[];
  }

const editAdmissionExamById = async ({
  id,
  data,
}: {
  id: string | undefined;
  data: AdmissionData;
}) => {
  const response = await api.put(`/admission/exams/${id}/`, data);
  return response.data;
};
export function useEditAdmissionExamById() {
  const queryClient = useQueryClient();
  const { call } = useSnackbar();
  return useMutation({
    mutationFn: editAdmissionExamById,
    onSuccess: () => {
      call('Admission exam edited');
      queryClient.invalidateQueries({ queryKey: ['admission_exams'] });
    },
    onError: () => {
      call('Error when editing admission exam');
    },
  });
}
