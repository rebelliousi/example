import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api';




interface DocumentItem {
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
    file: number;
  }

interface Guardian {
    user: number; 
    relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt'; 
    first_name: string;
    last_name: string;
    work_place: string;
    father_name: string;
    date_of_birth: string;
    place_of_birth: string;
    phone: string;
    address: string;
    documents: DocumentItem[];
  }

interface Institution {
    application: number; 
    name: string;
    school_gpa: number;
    graduated_year: number;
    certificates: number[]; 
  }

interface OlympicAchievement {
    application: number; 
    type: 'area' | 'region' | 'state' | 'international' | 'other'; 
    description: string;
    files: number[]; 
  }

interface User {
    username: string;
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

interface Application {
    primary_major: number; 
    admission_major: number[]; 
    user: User;
    guardians: Guardian[];
    institutions: Institution[];
    olympics: OlympicAchievement[];
    documents: DocumentItem[];
    date_rejected: string; 
    rejection_reason: string;
    date_approved: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | string; 
  }


type ApplicationUpdate = Partial<Application>; 

interface MutationVariables {
  id: number;
  data: ApplicationUpdate;
}

export const useEditApplication = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, MutationVariables>({ 
    mutationFn: async ({ id, data }: MutationVariables) => {
      try {
        const response = await api.put(`/admission/application/${id}/`, data);
        return response.data; 
      } catch (error: any) {
      
        console.error("Error updating application:", error);
        throw error; 
      }
    },
    onSuccess: () => {
    
      queryClient.invalidateQueries({ queryKey: ['application'] });

    },
    onError: (error: Error) => {
  
      console.error("Failed to update application", error);
     
    },
  });
};