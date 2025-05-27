import { useQuery } from '@tanstack/react-query';
import api from '../../api';




export interface FileItem {
  id: number;
  name: string;
  path: string;
  order: number;
}


export interface Document {
  id: number;
  owner_id?: number;
  owner?: number;
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
    | 'Dushundirish';
  files: FileItem[];
}


export interface Guardian {
  id: number;
  relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt' | string;
  first_name: string;
  last_name: string;
  father_name: string;
  date_of_birth: string;
  place_of_birth: string;
  phone: string;
  address: string;
  work_place: string;
  documents: Document[];
}

export interface Institution {
  id: number;
  application?: number;
  name: string;
  school_gpa: number;
  graduated_year: number;
  certificates: FileItem[]; 
}

export interface Olympic {
  id: number;
  application?: number;
  type: 'area' | 'region' | 'state' | 'international' | 'other';
  description: string;
  files: FileItem[];
}

export interface ApplicationUser {
  username?: string;
  first_name: string;
  last_name: string;
  father_name: string;
  area: number;
  gender: 'male' | 'female';
  nationality: string;
  date_of_birth: string;
  address: string;
  place_of_birth: string;
  home_phone: string;
  phone: string;
  email: string;
  guardians: Guardian[];
  documents?: Document[]; 
}


export interface IApplication {
  id: number;
  primary_major: number;
  admission_major: number[];
  user: ApplicationUser;
  institutions: Institution[];
  olympics: Olympic[];
  documents: Document[];
}


const getApplicationById = async (id: string | undefined): Promise<IApplication> => {
  const response = await api.get(`/admission/application/${id}/`);
  return response.data;
};


export function useApplicationById(id: string | undefined) {
  return useQuery<IApplication>({
    queryKey: ['application', id],
    queryFn: () => getApplicationById(id),
    enabled: !!id,
  });
}
