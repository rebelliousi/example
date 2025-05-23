// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import api from '../../api';

// export interface Guardian {
//   relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt';
//   first_name: string;
//   last_name: string;
//   father_name: string;
//   date_of_birth: string;
//   place_of_birth: string;
//   phone: string;
//   address: string;
//   work_place: string;
// }

// export interface Institution {
//   application?: number;
//   name: string;
//   school_gpa: number;
//   graduated_year: number;
//   certificate?: File | null;
// }

// export interface Olympic {
//   application?: number;
//   type: 'area' | 'region' | 'state' | 'international' | 'other';
//   description: string;
//   file?: File | null;
// }

// export interface Document {
//   owner?: number;
//   type: 'school_certificate' | 'passport' | 'military_document' | 'information' | 'relationship_tree' | 'medical_record' | 'description' | 'terjiimehal' | 'labor_book';
//   file?: File | null;
// }

// export interface ApplicationUser {
//   username?: string;
//   first_name: string;
//   last_name: string;
//   father_name: string;
//   area: number;
//   gender: 'male' | 'female';
//   nationality: string;
//   date_of_birth: string;
//   address: string;
//   place_of_birth: string;
//   home_phone: string;
//   phone: string;
//   email: string;
// }

// export interface IApplication {
//   primary_major: number;
//   admission_major: number[];
//   user: ApplicationUser;
//   guardians: Guardian[];
//   institutions: Institution[];
//   olympics: Olympic[];
//   documents: Document[];
// }

// export const useAddApplication = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (newApplication: IApplication) => {
//       const formData = new FormData();

//       // Kullanıcı bilgilerini ekle
//       for (const key in newApplication.user) {
//         formData.append(`user[${key}]`, String((newApplication.user as any)[key]));
//       }

//       // Diğer alanları ekle
//       formData.append('primary_major', String(newApplication.primary_major));
//       newApplication.admission_major.forEach((majorId) => {
//         formData.append('admission_major[]', String(majorId)); // Dizi olarak göndermek için [] kullan
//       });

//       // Guardians bilgilerini ekle
//       newApplication.guardians.forEach((guardian, index) => {
//         for (const key in guardian) {
//           formData.append(`guardians[${index}][${key}]`, (guardian as any)[key]);
//         }
//       });

//       // Institutions bilgilerini ekle ve dosyaları ekle
//       newApplication.institutions.forEach((institution, index) => {
//         for (const key in institution) {
//           if (key === 'certificate' && institution.certificate instanceof File) {
//             formData.append(`institutions[${index}][certificate]`, institution.certificate);
//           } else {
//             formData.append(`institutions[${index}][${key}]`, String((institution as any)[key]));
//           }
//         }
//       });

//       // Olympics bilgilerini ekle ve dosyaları ekle
//       newApplication.olympics.forEach((olympic, index) => {
//         for (const key in olympic) {
//           if (key === 'file' && olympic.file instanceof File) {
//             formData.append(`olympics[${index}][file]`, olympic.file);
//           } else {
//             formData.append(`olympics[${index}][${key}]`, (olympic as any)[key]);
//           }
//         }
//       });

//       // Documents bilgilerini ekle ve dosyaları ekle
//       newApplication.documents.forEach((document, index) => {
//         for (const key in document) {
//           if (key === 'file' && document.file instanceof File) {
//             formData.append(`documents[${index}][file]`, document.file);
//           } else {
//             formData.append(`documents[${index}][${key}]`, (document as any)[key]);
//           }
//         }
//       });

//       const response = await api.post('/admission/application/', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data', // Doğru Content-Type başlığını ayarla
//         },
//       });

//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['application'] });
//     },
//   });
// };















// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import api from '../../api';

// export interface Guardian {
//   relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt';
//   first_name: string;
//   last_name: string;
//   father_name: string;
//   date_of_birth: string;
//   place_of_birth: string;
//   phone: string;
//   address: string;
//   work_place: string;
// }

// export interface Institution {
//   application?: number;
//   name: string;
//   school_gpa: number;
//   graduated_year: number;
//   certificate?: File | null;
// }

// export interface Olympic {
//   application?: number;
//   type: 'area' | 'region' | 'state' | 'international' | 'other';
//   description: string;
//   file?: File | null;
// }

// export interface Document {
//   owner?: number;
//   type: 'school_certificate' | 'passport' | 'military_document' | 'information' | 'relationship_tree' | 'medical_record' | 'description' | 'terjiimehal' | 'labor_book';
//   file?: File | null;
// }

// export interface ApplicationUser {
//   username?: string;
//   first_name: string;
//   last_name: string;
//   father_name: string;
//   area: number;
//   gender: 'male' | 'female';
//   nationality: string;
//   date_of_birth: string;
//   address: string;
//   place_of_birth: string;
//   home_phone: string;
//   phone: string;
//   email: string;
// }

// export interface IApplication {
//   primary_major: number;
//   admission_major: number[];
//   user: ApplicationUser;
//   guardians: Guardian[];
//   institutions: Institution[];
//   olympics: Olympic[];
//   documents: Document[];
// }

// export const useAddApplication = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (newApplication: IApplication) => {
//       const formData = new FormData();

//       for (const key in newApplication.user) {
//         const value = String((newApplication.user as any)[key]);
//         formData.append(`user[${key}]`, value);
//         console.log(`user[${key}]`, value); 
//       }
   
//       formData.append('primary_major', String(newApplication.primary_major));
//       console.log('primary_major', newApplication.primary_major);

//       newApplication.admission_major.forEach((majorId) => {
//         formData.append('admission_major[]', String(majorId));
//         console.log('admission_major[]', majorId);
//       });
    
//      newApplication.guardians.forEach((guardian, index) => {
//         for (const key in guardian) {
//           const value = (guardian as any)[key];
//           formData.append(`guardians[${index}][${key}]`, value);
//           console.log(`guardians[${index}][${key}]`, value);
//         }
//       });

  
//       newApplication.institutions.forEach((institution, index) => {
//         for (const key in institution) {
//           if (key === 'certificate' && institution.certificate instanceof File) {
//             formData.append(`institutions[${index}][certificate]`, institution.certificate);
//             console.log(`institutions[${index}][certificate]`, institution.certificate.name);
//           } else {
//             const value = String((institution as any)[key]);
//             formData.append(`institutions[${index}][${key}]`, value);
//             console.log(`institutions[${index}][${key}]`, value);
//           }
//         }
//       });

 
//      newApplication.olympics.forEach((olympic, index) => {
//         for (const key in olympic) {
//           if (key === 'file' && olympic.file instanceof File) {
//             formData.append(`olympics[${index}][file]`, olympic.file);
//             console.log(`olympics[${index}][file]`, olympic.file.name);
//           } else {
//             const value = (olympic as any)[key];
//             formData.append(`olympics[${index}][${key}]`, value);
//             console.log(`olympics[${index}][${key}]`, value);
//           }
//         }
//       });



//       newApplication.documents.forEach((document, index) => {
//         for (const key in document) {
//           if (key === 'file' && document.file instanceof File) {
//             formData.append(`documents[${index}][file]`, document.file);
//             console.log(`documents[${index}][file]`, document.file.name);
//           } else {
//             const value = (document as any)[key];
//             formData.append(`documents[${index}][${key}]`, value);
//             console.log(`documents[${index}][${key}]`, value);
//           }
//         }
//       });

//       const response = await api.post('/admission/application/', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data', // Doğru Content-Type başlığını ayarla
//         },
//       });

//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['application'] });
//     },
//   });
// };