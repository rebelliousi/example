
export interface IconProps extends React.SVGProps<SVGSVGElement>{
  size?:number;
  className?:string;
}


export interface IPagination<T> {
  count: number; 
  next: string | null; 
  previous: string | null; 
  results: T[]; 
}

export interface IAdmission {
  id?: number |string;
  academic_year: number;
  start_date: string;
  end_date: string;
}

export interface IAdmissionPlaces{
  admission: number;
  address: string;
  region: number;
  region_name: string;
  area: number;
  area_name: string;
  id:number
}
export interface IAdmissionStaff {
  admission: number;
  place: IAdmissionPlaces;
  role: 'DIRECTOR'|'REGISTRAR';
  staff: number;
  staff_name: string;
  id:number
}

export interface IStaff {
  id: number;
  name: string;
  roles: string[];
  sectors: string[];
  role_types: string[];
  shift_time: string;
  department: string;
}

export interface IArea {
  id: number;
  name: string;
  type: string; 
  region: number;
}

export interface IRegions {
  id: number;
  number: number;
  name: string;
}


export interface IAcademicYear {
  id?: number;
  date_start: string;  
  date_end: string;
  is_active?: boolean;
}

export interface IAdmissionMajor {
  id: number;
  major: number;
  major_name: string;
  order_number: number;
  quota: number;
  
}

export interface IAdmissionId {
  id: number;
  academic_year: string;
  start_date: string;
  end_date: string;
  majors: IAdmissionMajor[];
}


interface MajorResponse {
  id: number;
  short_name: string;
  name: string;
  number: number;
  degree: number;
  department: number;
  category: number;
}

export interface IMajor {
  count: number;
  next: string | null;
  previous: string | null;
  results: MajorResponse[];

}



