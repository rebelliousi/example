import { useQuery } from "@tanstack/react-query";
import api from "../../api";

export interface File {
  id: number;
  name: string;
  path: string;
  order: number;
}

export interface Document {
  id: number;
  type:
        | 'passport'
        | 'military_document'
        | 'relationship_tree'
        | 'medical_record'
        | 'description'
        | 'terjiimehal'
        | 'labor_book'
        | 'Dushundirish';
  file: File;
}

export interface Guardian {
  id: number;
  user: number; //  user ID
  relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt' | string;// Define possible values for relation
  first_name: string;
  last_name: string;
  work_place: string;
  father_name: string;
  date_of_birth: string;
  place_of_birth: string;
  phone: string;
  address: string;
  documents: Document[];
}



export interface User {
  username: string;
  first_name: string;
  last_name: string;
  father_name: string;
  area: number;
  gender: "male" | "female" ; // Define possible values for gender
  nationality: string;
  date_of_birth: string;
  address: string;
  place_of_birth: string;
  home_phone: string;
  phone: string;
  email: string;
  guardians: Guardian[];
  documents: Document[];
}

export interface Certificate {
  id: number;
  name: string;
  path: string;
  order: number;
}

export interface Institution {
  id: number;
  application: number; // application ID
  name: string;
  school_gpa: number;
  graduated_year: number;
  certificates: Certificate[];
}

export interface OlympicFile {
  id: number;
  name: string;
  path: string;
  order: number;
}

export interface Olympic {
  id: number;
  application: number;  // application ID
  type: 'area' | 'region' | 'state' | 'international' | 'other';   // Define possible values for type
  description: string;
  files: OlympicFile[];
}


export interface ApplicationData {
  id: number;
  primary_major: number;
  admission_major: number[];
  user: User;
  institutions: Institution[];
  olympics: Olympic[];
  date_rejected: string | null;  //  string or null
  rejection_reason: string;
  date_approved: string | null; // string or null
  status: "PENDING" | "APPROVED" | "REJECTED"; //  status string enum
}

// Renamed for clarity and consistency.  Using IApplicationData everywhere.
export type IApplicationData = ApplicationData;

const getApplicationById = async (id: string): Promise<IApplicationData> => { // id should not be optional
    const response = await api.get(`/admission/application/${id}/`);
    return response.data;
};

export function useApplicationById(id: string) {  // id should not be optional
    return useQuery<IApplicationData>({
        queryKey: ['application', id],
        queryFn: () => getApplicationById(id),
        enabled: true, //  'id' is required, so no need for a boolean check.  The query won't run if id is undefined/null at the hook level.
    });
}