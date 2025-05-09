import { useQuery } from '@tanstack/react-query';

import api from '../../api';
import { IAcademicYear } from '../../models/models';


const getAcademicYear = async (): Promise<IAcademicYear[]> => {
  const response = await api.get(`/academic_years/`);
  return response.data;
};

export const useAcademicYear = () => {
  return useQuery<IAcademicYear[]>({
    queryKey: ['academicYear'], 
    queryFn: () => getAcademicYear(),
  });
};
