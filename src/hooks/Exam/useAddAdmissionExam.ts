import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';

export interface ExamDate {
    region: "ashgabat" | "ahal" | "balkan" | "dashoguz" | "lebap" | "mary";
    date_of_exam: string;
    subject: number;
}
  
  export interface AdmissionData {
    admission_major: number;
    exam_dates: ExamDate[];
  }
export const useAddAdmissionExam = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newExam: AdmissionData) => {
            return await api.post('/admission/exams/', newExam);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admission_exams'] });
        },
    });
};