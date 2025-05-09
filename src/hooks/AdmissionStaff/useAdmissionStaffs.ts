import { useQuery } from '@tanstack/react-query';
import api from '../../api';

export interface IAdmissionPlace {
  id: number;
  admission: number;
  address: string;
  region: number;
  region_name: string;
  area: number;
  area_name: string;
}

export interface IAdmissionStaff {
  id: number;
  admission: number;
  place: IAdmissionPlace;
  role: 'DIRECTOR' | 'MEMBER' | string;
  staff: number;
  staff_name: string;
}

export interface IAdmissionData {
  id: number;
  academic_year: number;
  start_date: string;
  end_date: string;
  admission_staffs: IAdmissionStaff[];
}

const getAdmissionStaffs = async (id: number): Promise<IAdmissionData> => {
  const response = await api.get(`/admission/admissions/${id}/staffs/`);
  return response.data;
};

export const useAdmissionStaffs = (id: number) => {
  return useQuery<IAdmissionData, Error>({
    queryKey: ['admission_staff', id],
    queryFn: () => getAdmissionStaffs(id),
    enabled: !!id,
  });
};
