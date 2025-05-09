import api from '../../api';
import { useSnackbar } from '../useSnackbar';
import { useMutation, useQueryClient } from '@tanstack/react-query';


export interface IAdmissionStaffInput {
  admission: number;
  place: number;
  role: 'DIRECTOR' | 'REGISTRAR';
  staff: number;
}


const editAdmissionStaffById = async ({
  id,
  data,
}: {
  id: string | undefined;
  data: IAdmissionStaffInput;
}) => {
  const response = await api.put(`/admission/staff/${id}/`, data);
  return response.data;
};
export function useEditAdmissionStaffById() {
  const queryClient = useQueryClient();
  const { call } = useSnackbar();
  return useMutation({
    mutationFn: editAdmissionStaffById,
    onSuccess: () => {
      call('Admission staff edited');
      queryClient.invalidateQueries({ queryKey: ['admission_staff'] });
    },
    onError: () => {
      call('Error when editing admission staff');
    },
  });
}
