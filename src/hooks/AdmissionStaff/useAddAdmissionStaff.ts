import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../api';

export interface IStaffData {
  admission: number;
  place: number;
  role: 'DIRECTOR' | 'REGISTRAR';
  staff: number;
}

export const useAddAdmissionStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newStaff: IStaffData) => {
      return await api.post('/admission/staff/', newStaff);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission_staff'] });
    },
  });
};
