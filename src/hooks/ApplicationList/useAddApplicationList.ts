import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../api';
export interface Guardian {
  id: number;
  application: number;
  relation: string;
  first_name: string;
  last_name: string;
  father_name: string;
  date_of_birth: string; // ISO string formatında tarih
  place_of_birth: string;
  phone: string;
  address: string;
}

export interface IApplication {
  degree: string;
  first_name: string;
  last_name: string;
  gender: string;
  nationality: string;
  date_of_birth: string;
  area: number;
  address: string;
  place_of_birth: string;
  home_phone: string;
  cell_phone: string;
  email: string;
  serial_number: string;
  document_number: string;
  given_date: string;
  given_by: string;
  passport: string;
  school_name: string;
  school_graduated_year: number;
  school_gpa: number;
  region_of_school: number;
  district_of_school: string;
  certificate_of_school: string;
  award: string;
  award_description: string;
  award_certificate: string;
  military_service: string;
  military_service_note: string;
  assign_job_by_sign: boolean;
  orphan: boolean;
  number: number;
  guardians: Guardian[];
  rejection_reason: string;
  date_approved: string; // ISO string formatında tarih
  status: string;
}

  

export const useAddApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newApplication: IApplication) => {
      return await api.post('/admission/application/', newApplication);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application'] });
    },
  });
};
