import { useQuery } from '@tanstack/react-query';
import api from '../../api';

export interface IPlace {
  id: number;
  admission: number;
  address: string;
  region: number;
  region_name: string;
  area: number;
  area_name: string;
}

export interface AcademicSession {
  id: number;
  academic_year: number;
  start_date: string;
  end_date: string;
  places: IPlace[];
}

const getAdmissionPlaces = async (
  id: number,
): Promise<AcademicSession> => {
  const response = await api.get(`/admission/admissions/${id}/places/`);
  return response.data; 
};


export const useAdmissionPlaces = (id: number) => {
  return useQuery<AcademicSession, Error>({
    queryKey: ['admission_places', id],
    queryFn: () => getAdmissionPlaces(id),
    enabled: !!id,
  });
};
