import { useQuery } from "@tanstack/react-query";
import api from "../../api";

export interface Admission {
  id: number;
  start_date: string;
  end_date: string;
  year: string;
}

export interface GenderStat {
  user__gender: 'male' | 'female';
  count: number;
  percentage: number;
}

export interface ApplicationStatus {
  status: "PENDING" | "APPROVED" | "REJECTED";
  count: number;
}

export interface RegionApplication {
  user__area__region: "ashgabat" | "ahal" | "balkan" | "dashoguz" | "lebap" | "mary" | null; 
  count: number;
}

export interface MajorGenderStat { 
    user__gender: 'male' | 'female';
    count: number;
    percentage: number;
}


export interface Major {
  id: number;
  major: string;
  order_number: number;
  quota: number;
  application_count: number;
  fill_percentage: number;
  regions: Record<string, number>;
  gender?: MajorGenderStat[]; 
}

export interface MilitaryStatus {
  military_service: 'female' | 'served' | 'not_served' | ''; 
  count: number;
}

export interface Degree {
  degree: 'bachelor' | 'master' | ''; 
  count: number;
}

export interface SpecialCases {
  vip_count: number;
  orphan_count: number;
}

export interface AdmissionStatistics {
  admission: Admission;
  gender_stats: GenderStat[];
  total_applications: number;
  application_status: ApplicationStatus[];
  applications_by_region: RegionApplication[];
  majors: Major[];
  military_status: MilitaryStatus[];
  degrees: Degree[];
  special_cases: SpecialCases;
}

const getStatistics = async (): Promise<AdmissionStatistics> => {
  const response = await api.get(`/admission/statistics/`);
  return response.data;
};

export const useStatistics = () => {
  return useQuery<AdmissionStatistics>({
    queryKey: ['statistics'],
    queryFn: () => getStatistics(),
  });
};