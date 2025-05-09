import api from '../../api';
import { useSnackbar } from '../useSnackbar';
import { useMutation, useQueryClient } from '@tanstack/react-query';



export interface MajorData {
  admission: number;
  order_number: number;
  quota: number;
  major: number;
}

const editMajorById = async ({
  id,
  data,
}: {
  id: string | undefined;
  data: MajorData;
}) => {
  const response = await api.put(`/admission/majors/${id}/`, data);
  return response.data;
};
export function useEditMajorById() {
  const queryClient = useQueryClient();
  const { call } = useSnackbar();
  return useMutation({
    mutationFn: editMajorById,
    onSuccess: () => {
      call('Major edited');
      queryClient.invalidateQueries({ queryKey: ['admission'] });
    },
    onError: () => {
      call('Error when editing major');
    },
  });
}
