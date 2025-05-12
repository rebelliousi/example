import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../api';
// ENUMS



export interface Guardian {
  id: number;
  application: number;
  relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt';
  first_name: string;
  last_name: string;
  father_name: string;
  date_of_birth: string; // format: YYYY-MM-DD
  place_of_birth: string;
  phone: string;
  address: string;
  work_place:string;
  passport:string
}

export interface IApplication {
  degree: 'BACHELOR' | 'MASTER';
  primary_major: number;
  admission_major: number[];
  first_name: string;
  last_name: string;
  father_name: string;
  gender: 'MALE' | 'FEMALE';
  nationality: string;
  date_of_birth: string; // format: YYYY-MM-DD
  area: number;
  address: string;
  place_of_birth: string;
  home_phone: string;
  cell_phone: string;
  email: string;
  serial_number: string;
  document_number: string;
  given_date: string; // format: YYYY-MM-DD
  given_by: string;
  passport: string;
  school_name: string;
  school_graduated_year: number;
  school_gpa: number;
  region_of_school: number;
  district_of_school: string;
  certificate_of_school: string;
  award: 'area' | 'region' | 'state' | 'international' | 'other';
  award_description: string;
  award_certificate: string;
  military_service: 'female' | 'served' | 'not_served';
  military_service_note: string;
  assign_job_by_sign: boolean;
  orphan: boolean;
  number: number;
  guardians: Guardian[];
  rejection_reason: string;
  date_approved: string; // format: ISO string
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
