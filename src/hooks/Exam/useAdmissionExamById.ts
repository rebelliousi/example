import api from '../../api';
import { useQuery } from '@tanstack/react-query';


export interface ExamDate {
  id: number;
  region: "ashgabat" | "ahal" | "balkan" | "dashoguz" | "lebap" | "mary";
  date_of_exam: string;
}

export interface AdmissionData {
  id: number;
  admission_major: number;
  subject: number[];
  exam_dates: ExamDate[];
}


const getAdmissionExamById = async (id: string | undefined): Promise<AdmissionData> => {
  const response = await api.get(`/admission/exams/${id}/`);
  return response.data;
};

// React Query Hook
export function useAdmissionExamById(id: string | undefined) {
  return useQuery<AdmissionData>({
    queryKey: ['admission_exams', id],
    queryFn: () => getAdmissionExamById(id),
    enabled: !!id,
  });
}
