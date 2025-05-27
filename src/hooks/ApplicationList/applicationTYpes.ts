// applicationTypes.ts
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
    files: number[];
  }

  export interface Guardian {
    id: number;
    relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt';
    first_name: string;
    last_name: string;
    father_name: string;
    date_of_birth: string;
    place_of_birth: string;
    phone: string;
    address: string;
    work_place: string;
    documents: number[]; // sadece ID'ler varsa
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
    documents: Document[]; // tüm document objeleri varsa
  }

  export interface Institution {
    id: number;
    application?: number;
    name: string;
    school_gpa: number;
    graduated_year: number;
    certificates: number[]; // belge ID'leri
  }

  export interface Olympic {
    id: number;
    application?: number;
    type: 'area' | 'region' | 'state' | 'international' | 'other';
    description: string;
    files: number[];
  }

  export interface IApplication {
    id: number;
    primary_major: number;
    admission_major: number[];
    user: ApplicationUser;
    guardians: Guardian[]; // user.guardians ile aynıysa burası kaldırılabilir
    institutions: Institution[];
    olympics: Olympic[];
    documents: Document[];
  }