import { create } from 'zustand';

// ---------------------------
// 🔒 TYPES & INTERFACES
// ---------------------------

// General Information Form
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

// Guardian Form
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
  filePaths: string[];
  isDeceased?: boolean | null;
}

// Education Information Form
export interface EducationInformation {
  name: string;
  school_gpa: number | null;
  graduated_year: number;
  files: string[];
  filePaths: string[];

  isUploading?: boolean;
}

// Awards Information Form
export const OlympicType = {
  AREA: 'area',
  REGION: 'region',
  STATE: 'state',
  INTERNATIONAL: 'international',
  OTHER: 'other',
} as const;
export type OlympicTypeValue = typeof OlympicType[keyof typeof OlympicType];

export interface AwardInfo {
  type: OlympicTypeValue | null;
  description: string | null;
  files: string[];
  filePaths: string[];
  selectedFile: File | null;
  isUploading: boolean;
}

// Application Data (comes from backend)
export interface ApplicationData {
  id: number;
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
// 🏪 ZUSTAND STORE
// ---------------------------

interface ApplicationState {
  // STATE FIELDS
  applicationData: ApplicationData | null;
  degree: string | undefined;
  primaryMajor: number | undefined;
  additionalMajors: number[];
  generalInformation: GeneralInformationForm;
  guardians: GuardianWithFiles[];
  educationInfos: EducationInformation[];
  awardInfos: AwardInfo[];
  clientId: number | null;

  // ACTIONS
  setApplicationData: (data: ApplicationData | null) => void;
  setDegree: (degree: string | undefined) => void;
  setPrimaryMajor: (major: number | undefined) => void;
  setAdditionalMajors: (majors: number[]) => void;
  setGeneralInformation: (data: GeneralInformationForm) => void;
  setGuardians: (
    data:
      | GuardianWithFiles[]
      | ((prev: GuardianWithFiles[]) => GuardianWithFiles[])
  ) => void;
  setEducationInfos: (
    data:
      | EducationInformation[]
      | ((prev: EducationInformation[]) => EducationInformation[])
  ) => void;
  setAwardInfos: (
    data: AwardInfo[] | ((prev: AwardInfo[]) => AwardInfo[])
  ) => void;
  setClientId: (clientId: number | null) => void;
  resetAll: () => void;
}

// Factories for blank entries
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
  filePaths: [],
  isDeceased: null,
});

const createBlankEducationInfo = (): EducationInformation => ({
  name: '',
  school_gpa: null,
  graduated_year: 0,
  files: [],
  filePaths: [],

  isUploading: false,
});

const createBlankAwardInfo = (): AwardInfo => ({
  type: null,
  description: '',
  files: [],
  filePaths: [],
  selectedFile: null,
  isUploading: false,
});

export const useApplicationStore = create<ApplicationState>((set) => ({
  // ---------------------------
  // DEFAULT STATE
  // ---------------------------
  applicationData: null,
  degree: undefined,
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

  // ---------------------------
  // ACTION IMPLEMENTATIONS
  // ---------------------------
  setApplicationData: (data) => set({ applicationData: data }),
  setDegree: (degree) => set({ degree }),
  setPrimaryMajor: (major) => set({ primaryMajor: major }),
  setAdditionalMajors: (majors) => set({ additionalMajors: majors }),
  setGeneralInformation: (data) => set({ generalInformation: data }),

  // Guardians supports updater fn
  setGuardians: (dataOrUpdater) =>
    set((state) => ({
      guardians:
        typeof dataOrUpdater === 'function'
          ? dataOrUpdater(state.guardians)
          : dataOrUpdater,
    })),

  // EducationInfos supports updater fn
  setEducationInfos: (dataOrUpdater) =>
    set((state) => ({
      educationInfos:
        typeof dataOrUpdater === 'function'
          ? dataOrUpdater(state.educationInfos)
          : dataOrUpdater,
    })),

  // AwardInfos supports updater fn
  setAwardInfos: (dataOrUpdater) =>
    set((state) => ({
      awardInfos:
        typeof dataOrUpdater === 'function'
          ? dataOrUpdater(state.awardInfos)
          : dataOrUpdater,
    })),

  setClientId: (clientId) => set({ clientId }),

  // Reset everything back to initial values
  resetAll: () =>
    set({
      applicationData: null,
      degree: undefined,
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
