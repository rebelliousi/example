import React, { useState } from 'react';
import { useArea } from '../../hooks/Area/useAreas';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';
import {
  Document,
  IApplication,
  Institution,
  Olympic,
  useAddApplication,
} from '../../hooks/ApplicationList/useAddApplicationList';
import { Container } from '@mui/material';
import TableLayout from '../../components/Table/TableLayout';
import { useSendFiles } from '../../hooks/ApplicationList/useSendFiles';

interface InstitutionWithFileId extends Institution {
  certificateFileId?: number;
}

interface OlympicWithFileId extends Olympic {
  olympicFileId?: number;
}

interface DocumentWithFileId extends Document {
  documentFileId?: number;
}

interface IApplicationWithFileIds extends IApplication {
  institutions: InstitutionWithFileId[];
  olympics: OlympicWithFileId[];
  documents: DocumentWithFileId[];
}

const ApplicationForm: React.FC = () => {
  const [application, setApplication] = useState<IApplicationWithFileIds>({
    primary_major: 0,
    admission_major: [],
    user: {
      first_name: '',
      last_name: '',
      father_name: '',
      area: 0,
      gender: 'male',
      nationality: '',
      date_of_birth: '',
      address: '',
      place_of_birth: '',
      home_phone: '',
      phone: '',
      email: '',
    },
    guardians: [
      {
        relation: 'father',
        first_name: '',
        last_name: '',
        father_name: '',
        date_of_birth: '',
        place_of_birth: '',
        phone: '',
        address: '',
        work_place: '',
      },
    ],
    institutions: [
      {
        name: '',
        school_gpa: 0,
        graduated_year: 0,
      },
    ],
    olympics: [
      {
        type: 'area',
        description: '',
      },
    ],
    documents: [
      {
        type: 'school_certificate',
      },
    ],
  });

  const {
    data: areas,
    isLoading: isAreasLoading,
    isError: isAreasError,
  } = useArea();
  const {
    data: majors,
    isLoading: isMajorsLoading,
    isError: isMajorsError,
  } = useAdmissionMajor(1);
  const mutation = useAddApplication();

  const {
    mutate: uploadFile,
    isPending: isFileUploadLoading,
    isError: fileUploadError,
  } = useSendFiles();

  const formatDateForApi = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';

    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
  };

  const handleUserChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let updatedValue = value;
    if (name === 'date_of_birth') {
      updatedValue = formatDateForApi(value);
    }

    setApplication((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        [name]: updatedValue,
      },
    }));
  };

  const handleGuardianChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let updatedValue = value;
    if (name === 'date_of_birth') {
      updatedValue = formatDateForApi(value);
    }

    setApplication((prev) => {
      const newGuardians = [...prev.guardians];
      newGuardians[index] = {
        ...newGuardians[index],
        [name]: updatedValue,
      };
      return {
        ...prev,
        guardians: newGuardians,
      };
    });
  };

  const handleInstitutionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setApplication((prev) => {
      const newInstitutions = [...prev.institutions];
      newInstitutions[index] = {
        ...newInstitutions[index],
        [name]:
          name === 'school_gpa' || name === 'graduated_year'
            ? Number(value)
            : value,
      };
      return {
        ...prev,
        institutions: newInstitutions,
      };
    });
  };

  const handleInstitutionFileUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const formData = new FormData();
      formData.append('path', file);

      uploadFile(formData, {
        onSuccess: (data) => {
          setApplication((prev) => {
            const newInstitutions = [...prev.institutions];
            newInstitutions[index] = {
              ...newInstitutions[index],
              certificateFileId: data.id,
            };
            return {
              ...prev,
              institutions: newInstitutions,
            };
          });
        },
        onError: (error: any) => {
          console.error('File upload failed', error);
        },
      });
    }
  };

  const handleOlympicChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setApplication((prev) => {
      const newOlympics = [...prev.olympics];
      newOlympics[index] = {
        ...newOlympics[index],
        [name]: value,
      };
      return {
        ...prev,
        olympics: newOlympics,
      };
    });
  };

  const handleOlympicFileUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // FormData oluştur
      const formData = new FormData();
      formData.append('path', file);

      uploadFile(formData, {
        onSuccess: (data) => {
          setApplication((prev) => {
            const newOlympics = [...prev.olympics];
            newOlympics[index] = {
              ...newOlympics[index],
              olympicFileId: data.id,
            };
            return {
              ...prev,
              olympics: newOlympics,
            };
          });
        },
        onError: (error: any) => {
          console.error('File upload failed', error);
        },
      });
    }
  };

  const handleDocumentChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setApplication((prev) => {
      const newDocuments = [...prev.documents];
      newDocuments[index] = {
        ...newDocuments[index],
        [name]: value,
      };
      return {
        ...prev,
        documents: newDocuments,
      };
    });
  };

  const handleDocumentFileUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // FormData oluştur
      const formData = new FormData();
      formData.append('path', file);

      uploadFile(formData, {
        onSuccess: (data) => {
          setApplication((prev) => {
            const newDocuments = [...prev.documents];
            newDocuments[index] = {
              ...newDocuments[index],
              documentFileId: data.id,
            };
            return {
              ...prev,
              documents: newDocuments,
            };
          });
        },
        onError: (error: any) => {
          console.error('File upload failed', error);
        },
      });
    }
  };

  const addGuardian = () => {
    setApplication((prev) => ({
      ...prev,
      guardians: [
        ...prev.guardians,
        {
          relation: 'father',
          first_name: '',
          last_name: '',
          father_name: '',
          date_of_birth: '',
          place_of_birth: '',
          phone: '',
          address: '',
          work_place: '',
        },
      ],
    }));
  };

  const addInstitution = () => {
    setApplication((prev) => ({
      ...prev,
      institutions: [
        ...prev.institutions,
        {
          name: '',
          school_gpa: 0,
          graduated_year: 0,
        },
      ],
    }));
  };

  const addOlympic = () => {
    setApplication((prev) => ({
      ...prev,
      olympics: [
        ...prev.olympics,
        {
          type: 'area',
          description: '',
        },
      ],
    }));
  };

  const addDocument = () => {
    setApplication((prev) => ({
      ...prev,
      documents: [
        ...prev.documents,
        {
          type: 'school_certificate',
        },
      ],
    }));
  };

  const removeItem = (
    type: 'guardians' | 'institutions' | 'olympics' | 'documents',
    index: number
  ) => {
    setApplication((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Submitting application:', application);

    try {
      mutation.mutate(application);
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  if (isAreasLoading || isMajorsLoading) {
    return <div>Loading...</div>; 
  }

  if (isAreasError || isMajorsError) {
    return <div>Error fetching data.</div>; 
  }

  return (
    <Container>
      <form
        onSubmit={handleSubmit}
        className="p-4"
        encType="multipart/form-data"
      >
        <h2 className="text-xl font-bold mb-4">Application Form</h2>

        <TableLayout className="w-full mb-6">
          <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
          <table className="w-full">
            <tbody>
              

              <tr className="border-b">
                <td className="p-3 font-medium">First Name:</td>
                <td className="p-3">
                  <input
                    type="text"
                    name="first_name"
                    value={application.user.first_name}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter first name"
                  />
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Last Name:</td>
                <td className="p-3">
                  <input
                    type="text"
                    name="last_name"
                    value={application.user.last_name}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter last name"
                  />
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Father's Name:</td>
                <td className="p-3">
                  <input
                    type="text"
                    name="father_name"
                    value={application.user.father_name}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter father's name"
                  />
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Nationality:</td>
                <td className="p-3">
                  <input
                    type="text"
                    name="nationality"
                    value={application.user.nationality}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter nationality"
                  />
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Date of Birth:</td>
                <td className="p-3">
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formatDateForInput(application.user.date_of_birth)}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                  />
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Address:</td>
                <td className="p-3">
                  <input
                    type="text"
                    name="address"
                    value={application.user.address}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter address"
                  />
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Place of Birth:</td>
                <td className="p-3">
                  <input
                    type="text"
                    name="place_of_birth"
                    value={application.user.place_of_birth}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter place of birth"
                  />
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Home Phone:</td>
                <td className="p-3">
                  <input
                    type="text"
                    name="home_phone"
                    value={application.user.home_phone}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter home phone"
                  />
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Area:</td>
                <td className="p-3">
                  <select
                    name="area"
                    value={application.user.area}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value={0}>Select Area</option>
                    {areas?.results.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Gender:</td>
                <td className="p-3">
                  <select
                    name="gender"
                    value={application.user.gender}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Phone:</td>
                <td className="p-3">
                  <input
                    type="text"
                    name="phone"
                    value={application.user.phone}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter phone number"
                  />
                </td>
              </tr>

              <tr className="border-b">
                <td className="p-3 font-medium">Email:</td>
                <td className="p-3">
                  <input
                    type="email"
                    name="email"
                    value={application.user.email}
                    onChange={handleUserChange}
                    className="w-full p-2 border rounded"
                    placeholder="Enter email"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </TableLayout>

        {/* Majors */}
        <TableLayout className="w-full mb-6">
          <h3 className="text-lg font-semibold mb-2">Major Selection</h3>
          <table className="w-full">
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-medium">Primary Major:</td>
                <td className="p-3">
                  <select
                    value={application.primary_major}
                    onChange={(e) =>
                      setApplication((prev) => ({
                        ...prev,
                        primary_major: Number(e.target.value),
                      }))
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value={0}>Select Major</option>
                    {majors?.results.map((major) => (
                      <option key={major.id} value={major.id}>
                        {major.major}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr>
                <td className="p-3 font-medium">Admission Majors:</td>
                <td className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {majors?.results.map((major) => (
                      <div key={major.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`major-${major.id}`}
                          checked={application.admission_major.includes(
                            major.id
                          )}
                          onChange={(e) => {
                            const newMajors = e.target.checked
                              ? [...application.admission_major, major.id]
                              : application.admission_major.filter(
                                  (id) => id !== major.id
                                );
                            setApplication((prev) => ({
                              ...prev,
                              admission_major: newMajors,
                            }));
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`major-${major.id}`}>
                          {major.major}
                        </label>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </TableLayout>

        {/* Guardians */}
        <TableLayout className="w-full mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Guardians</h3>
            <button
              type="button"
              onClick={addGuardian}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Guardian
            </button>
          </div>
          {application.guardians.map((guardian, index) => (
            <div key={index} className="mb-4 border p-4 rounded relative">
              <button
                type="button"
                onClick={() => removeItem('guardians', index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Relation:</td>
                    <td className="p-3">
                      <select
                        name="relation"
                        value={guardian.relation}
                        onChange={(e) => handleGuardianChange(index, e)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="grandparent">Grandparent</option>
                        <option value="sibling">Sibling</option>
                        <option value="uncle">Uncle</option>
                        <option value="aunt">Aunt</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">First Name:</td>
                    <td className="p-3">
                      <input
                        type="text"
                        name="first_name"
                        value={guardian.first_name}
                        onChange={(e) => handleGuardianChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter first name"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Last Name:</td>
                    <td className="p-3">
                      <input
                        type="text"
                        name="last_name"
                        value={guardian.last_name}
                        onChange={(e) => handleGuardianChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter last name"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Father's Name:</td>
                    <td className="p-3">
                      <input
                        type="text"
                        name="father_name"
                        value={guardian.father_name}
                        onChange={(e) => handleGuardianChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter father's name"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Date of Birth:</td>
                    <td className="p-3">
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formatDateForInput(guardian.date_of_birth)}
                        onChange={(e) => handleGuardianChange(index, e)}
                        className="w-full p-2 border rounded"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Place of Birth:</td>
                    <td className="p-3">
                      <input
                        type="text"
                        name="place_of_birth"
                        value={guardian.place_of_birth}
                        onChange={(e) => handleGuardianChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter place of birth"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Phone:</td>
                    <td className="p-3">
                      <input
                        type="text"
                        name="phone"
                        value={guardian.phone}
                        onChange={(e) => handleGuardianChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter phone number"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Address:</td>
                    <td className="p-3">
                      <input
                        type="text"
                        name="address"
                        value={guardian.address}
                        onChange={(e) => handleGuardianChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter address"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Work Place:</td>
                    <td className="p-3">
                      <input
                        type="text"
                        name="work_place"
                        value={guardian.work_place}
                        onChange={(e) => handleGuardianChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter work place"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </TableLayout>

        {/* Institutions */}
        <TableLayout className="w-full mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Educational Institutions</h3>
            <button
              type="button"
              onClick={addInstitution}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Institution
            </button>
          </div>
          {application.institutions.map((institution, index) => (
            <div key={index} className="mb-4 border p-4 rounded relative">
              <button
                type="button"
                onClick={() => removeItem('institutions', index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Institution Name:</td>
                    <td className="p-3">
                      <input
                        type="text"
                        name="name"
                        value={institution.name}
                        onChange={(e) => handleInstitutionChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter institution name"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">School GPA:</td>
                    <td className="p-3">
                      <input
                        type="number"
                        name="school_gpa"
                        value={institution.school_gpa}
                        onChange={(e) => handleInstitutionChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter GPA"
                        step="0.01"
                        min="0"
                        max="5"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Graduated Year:</td>
                    <td className="p-3">
                      <input
                        type="number"
                        name="graduated_year"
                        value={institution.graduated_year}
                        onChange={(e) => handleInstitutionChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter graduation year"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Certificate:</td>
                    <td className="p-3">
                      <input
                        type="file"
                        name="certificate"
                        onChange={(e) => handleInstitutionFileUpload(index, e)}
                        className="w-full p-2 border rounded"
                        disabled={isFileUploadLoading} // Prevent multiple uploads
                      />
                      {institution.certificateFileId && (
                        <span className="text-sm text-gray-600">
                          Uploaded File ID: {institution.certificateFileId}
                        </span>
                      )}
                      {isFileUploadLoading && <div>File is uploading...</div>}
                      {fileUploadError && <div>Error uploading file.</div>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </TableLayout>

        {/* Olympics */}
        <TableLayout className="w-full mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Olympic Participation</h3>
            <button
              type="button"
              onClick={addOlympic}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Olympic
            </button>
          </div>
          {application.olympics.map((olympic, index) => (
            <div key={index} className="mb-4 border p-4 rounded relative">
              <button
                type="button"
                onClick={() => removeItem('olympics', index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Olympic Type:</td>
                    <td className="p-3">
                      <select
                        name="type"
                        value={olympic.type}
                        onChange={(e) => handleOlympicChange(index, e)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="area">Area</option>
                        <option value="region">Region</option>
                        <option value="state">State</option>
                        <option value="international">International</option>
                        <option value="other">Other</option>
                      </select>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Description:</td>
                    <td className="p-3">
                      <input
                        type="text"
                        name="description"
                        value={olympic.description}
                        onChange={(e) => handleOlympicChange(index, e)}
                        className="w-full p-2 border rounded"
                        placeholder="Enter description"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Certificate File:</td>
                    <td className="p-3">
                      <input
                        type="file"
                        name="file"
                        onChange={(e) => handleOlympicFileUpload(index, e)}
                        className="w-full p-2 border rounded"
                      />
                      {olympic.olympicFileId && (
                        <span className="text-sm text-gray-600">
                          Uploaded File ID: {olympic.olympicFileId}
                        </span>
                      )}
                      {isFileUploadLoading && <div>File is uploading...</div>}
                      {fileUploadError && <div>Error uploading file.</div>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </TableLayout>

        {/* Documents */}
        <TableLayout className="w-full mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Documents</h3>
            <button
              type="button"
              onClick={addDocument}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Document
            </button>
          </div>
          {application.documents.map((document, index) => (
            <div key={index} className="mb-4 border p-4 rounded relative">
              <button
                type="button"
                onClick={() => removeItem('documents', index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
              <table className="w-full">
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">Document Type:</td>
                    <td className="p-3">
                      <select
                        name="type"
                        value={document.type}
                        onChange={(e) => handleDocumentChange(index, e)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="school_certificate">
                          School Certificate
                        </option>
                        <option value="passport">Passport</option>
                        <option value="military_document">
                          Military Document
                        </option>
                        <option value="information">Information</option>
                        <option value="relationship_tree">
                          Relationship Tree
                        </option>
                        <option value="medical_record">Medical Record</option>
                        <option value="description">Description</option>
                        <option value="terjiimehal">Terjiimehal</option>
                        <option value="labor_book">Labor Book</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Document File:</td>
                    <td className="p-3">
                      <input
                        type="file"
                        name="file"
                        onChange={(e) => handleDocumentFileUpload(index, e)}
                        className="w-full p-2 border rounded"
                      />
                      {document.documentFileId && (
                        <span className="text-sm text-gray-600">
                          Uploaded File ID: {document.documentFileId}
                        </span>
                      )}
                      {isFileUploadLoading && <div>File is uploading...</div>}
                      {fileUploadError && <div>Error uploading file.</div>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </TableLayout>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Submitting...' : 'Submit Application'}
        </button>

        {mutation.isError && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            Error submitting application
          </div>
        )}
        {mutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
            Application submitted successfully!
          </div>
        )}
      </form>
    </Container>
  );
};

export default ApplicationForm;
