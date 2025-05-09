import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../api';

export interface IAdmissionPlacePost {
  admission: number;
  address: string;
  region: number;
  area: number;
}

export const useAddAdmissionPlaces = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPlace: IAdmissionPlacePost) => {
      return await api.post('/admission/places/', newPlace);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission_places'] });
    },
  });
};
