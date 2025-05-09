import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../api';

interface MajorFormValues {
  admission: number;
  order_number: number;
  quota: number;
  major: number;
}

export const useAddMajor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newMajor: MajorFormValues) => {
      return await api.post('/admission/majors/', newMajor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission'] });
    },
  });
};
