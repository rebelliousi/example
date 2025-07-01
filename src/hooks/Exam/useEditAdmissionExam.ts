import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../useSnackbar";
import api from "../../api";

export interface ExamDate {
  region: "ashgabat" | "ahal" | "balkan" | "dashoguz" | "lebap" | "mary";
  date_of_exam: string;
}

export interface Exam {
  admission_major: number;
  subject: number[];
  exam_dates: ExamDate[];
}

export interface AdmissionData {
  admission?: number;
  major?: number;
  order_number?: number;
  quota?: number;
  exams: Exam[];
}

const editAdmissionExamById = async ({
  id,
  data,
}: {
  id: string;
  data: AdmissionData;
}) => {
  const response = await api.put(`/admission/exam_update/${id}/`, data);
  return response.data;
};

export function useEditAdmissionExamById() {
  const queryClient = useQueryClient();
  const { call } = useSnackbar();

  return useMutation({
    mutationFn: editAdmissionExamById,
    onSuccess: () => {
      call('Admission exam edited successfully');
      queryClient.invalidateQueries({ queryKey: ['admission_exams'] });
    },
    onError: () => {
      call('Error when editing admission exam',);
    },
  });
}