
// src/pages/AddApplicationPage/AddApplicationPage.tsx (or your file path)
import React, { useState, useEffect } from 'react';

import Container from '../../components/Container/Container';
import Select from '../../components/InputSelect/Select';
import { LinkButton } from '../../components/Buttons/LinkButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { IArea, IRegions } from '../../models/models';
import { useArea } from '../../hooks/Area/useAreas';
import { IActiveMajors, useActiveMajors } from '../../hooks/ActiveMajors/useActiveMajors';
import { useRegions } from '../../hooks/Regions/useRegions';
import { useAddApplication } from '../../hooks/ApplicationList/useAddApplicationList';

interface AddApplicationPageProps {}

// Using the Guardian interface that matches your form fields more closely
export interface Guardian {
  id: number; // Will be 0 for new guardians
  application: number; // Will be 0, backend links it
  relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt';
  first_name: string;
  last_name: string;
  father_name: string;
  date_of_birth: string; // format: YYYY-MM-DD
  place_of_birth: string; // Ensure this is handled if required by backend
  phone: string;
  address: string;
  work_place: string;
  area: number;
  passport: string | null; // Filename or null
}

export interface IApplication {
  degree: 'BACHELOR' | 'MASTER';
  primary_major: number;
  admission_major: number[];
  first_name: string;
  last_name: string;
  father_name: string;
  gender: 'MALE' | 'FEMALE';
  nationality: string;
  date_of_birth: string; // format: YYYY-MM-DD
  area: number;
  address: string;
  place_of_birth: string;
  home_phone: string;
  cell_phone: string;
  email: string;
  serial_number: string;
  document_number: string;
  given_date: string; // format: YYYY-MM-DD
  given_by: string;
  passport: string; // Stores filename/URL for display, actual file sent in FormData separately
  school_name: string;
  school_graduated_year: number;
  school_gpa: number; // Backend error: "Ensure that there are no more than 1 digits before the decimal point."
  region_of_school: number;
  district_of_school: string;
  certificate_of_school: string; // Stores filename/URL, actual file sent in FormData
  award: 'area' | 'region' | 'state' | 'international' | 'other';
  award_description: string;
  award_certificate: string; // Stores filename/URL, actual file sent in FormData
  military_service: 'female' | 'served' | 'not_served';
  military_service_note: string;
  assign_job_by_sign: boolean;
  orphan: boolean;
  number: number;
  guardians: Guardian[];
  rejection_reason: string;
  date_approved: string; // Backend wants: DD.MM.YYYY hh:mm
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// Helper to parse nested error messages from backend
const getErrorMessages = (errorData: any): string => {
    if (!errorData) return "An unknown error occurred.";
    if (typeof errorData === 'string') {
        return errorData;
    }
    if (Array.isArray(errorData)) {
        return errorData.map(getErrorMessages).join('; ');
    }
    if (typeof errorData === 'object' && errorData !== null) {
        return Object.values(errorData).map(getErrorMessages).join('; ');
    }
    return 'Error details are not in a recognizable format.';
};


export const AddApplicationPage: React.FC<AddApplicationPageProps> = () => {
  const [applicationData, setApplicationData] = useState<IApplication>({
    degree: 'BACHELOR',
    primary_major: 0,
    admission_major: [], // If required, add form field and ensure it's populated
    first_name: '',
    last_name: '',
    father_name: '',
    gender: 'MALE',
    nationality: '',
    date_of_birth: '',
    area: 0,
    address: '',
    place_of_birth: '',
    home_phone: '',
    cell_phone: '',
    email: '',
    serial_number: '',
    document_number: '',
    given_date: '',
    given_by: '',
    passport: '', // Will store filename
    school_name: '',
    school_graduated_year: 0,
    school_gpa: 0,
    region_of_school: 0,
    district_of_school: '',
    certificate_of_school: '', // Will store filename
    award: 'area',
    award_description: '',
    award_certificate: '', // Will store filename
    military_service: 'female',
    military_service_note: '',
    assign_job_by_sign: false,
    orphan: false,
    number: 0,
    guardians: [],
    rejection_reason: '',
    date_approved: '', // HTML datetime-local gives YYYY-MM-DDTHH:mm
    status: 'PENDING',
  });

  // States for File objects
  const [applicantPassportFile, setApplicantPassportFile] = useState<File | null>(null);
  const [schoolCertificateFile, setSchoolCertificateFile] = useState<File | null>(null);
  const [awardCertificateFile, setAwardCertificateFile] = useState<File | null>(null);

  const [fatherFirstName, setFatherFirstName] = useState('');
  const [fatherLastName, setFatherLastName] = useState('');
  const [fatherFathersName, setFatherFathersName] = useState('');
  const [fatherDateOfBirth, setFatherDateOfBirth] = useState('');
  const [fatherArea, setFatherArea] = useState(0);
  const [fatherPlaceOfBirth, setFatherPlaceOfBirth] = useState(''); // Added for consistency with Guardian if needed
  const [fatherAddress, setFatherAddress] = useState('');
  const [fatherPhoneNumber, setFatherPhoneNumber] = useState('');
  const [fatherWorkPlace, setFatherWorkPlace] = useState('');
  const [fatherPassportFile, setFatherPassportFile] = useState<File | null>(null);

  const [motherFirstName, setMotherFirstName] = useState('');
  const [motherLastName, setMotherLastName] = useState('');
  const [motherFathersName, setMotherFathersName] = useState('');
  const [motherDateOfBirth, setMotherDateOfBirth] = useState('');
  const [motherArea, setMotherArea] = useState(0);
  const [motherPlaceOfBirth, setMotherPlaceOfBirth] = useState(''); // Added for consistency
  const [motherAddress, setMotherAddress] = useState('');
  const [motherPhoneNumber, setMotherPhoneNumber] = useState('');
  const [motherWorkPlace, setMotherWorkPlace] = useState('');
  const [motherPassportFile, setMotherPassportFile] = useState<File | null>(null);

  const [otherEducationType, setOtherEducationType] = useState('');
  const [otherEducationCountry, setOtherEducationCountry] = useState('');
  const [graduatedUniversity, setGraduatedUniversity] = useState('');
  const [otherGraduatedYear, setOtherGraduatedYear] = useState<number | string>('');
  const [otherCertificateFile, setOtherCertificateFile] = useState<File | null>(null);

  const [militaryServiceFile, setMilitaryServiceFile] = useState<File | null>(null);
  const [healthDocumentFile, setHealthDocumentFile] = useState<File | null>(null);
  const [familyDocumentFile, setFamilyDocumentFile] = useState<File | null>(null);
  const [informationFile, setInformationFile] = useState<File | null>(null);
  const [anotherInfoFile, setAnotherInfoFile] = useState<File | null>(null);
  const [image3x4File, setImage3x4File] = useState<File | null>(null);

  const { data: areaData, isLoading: isAreaLoading, error: areaError } = useArea();
  const { data: regionsData, isLoading: isRegionsLoading, error: regionsError } = useRegions();
  const { data: activeMajorsData, isLoading: isActiveMajorsLoading, error: activeMajorsError } = useActiveMajors(1);

  const { mutateAsync: addApplicationToList, isPending } = useAddApplication();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setApplicationData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Corrected handleFileChange to set both File state and filename in applicationData
  const handleApplicantFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileSetter: (file: File | null) => void,
    fieldName: keyof IApplication // To set filename in applicationData
  ) => {
    const file = e.target.files && e.target.files[0];
    fileSetter(file || null);
    setApplicationData(prev => ({ ...prev, [fieldName]: file ? file.name : '' }));
  };
  
  // Generic file change handler for other files not directly in IApplication
  const handleGenericFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    const file = e.target.files && e.target.files[0];
    setter(file || null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicationData.first_name || !applicationData.last_name || !applicationData.email) {
      toast.error('Please fill in First Name, Last Name, and Email.');
      return;
    }
    if (applicationData.primary_major === 0) {
        toast.error('Please select a Primary Major.');
        return;
    }
     if (applicationData.area === 0) {
        toast.error('Please select an Area for the applicant.');
        return;
    }
    // GPA validation based on error "Ensure that there are no more than 1 digits before the decimal point."
    // This is an unusual error. It might mean the integer part must be < 10 (e.g. 9.99 not 10.0).
    // Or it means one digit *after* the decimal. For now, let's assume the former.
    // Or it could be a specific regex on backend like /^\d{1}\.\d+$/ or /^\d{1}$/
    if (applicationData.school_gpa && Math.floor(applicationData.school_gpa) >= 10) {
        // This check is based on the literal interpretation of "no more than 1 digit before the decimal point"
        // toast.error('School GPA format is invalid. The whole number part must be a single digit (e.g., 0-9).');
        // return;
        // Commenting out as this is likely a misinterpretation of the error by me or a very specific backend.
        // If the error persists, backend needs to clarify the GPA format.
    }


    const formData = new FormData();

    // Format date_approved if present
    let formattedDateApproved = '';
    if (applicationData.date_approved) {
        try {
            const date = new Date(applicationData.date_approved); // Input is YYYY-MM-DDTHH:mm
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                formattedDateApproved = `${day}.${month}.${year} ${hours}:${minutes}`; // DD.MM.YYYY hh:mm
            } else {
                 // toast.error('Invalid Date Approved format in input.'); // Optional: notify user
            }
        } catch (error) {
            console.error("Error formatting date_approved:", error);
            // toast.error('Error processing Date Approved.'); // Optional
        }
    }


    // Append fields from applicationData
    (Object.keys(applicationData) as Array<keyof IApplication>).forEach(key => {
      // Skip fields handled separately (files, complex objects, or already formatted)
      if (key === 'guardians' || key === 'admission_major' ||
          key === 'passport' || key === 'certificate_of_school' || key === 'award_certificate' ||
          key === 'date_approved') {
        return;
      }

      const value = applicationData[key];
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
        } else if (key === 'school_gpa') {
            // Send GPA as a string. Backend can parse.
            // The "1 digit before decimal" error is tricky.
            // Sending it as is and letting backend validate.
            formData.append(key, String(Number(value).toFixed(2))); // Standardize to 2 decimal places
        }
        else {
            formData.append(key, String(value));
        }
      }
    });

    if (formattedDateApproved) {
        formData.append('date_approved', formattedDateApproved);
    }
    
    // Append admission_major if it's used and populated
    // Example: formData.append('admission_major', JSON.stringify(applicationData.admission_major));
    // Or: applicationData.admission_major.forEach(id => formData.append('admission_major', String(id)));
    // If it's required and empty, this could be the "this field is required" error.

    // Append ACTUAL FILES for fields in IApplication
    if (applicantPassportFile) formData.append('passport', applicantPassportFile); // Key 'passport'
    if (schoolCertificateFile) formData.append('certificate_of_school', schoolCertificateFile); // Key 'certificate_of_school'
    if (awardCertificateFile) formData.append('award_certificate', awardCertificateFile); // Key 'award_certificate'


    // Guardians
    const guardians: Guardian[] = [];
    if (fatherFirstName || fatherLastName) {
      guardians.push({
        id: 0, application: 0, relation: 'father',
        first_name: fatherFirstName, last_name: fatherLastName, father_name: fatherFathersName,
        date_of_birth: fatherDateOfBirth, area: fatherArea, address: fatherAddress,
        phone: fatherPhoneNumber, work_place: fatherWorkPlace,
        passport: fatherPassportFile ? fatherPassportFile.name : null,
        place_of_birth: fatherPlaceOfBirth,
      });
      if (fatherPassportFile) formData.append('father_passport_file', fatherPassportFile); // Distinct key for file
    }
    if (motherFirstName || motherLastName) {
      guardians.push({
        id: 0, application: 0, relation: 'mother',
        first_name: motherFirstName, last_name: motherLastName, father_name: motherFathersName,
        date_of_birth: motherDateOfBirth, area: motherArea, address: motherAddress,
        phone: motherPhoneNumber, work_place: motherWorkPlace,
        passport: motherPassportFile ? motherPassportFile.name : null,
        place_of_birth: motherPlaceOfBirth,
      });
      if (motherPassportFile) formData.append('mother_passport_file', motherPassportFile); // Distinct key for file
    }
    if (guardians.length > 0) {
        formData.append('guardians', JSON.stringify(guardians));
    }


    // Other Education Info (not in IApplication, ensure backend handles these keys)
    if(otherEducationType) formData.append('other_education_type', otherEducationType);
    if(otherEducationCountry) formData.append('other_education_country', otherEducationCountry);
    if(graduatedUniversity) formData.append('graduated_university', graduatedUniversity);
    if(otherGraduatedYear) formData.append('other_graduated_year', String(otherGraduatedYear));
    if (otherCertificateFile) formData.append('other_certificate_file', otherCertificateFile);

    // Other Document Files (use distinct keys if IApplication has string fields for their names)
    if (militaryServiceFile) formData.append('military_service_document', militaryServiceFile); // Key for file distinct from 'military_service' enum
    if (healthDocumentFile) formData.append('health_document_file', healthDocumentFile);
    if (familyDocumentFile) formData.append('family_document_file', familyDocumentFile);
    if (informationFile) formData.append('information_file', informationFile);
    if (anotherInfoFile) formData.append('another_info_file', anotherInfoFile);
    if (image3x4File) formData.append('image_3x4_file', image3x4File);

    try {
      await addApplicationToList(formData);
      toast.success('Application successfully submitted!');
      navigate('/');
    } catch (error: any) { // Use 'any' or a more specific error type if known
      console.error("Submission error object:", error);
      if (error.response && error.response.data) {
        console.error("Backend error data:", error.response.data);
        const messages = getErrorMessages(error.response.data);
        toast.error(`Submission failed: ${messages}`);
      } else if (error.message) {
        toast.error(`Submission failed: ${error.message}`);
      } else {
        toast.error('Failed to submit application. An unknown error occurred.');
      }
    }
  };

  const areaOptions = isAreaLoading || areaError ? [] : areaData?.results?.map((area: IArea) => ({
    id: area.id.toString(),
    name: area.name,
  })) || [];

  const activeMajorsOptions = isActiveMajorsLoading || activeMajorsError ? [] : activeMajorsData?.results?.map((major: IActiveMajors) => ({
    id: major.id.toString(),
    name: major.major_name,
  })) || [];

  const regionOptions = isRegionsLoading || regionsError ? [] : regionsData?.results?.map((region: IRegions) => ({
    id: region.id.toString(),
    name: region.name,
  })) || [];

  return (
    <Container>
      <div className="px-5 py-10">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-lg">Add Application</h1>
            <div className="space-x-4">
              <LinkButton to="/" variant="cancel">Cancel</LinkButton>
              <button type="submit" disabled={isPending} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400">
                {isPending ? "Submitting..." : "Add Application"}
              </button>
            </div>
          </div>

          {/* Degree Information */}
          <section className="mb-6 p-4 border rounded-md">
            <h2 className="text-md font-semibold mb-3">Degree Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700">Degree Type:</label>
                <Select options={[{ id: "BACHELOR", name: "Bachelor" }, { id: "MASTER", name: "Master" }]} placeholder="Select Degree Type" value={applicationData.degree} onChange={(value) => setApplicationData((prev) => ({ ...prev, degree: value as 'BACHELOR' | 'MASTER' }))} />
              </div>
              <div>
                <label htmlFor="primary_major" className="block text-sm font-medium text-gray-700">Primary Major:</label>
                {isActiveMajorsLoading ? (<div>Loading...</div>) : activeMajorsError ? (<div>Error.</div>) : (<Select options={activeMajorsOptions} placeholder="Select Primary Major" value={String(applicationData.primary_major)} onChange={(value) => setApplicationData((prev) => ({ ...prev, primary_major: Number(value) }))} />)}
              </div>
            </div>
          </section>

          {/* Personal Information */}
          <section className="mb-6 p-4 border rounded-md">
            <h2 className="text-md font-semibold mb-3">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name:</label><input type="text" id="first_name" name="first_name" value={applicationData.first_name} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required /></div>
              <div><label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name:</label><input type="text" id="last_name" name="last_name" value={applicationData.last_name} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required /></div>
              <div><label htmlFor="father_name" className="block text-sm font-medium text-gray-700">Father's Name (Applicant):</label><input type="text" id="father_name" name="father_name" value={applicationData.father_name} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
              <div><label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender:</label><Select options={[{ id: "MALE", name: "Male" }, { id: "FEMALE", name: "Female" }]} placeholder="Select Gender" value={applicationData.gender} onChange={(value) => setApplicationData((prev) => ({ ...prev, gender: value as 'MALE' | 'FEMALE' }))} /></div>
              <div><label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality:</label><input type="text" id="nationality" name="nationality" value={applicationData.nationality} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
              <div><label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth:</label><input type="date" id="date_of_birth" name="date_of_birth" value={applicationData.date_of_birth} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
              <div><label htmlFor="area" className="block text-sm font-medium text-gray-700">Area:</label>{isAreaLoading ? (<div>Loading...</div>) : areaError ? (<div>Error.</div>) : (<Select options={areaOptions} placeholder="Select Area" value={String(applicationData.area)} onChange={(value) => setApplicationData((prev) => ({ ...prev, area: Number(value) }))} />)}</div>
              <div className="md:col-span-2"><label htmlFor="address" className="block text-sm font-medium text-gray-700">Address:</label><textarea id="address" name="address" value={applicationData.address} onChange={handleChange} rows={2} className="mt-1 p-2 w-full border rounded-md" /></div>
              <div><label htmlFor="place_of_birth" className="block text-sm font-medium text-gray-700">Place of Birth:</label><input type="text" id="place_of_birth" name="place_of_birth" value={applicationData.place_of_birth} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
            </div>
          </section>
          
          {/* Contact Information */}
          <section className="mb-6 p-4 border rounded-md">
            <h2 className="text-md font-semibold mb-3">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label htmlFor="home_phone" className="block text-sm font-medium text-gray-700">Home Phone:</label><input type="tel" id="home_phone" name="home_phone" value={applicationData.home_phone} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="cell_phone" className="block text-sm font-medium text-gray-700">Cellphone:</label><input type="tel" id="cell_phone" name="cell_phone" value={applicationData.cell_phone} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail:</label><input type="email" id="email" name="email" value={applicationData.email} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" required /></div>
            </div>
          </section>

          {/* Passport Information (Applicant) */}
          <section className="mb-6 p-4 border rounded-md">
            <h2 className="text-md font-semibold mb-3">Applicant's Passport Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">Serial Number:</label><input type="text" id="serial_number" name="serial_number" value={applicationData.serial_number} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="document_number" className="block text-sm font-medium text-gray-700">Document Number:</label><input type="text" id="document_number" name="document_number" value={applicationData.document_number} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="given_date" className="block text-sm font-medium text-gray-700">Date Given:</label><input type="date" id="given_date" name="given_date" value={applicationData.given_date} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="given_by" className="block text-sm font-medium text-gray-700">Given By:</label><input type="text" id="given_by" name="given_by" value={applicationData.given_by} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div>
                    <label htmlFor="applicant_passport_file_input" className="block text-sm font-medium text-gray-700">Passport (File Upload):</label>
                    <input type="file" id="applicant_passport_file_input" name="applicant_passport_file_input" onChange={(e) => handleApplicantFileChange(e, setApplicantPassportFile, 'passport')} className="mt-1 p-1.5 w-full border rounded-md text-sm" />
                </div>
            </div>
          </section>

          {/* Father's Information */}
          <section className="mb-6 p-4 border rounded-md">
            <h2 className="text-md font-semibold mb-3">Father's Information</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label htmlFor="father_first_name" className="block text-sm font-medium text-gray-700">First Name:</label><input type="text" id="father_first_name" value={fatherFirstName} onChange={(e) => setFatherFirstName(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="father_last_name" className="block text-sm font-medium text-gray-700">Last Name:</label><input type="text" id="father_last_name" value={fatherLastName} onChange={(e) => setFatherLastName(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="father_fathers_name" className="block text-sm font-medium text-gray-700">Father's Father Name:</label><input type="text" id="father_fathers_name" value={fatherFathersName} onChange={(e) => setFatherFathersName(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="father_date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth:</label><input type="date" id="father_date_of_birth" value={fatherDateOfBirth} onChange={(e) => setFatherDateOfBirth(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="father_area" className="block text-sm font-medium text-gray-700">Area:</label>{isAreaLoading ? (<div>L...</div>) : <Select options={areaOptions} placeholder="Select Area" value={String(fatherArea)} onChange={(v) => setFatherArea(Number(v))} />}</div>
                <div><label htmlFor="father_place_of_birth" className="block text-sm font-medium text-gray-700">Place of Birth:</label><input type="text" id="father_place_of_birth" value={fatherPlaceOfBirth} onChange={(e) => setFatherPlaceOfBirth(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div className="md:col-span-2"><label htmlFor="father_address" className="block text-sm font-medium text-gray-700">Address:</label><textarea id="father_address" value={fatherAddress} onChange={(e) => setFatherAddress(e.target.value)} rows={2} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="father_phone_number" className="block text-sm font-medium text-gray-700">Phone Number:</label><input type="tel" id="father_phone_number" value={fatherPhoneNumber} onChange={(e) => setFatherPhoneNumber(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="father_work_place" className="block text-sm font-medium text-gray-700">Work Place:</label><input type="text" id="father_work_place" value={fatherWorkPlace} onChange={(e) => setFatherWorkPlace(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="father_passport_file" className="block text-sm font-medium text-gray-700">Passport (File):</label><input type="file" id="father_passport_file" onChange={(e) => handleGenericFileChange(e, setFatherPassportFile)} className="mt-1 p-1.5 w-full border rounded-md text-sm" /></div>
            </div>
          </section>

          {/* Mother's Information */}
          <section className="mb-6 p-4 border rounded-md">
            <h2 className="text-md font-semibold mb-3">Mother's Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label htmlFor="mother_first_name" className="block text-sm font-medium text-gray-700">First Name:</label><input type="text" id="mother_first_name" value={motherFirstName} onChange={(e) => setMotherFirstName(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="mother_last_name" className="block text-sm font-medium text-gray-700">Last Name:</label><input type="text" id="mother_last_name" value={motherLastName} onChange={(e) => setMotherLastName(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="mother_fathers_name" className="block text-sm font-medium text-gray-700">Mother's Father Name:</label><input type="text" id="mother_fathers_name" value={motherFathersName} onChange={(e) => setMotherFathersName(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="mother_date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth:</label><input type="date" id="mother_date_of_birth" value={motherDateOfBirth} onChange={(e) => setMotherDateOfBirth(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="mother_area" className="block text-sm font-medium text-gray-700">Area:</label>{isAreaLoading ? (<div>L...</div>) : <Select options={areaOptions} placeholder="Select Area" value={String(motherArea)} onChange={(v) => setMotherArea(Number(v))} />}</div>
                <div><label htmlFor="mother_place_of_birth" className="block text-sm font-medium text-gray-700">Place of Birth:</label><input type="text" id="mother_place_of_birth" value={motherPlaceOfBirth} onChange={(e) => setMotherPlaceOfBirth(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div className="md:col-span-2"><label htmlFor="mother_address" className="block text-sm font-medium text-gray-700">Address:</label><textarea id="mother_address" value={motherAddress} onChange={(e) => setMotherAddress(e.target.value)} rows={2} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="mother_phone_number" className="block text-sm font-medium text-gray-700">Phone Number:</label><input type="tel" id="mother_phone_number" value={motherPhoneNumber} onChange={(e) => setMotherPhoneNumber(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="mother_work_place" className="block text-sm font-medium text-gray-700">Work Place:</label><input type="text" id="mother_work_place" value={motherWorkPlace} onChange={(e) => setMotherWorkPlace(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="mother_passport_file" className="block text-sm font-medium text-gray-700">Passport (File):</label><input type="file" id="mother_passport_file" onChange={(e) => handleGenericFileChange(e, setMotherPassportFile)} className="mt-1 p-1.5 w-full border rounded-md text-sm" /></div>
            </div>
          </section>
          
          {/* School Graduation Information */}
          <section className="mb-6 p-4 border rounded-md">
            <h2 className="text-md font-semibold mb-3">School Graduation Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label htmlFor="school_name" className="block text-sm font-medium text-gray-700">Graduated School:</label><input type="text" id="school_name" name="school_name" value={applicationData.school_name} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="school_graduated_year" className="block text-sm font-medium text-gray-700">Graduated Year:</label><input type="number" id="school_graduated_year" name="school_graduated_year" value={applicationData.school_graduated_year || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="region_of_school" className="block text-sm font-medium text-gray-700">Region of School:</label>{isRegionsLoading ? (<div>L...</div>) : <Select options={regionOptions} placeholder="Select Region" value={String(applicationData.region_of_school)} onChange={(v) => setApplicationData(prev => ({...prev, region_of_school: Number(v)}))} />}</div>
                <div><label htmlFor="district_of_school" className="block text-sm font-medium text-gray-700">District of School:</label><input type="text" id="district_of_school" name="district_of_school" value={applicationData.district_of_school} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div>
                    <label htmlFor="school_gpa" className="block text-sm font-medium text-gray-700">School GPA:</label>
                    <input type="number" step="0.01" id="school_gpa" name="school_gpa" value={applicationData.school_gpa || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                </div>
                <div>
                    <label htmlFor="school_certificate_file_input" className="block text-sm font-medium text-gray-700">Certificate of Graduation (File):</label>
                    <input type="file" id="school_certificate_file_input" name="school_certificate_file_input" onChange={(e) => handleApplicantFileChange(e, setSchoolCertificateFile, 'certificate_of_school')} className="mt-1 p-1.5 w-full border rounded-md text-sm" />
                </div>
            </div>
          </section>

          {/* Other Education Information */}
          <section className="mb-6 p-4 border rounded-md">
            <h2 className="text-md font-semibold mb-3">Other Education Information (Optional)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label htmlFor="other_education_type" className="block text-sm font-medium text-gray-700">Type:</label><input type="text" id="other_education_type" value={otherEducationType} onChange={(e) => setOtherEducationType(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="other_education_country" className="block text-sm font-medium text-gray-700">Country:</label><input type="text" id="other_education_country" value={otherEducationCountry} onChange={(e) => setOtherEducationCountry(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="graduated_university" className="block text-sm font-medium text-gray-700">Graduated University:</label><input type="text" id="graduated_university" value={graduatedUniversity} onChange={(e) => setGraduatedUniversity(e.target.value)} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="other_graduated_year" className="block text-sm font-medium text-gray-700">Graduated Year:</label><input type="number" id="other_graduated_year" value={otherGraduatedYear} onChange={(e) => setOtherGraduatedYear(e.target.value ? Number(e.target.value) : '')} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="other_certificate_file" className="block text-sm font-medium text-gray-700">Certificate (File):</label><input type="file" id="other_certificate_file" onChange={(e) => handleGenericFileChange(e, setOtherCertificateFile)} className="mt-1 p-1.5 w-full border rounded-md text-sm" /></div>
            </div>
          </section>

          {/* Awards */}
          <section className="mb-6 p-4 border rounded-md">
            <h2 className="text-md font-semibold mb-3">Awards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="award" className="block text-sm font-medium text-gray-700">Award Type:</label><Select options={[{ id: "area", name: "Area" }, { id: "region", name: "Region" }, { id: "state", name: "State" }, { id: "international", name: "International" }, { id: "other", name: "Other" }]} placeholder="Select Award Type" value={applicationData.award} onChange={(v) => setApplicationData(prev => ({...prev, award: v as any}))} /></div>
                <div className="md:col-span-2"><label htmlFor="award_description" className="block text-sm font-medium text-gray-700">Description:</label><textarea id="award_description" name="award_description" value={applicationData.award_description} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div>
                    <label htmlFor="award_certificate_file_input" className="block text-sm font-medium text-gray-700">Certificate (File):</label>
                    <input type="file" id="award_certificate_file_input" name="award_certificate_file_input" onChange={(e) => handleApplicantFileChange(e, setAwardCertificateFile, 'award_certificate')} className="mt-1 p-1.5 w-full border rounded-md text-sm" />
                </div>
            </div>
          </section>
          
          {/* Other Information & Documents */}
          <section className="mb-6 p-4 border rounded-md">
            <h2 className="text-md font-semibold mb-3">Other Information & Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label htmlFor="military_service" className="block text-sm font-medium text-gray-700">Military Service Status:</label><Select options={[{ id: "female", name: "Female (N/A)" }, { id: "served", name: "Served" }, { id: "not_served", name: "Not Served" }]} placeholder="Select Status" value={applicationData.military_service} onChange={(v) => setApplicationData(prev => ({...prev, military_service: v as any}))} /></div>
                <div className="md:col-span-2"><label htmlFor="military_service_note" className="block text-sm font-medium text-gray-700">Military Service Note:</label><textarea id="military_service_note" name="military_service_note" value={applicationData.military_service_note} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="military_service_file" className="block text-sm font-medium text-gray-700">Military Service Document (File):</label><input type="file" id="military_service_file" onChange={(e) => handleGenericFileChange(e, setMilitaryServiceFile)} className="mt-1 p-1.5 w-full border rounded-md text-sm" /></div>
                <div><label htmlFor="health_document_file" className="block text-sm font-medium text-gray-700">Health Document (File):</label><input type="file" id="health_document_file" onChange={(e) => handleGenericFileChange(e, setHealthDocumentFile)} className="mt-1 p-1.5 w-full border rounded-md text-sm" /></div>
                <div><label htmlFor="family_document_file" className="block text-sm font-medium text-gray-700">Family Document (File):</label><input type="file" id="family_document_file" onChange={(e) => handleGenericFileChange(e, setFamilyDocumentFile)} className="mt-1 p-1.5 w-full border rounded-md text-sm" /></div>
                <div><label htmlFor="information_file" className="block text-sm font-medium text-gray-700">Information (File):</label><input type="file" id="information_file" onChange={(e) => handleGenericFileChange(e, setInformationFile)} className="mt-1 p-1.5 w-full border rounded-md text-sm" /></div>
                <div><label htmlFor="another_info_file" className="block text-sm font-medium text-gray-700">Another Info (File):</label><input type="file" id="another_info_file" onChange={(e) => handleGenericFileChange(e, setAnotherInfoFile)} className="mt-1 p-1.5 w-full border rounded-md text-sm" /></div>
                <div><label htmlFor="image_3x4_file" className="block text-sm font-medium text-gray-700">3x4 Image (File):</label><input type="file" id="image_3x4_file" accept="image/*" onChange={(e) => handleGenericFileChange(e, setImage3x4File)} className="mt-1 p-1.5 w-full border rounded-md text-sm" /></div>
                <div className="flex items-center gap-2 mt-2"><input type="checkbox" id="assign_job_by_sign" name="assign_job_by_sign" checked={applicationData.assign_job_by_sign} onChange={handleChange} className="h-4 w-4"/><label htmlFor="assign_job_by_sign" className="text-sm">Assign job by sign?</label></div>
                <div className="flex items-center gap-2 mt-2"><input type="checkbox" id="orphan" name="orphan" checked={applicationData.orphan} onChange={handleChange} className="h-4 w-4"/><label htmlFor="orphan" className="text-sm">Orphan?</label></div>
            </div>
          </section>

          {/* Internal Fields (Date Approved, Status) */}
          <section className="mb-6 p-4 border rounded-md bg-gray-50">
            <h2 className="text-md font-semibold mb-3">Internal Use (Admin Fields)</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label htmlFor="date_approved" className="block text-sm font-medium text-gray-700">Date Approved:</label><input type="datetime-local" id="date_approved" name="date_approved" value={applicationData.date_approved} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                <div><label htmlFor="status" className="block text-sm font-medium text-gray-700">Status:</label><Select options={[{ id: "PENDING", name: "Pending" }, { id: "APPROVED", name: "Approved" }, { id: "REJECTED", name: "Rejected" }]} placeholder="Select Status" value={applicationData.status} onChange={(v) => setApplicationData(prev => ({...prev, status: v as any}))} /></div>
                <div className="md:col-span-2"><label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700">Rejection Reason:</label><textarea id="rejection_reason" name="rejection_reason" value={applicationData.rejection_reason} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
            </div>
          </section>
        </form>
      </div>
    </Container>
  );
};

export default AddApplicationPage;