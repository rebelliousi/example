import {
  RelationType,
  Degree,
  Gender,
  OlympicAwardType,
  MilitaryStatus,
  ApplicationStatus,
} from './enum'; // kendi yoluna göre import et

import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';


export interface Guardian {
  id: number;
  application: number;
  relation: RelationType;
  first_name: string;
  last_name: string;
  father_name: string;
  date_of_birth: string;
  place_of_birth: string;
  phone: string;
  address: string;
  work_place: string;
  passport: string;
}

export interface IApplication {
  degree: Degree;
  primary_major: number;
  admission_major: number[];
  first_name: string;
  last_name: string;
  father_name: string;
  gender: Gender;
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
  award: OlympicAwardType;
  award_description: string;
  award_certificate: string;
  military_service: MilitaryStatus;
  military_service_note: string;
  assign_job_by_sign: boolean;
  orphan: boolean;
  number: number;
  guardians: Guardian[];
  rejection_reason: string;
  date_approved: string;
  status: ApplicationStatus;
}


export const useAddApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newApplication: IApplication) => {
      const response = await api.post('/admission/application/', newApplication);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application'] });
    },
  });
};
