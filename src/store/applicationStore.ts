import { create } from 'zustand';

// ---------------------------
// 🔒 TYPES & INTERFACES
// ---------------------------

interface Certificate {
  id: number;
  name: string;
  path: string;
  order: number;
}

interface GeneralInformationForm {
  first_name: string;
  last_name: string;
  father_name: string;
  area: number | null;
  gender: 'male' | 'female' | null;
  nationality: string;
  date_of_birth: string;
  address: string;
  place_of_birth: string;
  home_phone: string;
  phone: string;
  email: string;
}

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
  | 'nika_haty'
  | 'death_certificate'
  | 'diploma'
  | 'relations';

export interface GuardianWithFiles {
  relation: string;
  first_name: string;
  last_name: string;
  father_name: string;
  date_of_birth: string;
  place_of_birth: string;
  phone: string;
  address: string;
  work_place: string;
  documents: { type: DocumentType; file: string; path: string }[];
  isDeceased?: boolean | null;
}

export interface EducationInformation {
  id?: number;
  name: string;
  school_gpa: number | null;
  graduated_year: number;
  certificates?: Certificate[];
  isUploading?: boolean;
}

export const OlympicType = {
  AREA: 'area',
  REGION: 'region',
  STATE: 'state',
  INTERNATIONAL: 'international',
  OTHER: 'other',
} as const;

export type OlympicTypeValue = typeof OlympicType[keyof typeof OlympicType];

export interface AwardInfo {
  id?: number;
  type: OlympicTypeValue | null;
  description: string | null;
  files: Array<Certificate>;
  isUploading: boolean;
}

// Backend'inizin kabul ettiği tüm degree tiplerini buraya ekleyin
export type AcceptedDegreeType = 'BACHELOR' | 'MASTER' ;

export interface ApplicationData {
  id: number;
  // Eğer backend'den de 'ASSOCIATE' veya 'PHD' geliyorsa, burayı da güncelleyebilirsiniz.
  // Şu anki durumda, AcceptedDegreeType daha genel olduğu için sorun olmayacaktır.
  degree?: 'BACHELOR' | 'MASTER'; 
  primary_major: number;
  admission_major: number[];
  user: any;
  institutions: any;
  olympics: any;
  date_rejected: string | null;
  rejection_reason: string;
  date_approved: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// ---------------------------
// 🏪 ZUSTAND STORE
// ---------------------------

interface ApplicationState {
  applicationData: ApplicationData | null;
  // degree alanının tipini güncelledik
  degree: AcceptedDegreeType | undefined; 
  primaryMajor: number | undefined;
  additionalMajors: number[];
  generalInformation: GeneralInformationForm;
  guardians: GuardianWithFiles[];
  educationInfos: EducationInformation[];
  awardInfos: AwardInfo[];
  clientId: number | null;

  setApplicationData: (data: ApplicationData | null) => void;
  // setDegree metodunun tipini güncelledik
  setDegree: (degree: AcceptedDegreeType | undefined) => void; 
  setPrimaryMajor: (major: number | undefined) => void;
  setAdditionalMajors: (majors: number[]) => void;
  setGeneralInformation: (data: GeneralInformationForm) => void;
  setGuardians: (
    data: GuardianWithFiles[] | ((prev: GuardianWithFiles[]) => GuardianWithFiles[])
  ) => void;
  setEducationInfos: (
    data: EducationInformation[] | ((prev: EducationInformation[]) => EducationInformation[])
  ) => void;
  setAwardInfos: (
    data: AwardInfo[] | ((prev: AwardInfo[]) => AwardInfo[])
  ) => void;
  setClientId: (clientId: number | null) => void;
  resetAll: () => void;
}

// ---------------------------
// ✨ Helper Creators
// ---------------------------

const createBlankGuardian = (relation: string): GuardianWithFiles => ({
  relation,
  first_name: '',
  last_name: '',
  father_name: '',
  date_of_birth: '',
  place_of_birth: '',
  phone: '',
  address: '',
  work_place: '',
  documents: [],
  isDeceased: null,
});

const createBlankEducationInfo = (): EducationInformation => ({
  name: '',
  school_gpa: null,
  graduated_year: 0,
  certificates: [],
  isUploading: false,
});

const createBlankAwardInfo = (): AwardInfo => ({
  type: null,
  description: '',
  files: [],
  isUploading: false,
});

// ---------------------------
// 🧠 Zustand Store
// ---------------------------

export const useApplicationStore = create<ApplicationState>((set) => ({
  applicationData: null,
  degree: undefined, // Başlangıç değeri de güncellenmiş tipi kullanıyor
  primaryMajor: undefined,
  additionalMajors: [],
  generalInformation: {
    first_name: '',
    last_name: '',
    father_name: '',
    area: null,
    gender: null,
    nationality: '',
    date_of_birth: '',
    address: '',
    place_of_birth: '',
    home_phone: '',
    phone: '',
    email: '',
  },
  guardians: [createBlankGuardian('father'), createBlankGuardian('mother')],
  educationInfos: [createBlankEducationInfo()],
  awardInfos: [createBlankAwardInfo()],
  clientId: null,

  setApplicationData: (data) => set((state) => ({
    ...state,
    applicationData: data,
    // data?.degree'nin tipi ('BACHELOR' | 'MASTER') AcceptedDegreeType'ın bir alt kümesi olduğu için
    // burada doğrudan atama yapabiliriz. Eğer data?.degree AcceptedDegreeType'tan daha farklı bir tipteyse
    // (örn: string), o zaman 'as AcceptedDegreeType | undefined' ile cast etmek gerekebilir.
    degree: data?.degree, 
    primaryMajor: data?.primary_major,
    additionalMajors: data?.admission_major || [],
    educationInfos: data?.institutions?.map((inst: any) => ({
      id: inst.id,
      name: inst.name,
      school_gpa: inst.school_gpa,
      graduated_year: inst.graduated_year,
      certificates: inst.certificates || [],
      isUploading: false,
    })) || [createBlankEducationInfo()],
    awardInfos: data?.olympics?.map((olympic: any) => ({
      id: olympic.id,
      type: olympic.type,
      description: olympic.description,
      files: olympic.files || [],
      isUploading: false,
    })) || [createBlankAwardInfo()],
  })),

  setDegree: (degree) => set({ degree }), // Bu metod artık doğru tipi bekliyor
  setPrimaryMajor: (major) => set({ primaryMajor: major }),
  setAdditionalMajors: (majors) => set({ additionalMajors: majors }),
  setGeneralInformation: (data) => set({ generalInformation: data }),

  setGuardians: (dataOrUpdater) =>
    set((state) => ({
      guardians: typeof dataOrUpdater === 'function'
        ? dataOrUpdater(state.guardians)
        : dataOrUpdater,
    })),

  setEducationInfos: (dataOrUpdater) =>
    set((state) => ({
      educationInfos: typeof dataOrUpdater === 'function'
        ? dataOrUpdater(state.educationInfos)
        : dataOrUpdater,
    })),

  setAwardInfos: (dataOrUpdater) =>
    set((state) => ({
      awardInfos: typeof dataOrUpdater === 'function'
        ? dataOrUpdater(state.awardInfos)
        : dataOrUpdater,
    })),

  setClientId: (clientId) => set({ clientId }),

  resetAll: () =>
    set({
      applicationData: null,
      degree: undefined, // Reset değeri de güncellenmiş tipi kullanıyor
      primaryMajor: undefined,
      additionalMajors: [],
      generalInformation: {
        first_name: '',
        last_name: '',
        father_name: '',
        area: null,
        gender: null,
        nationality: '',
        date_of_birth: '',
        address: '',
        place_of_birth: '',
        home_phone: '',
        phone: '',
        email: '',
      },
      guardians: [createBlankGuardian('father'), createBlankGuardian('mother')],
      educationInfos: [createBlankEducationInfo()],
      awardInfos: [createBlankAwardInfo()],
      clientId: null,
    }),
}));