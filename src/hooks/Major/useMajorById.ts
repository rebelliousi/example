import api from '../../api';
import { useQuery } from '@tanstack/react-query';


export interface ExamDate {
    id: number;
    region: number;
    date_of_exam: string;
    subject: number;
    admission_exam: number;
  }
  
  export interface Exam {
    id: number;
    admission_major: number;
    admission_major_name: string;
    exam_dates: ExamDate[];
  }
  
  export interface ExamListResponse {
    exams: Exam[];
    admission: number;
  }
  


const getMajorById = async (id: string | undefined): Promise<ExamListResponse> => {
  const response = await api.get(`/admission/majors/${id}/`);
  return response.data;
};

export function useMajorById(id: string | undefined) {
  return useQuery<ExamListResponse>({
    queryKey: ['major', id],
    queryFn: () => getMajorById(id),
    enabled: !!id, 
    
  });
}
