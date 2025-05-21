import { useQuery } from '@tanstack/react-query';
import api from '../../api';

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
  exam_dates: ExamDate[]; // Burayı dizi yaptım
}

export interface Major {
  id: number;
  major: number;
  major_name: string;
  order_number: number;
  quota: number;
  exams: Exam[];
}

export interface Admission {
  id: number;
  academic_year: string;
  start_date: string;
  end_date: string;
  majors: Major[];
}

const getAdmissionExams = async (id: number): Promise<Admission> => {
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
