import api from '../../api';
import { useQuery } from '@tanstack/react-query';


interface ExamSchedule {
    id: number;
    region: number;
    date_of_exam: string; 
  }
  
  interface AdmissionExam {
    id: number;
    admission_major: number;
    subject: number;
    exam_dates: ExamSchedule[];
  }
  
  
  


const getAdmissionExamById = async (id: string | undefined): Promise<AdmissionExam> => {
  const response = await api.get(`/admission/exams/${id}/`);
  return response.data;
};

export function useAdmissionExamById(id: string | undefined) {
  return useQuery<AdmissionExam>({
    queryKey: ['admission_exams', id],
    queryFn: () => getAdmissionExamById(id),
    enabled: !!id, 
    
  });
}
