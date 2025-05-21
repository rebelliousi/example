import api from '../../api';
import { useSnackbar } from '../useSnackbar';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface AdmissionPlaceData {
  admission: number;
  address: string;

  area: number;
}

const editAdmissionPlaceById = async ({
  id,
  data,
}: {
  id: string | undefined;
  data: AdmissionPlaceData;
}) => {
  const response = await api.put(`/admission/places/${id}/`, data);
  return response.data;
};
export function useEditAdmissionPlaceById() {
  const queryClient = useQueryClient();
  const { call } = useSnackbar();
  return useMutation({
    mutationFn: editAdmissionPlaceById,
    onSuccess: () => {
      call('Admission place edited');
      queryClient.invalidateQueries({ queryKey: ['admission_places'] });
    },
    onError: () => {
      call('Error when editing admission place');
    },
  });
}
