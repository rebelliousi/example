import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../api';

interface AdmissionFormValues {
  academic_year: string;
  start_date: string;
  end_date: string;
}

export const useAddAdmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAdmission: AdmissionFormValues) => {
      return await api.post('/admission/admissions/', newAdmission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission'] });
    
    },
  });
};
