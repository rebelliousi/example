import api from '../../api';
import { useQuery } from '@tanstack/react-query';

export interface Subject {
  id: number;
  name: string;
}


export interface ExamDate {
  id: number;
  region: string;      
  date_of_exam: string;    
}


export interface Exam {
  id: number;
  subject: Subject[];    
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
