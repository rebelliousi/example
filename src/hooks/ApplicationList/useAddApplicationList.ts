import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api";

export interface Guardian {
  relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt';
  first_name: string;
  last_name: string;
  father_name: string;
  date_of_birth: string;
  place_of_birth: string;
  phone: string;
  address: string;
  work_place: string;
  documents: GuardianDocument[];
}

export interface Institution {
  application?: number;
  name: string;
  school_gpa: number;
  graduated_year: number;
  certificates: number[];  
}

export interface Olympic {
  application?: number;
  type: 'area' | 'region' | 'state' | 'international' | 'other';
  description: string;
  files: number[];
}

export interface Document {
  type:
    | 'school_certificate'
    | 'passport'
    | 'military_document'
    | 'information'
    | 'relationship_tree'
    | 'medical_record'
    | 'description'
    | 'terjiimehal'
    | 'labor_book'
    | 'Dushundirish';  // API örneğinde vardı, ekledim
  file: number | null;
}

export interface GuardianDocument {
  type:
    | 'passport'
    | 'military_document'
    | 'relationship_tree'
    | 'medical_record'
    | 'description'
    | 'terjiimehal'
    | 'labor_book'
    | 'Dushundirish'
      ;  // API örneğinde vardı, ekledim
  file: number | null;
}

export interface ApplicationUser {
  username?: string;
  first_name: string;
  last_name: string;
  father_name: string;
  area: number;
  gender: 'male' | 'female';
  nationality: string;
  date_of_birth : string;
  address: string;
  place_of_birth: string;
  home_phone: string;
  phone: string;
  email: string;
}

export interface IApplication {
  primary_major: number;
  admission_major: number[];
  user: ApplicationUser;
  guardians: Guardian[];
  institutions: Institution[];
  olympics: Olympic[];
  documents: Document[];
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
