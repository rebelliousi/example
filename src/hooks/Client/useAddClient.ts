import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api";


export type GuardianRelation = 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt';
export type OlympicType = 'area' | 'region' | 'state' | 'international' | 'other';
export type DocumentType =
  | 'school_certificate'
  | 'passport'
  | 'military_document'
  | 'information'
  | 'relationship_tree'
  | 'medical_record'
  | 'description'
  | 'terjiimehal'
  | 'labor_book'
  | 'Dushundirish'
    'nika_haty'
    'death_certificate'
      'passport'
      'diploma'
      


export interface GuardianDocument {
  type: Exclude<DocumentType, 'school_certificate' | 'information'>;
  file: number | null;
}

export interface Guardian {
  relation: GuardianRelation;
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
  type: OlympicType;
  description: string;
  files: number[];
}

export interface Document {
  type: DocumentType;
  file: number | null;
}

export interface ClientUser {
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
}

export interface IClient {
  degree?: 'BACHELOR' | 'MASTER'; // API'de görüldüğü için ekledim
  primary_major: number;
  admission_major: number[];
  user: ClientUser;
  guardians: Guardian[];
  institutions: Institution[];
  olympics: Olympic[];
  documents: Document[];
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'; // API'de görüldüğü için ekledim
}

// Define the type for the API response.  Assuming the backend returns an object with an `id` property.
interface AddClientResponse {
  id: number;  //  Adjust the type of `id` if it's not a number.
  [key: string]: any; // Allow other properties (for flexibility)
}


export const useAddClient = () => {
  const queryClient = useQueryClient();

  return useMutation<AddClientResponse, Error, IClient>({  // Specify types for mutationFn response, error, and variables.
    mutationFn: async (newApplication: IClient) => {
      const response = await api.post<AddClientResponse>('/admission/application/', newApplication);  // Type the api.post response
       console.log('response:',response)
      return response.data;
     
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application'] });
    },
   

     


  
  });
};
