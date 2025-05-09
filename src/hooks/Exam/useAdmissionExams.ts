import { useQuery } from '@tanstack/react-query';
import api from '../../api';

export interface Admission {
    id: number;
    academic_year: string;
    start_date: string;
    end_date: string;
    majors: Major[];
  }
  
  export interface Major {
    id: number;
    major: number;
    major_name: string;
    order_number: number;
    quota: number;
    exams: IExam;
  }
  
  export interface IExam {
    id: number;
    subject: string;
  }
  

const getAdmissionExams = async (
  id: number,
): Promise<Admission> => {
  const response = await api.get(`/admission/admissions/${id}/exams/`);
  return response.data; 
};


export const useAdmissionExams = (id: number) => {
  return useQuery<Admission, Error>({
    queryKey: ['admission_exams', id],
    queryFn: () => getAdmissionExams(id),
    enabled: !!id,
  });
};
