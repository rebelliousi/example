export interface DocumentItem {
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
    | 'Dushundirish'; // e.g., "Dushundirish"
  file: number; //  Presumably a file ID or reference
}

export interface Guardian {
  user: number; // Reference to a User ID (likely)
  relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt'; // e.g., "mother", "father"
  first_name: string;
  last_name: string;
  work_place: string;
  father_name: string; //  This seems a bit odd in a guardian record... maybe a typo?
  date_of_birth: string; //  ISO 8601 date string, e.g., "2025-05-31"
  place_of_birth: string;
  phone: string;
  address: string;
  documents: DocumentItem[];
}

export interface Institution {
  application: number; //  Reference to the application (likely)
  name: string;
  school_gpa: number;
  graduated_year: number;
  certificates: number[]; // Array of certificate IDs (likely)
}

export interface OlympicAchievement {
  application: number; // Reference to the application
  type: 'area' | 'region' | 'state' | 'international' | 'other'; // e.g., "area", "national", "international"
  description: string;
  files: number[]; // Array of file IDs
}

export interface User {
  username: string;
  first_name: string;
  last_name: string;
  father_name: string;
  area: number;
  gender: 'male' | 'female'; // e.g., "male", "female", "other"
  nationality: string;
  date_of_birth: string; // ISO 8601 date string
  address: string;
  place_of_birth: string;
  home_phone: string;
  phone: string;
  email: string;
}

export interface Application {
  primary_major: number; // Reference to a major ID
  admission_major: number[]; // Array of major IDs
  user: User;
  guardians: Guardian[];
  institutions: Institution[];
  olympics: OlympicAchievement[];
  documents: DocumentItem[];
  date_rejected: string; // ISO 8601 date-time string, e.g., "2025-05-31T07:25:21.608Z"
  rejection_reason: string;
  date_approved: string; // ISO 8601 date-time string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string; //  Consider using a stricter enum
}
