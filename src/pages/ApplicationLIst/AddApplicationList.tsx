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
import { useSendFiles } from '../../hooks/ApplicationList/useSendFiles';
import { Select, DatePicker, Input } from 'antd';
import 'antd';
import moment from 'moment';
import Container from '../../components/Container/Container';
import TrashIcon from '../../assets/icons/TrashIcon';
import PlusIcon from '../../assets/icons/PlusIcon';
import { LinkButton } from '../../components/Buttons/LinkButton';
import { useNavigate } from 'react-router-dom';

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

  const { data: areas } = useArea();
  const { data: majors } = useAdmissionMajor(1);
  const mutation = useAddApplication();
  const navigate = useNavigate(); // Initialize useNavigate *inside* the component!


  const {
    mutate: uploadFile,
    isPending: isFileUploadLoading,
    isError: fileUploadError,
  } = useSendFiles();

  const formatDateForApi = (date: moment.Moment | null): string => {
    if (!date) return '';
    return date.format('DD.MM.YYYY');
  };

  const formatDateForInput = (dateString: string): moment.Moment | null => {
    if (!dateString) return null;
    return moment(dateString, 'DD.MM.YYYY');
  };

  const handleUserChange = (name: string, value: any) => {
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

  const handleGuardianChange = (index: number, name: string, value: any) => {
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
    value: 'area' | 'region' | 'state' | 'international' | 'other',
    name: string
  ) => {
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

  const handleOlympicInputChange = (
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

  const handleDocumentChange = (index: number, value: string, name: string) => {
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

    const formattedApplication = {
      ...application,
      user: {
        ...application.user,
        date_of_birth: application.user.date_of_birth
          ? moment(application.user.date_of_birth, 'DD.MM.YYYY').format(
              'DD.MM.YYYY'
            )
          : '',
      },
      guardians: application.guardians.map((guardian) => ({
        ...guardian,
        date_of_birth: guardian.date_of_birth
          ? moment(guardian.date_of_birth, 'DD.MM.YYYY').format('DD.MM.YYYY')
          : '',
      })),
    };

    try {
      mutation.mutate(formattedApplication, {
        onSuccess: () => {
          navigate('/application_list');
        },
        onError: (error) => {
          console.error('Mutation failed:', error);
        },
      });
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  return (
    <Container>
      <form
        onSubmit={handleSubmit}
        className="p-4"
        encType="multipart/form-data"
      >
        {/* <h2 className="text-xl font-bold mb-20">Application Form</h2> */}

        <div className="mb-40">
          <h3 className="text-md text-[#4570EA] font-semibold mb-2">
            Personal Information
          </h3>
          <div className="flex flex-col">
            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">First Name:</label>
              <div className="p-4 w-[400px]">
                {' '}
                {/* Set width to 400px */}
                <Input
                  className="py-2"
                  type="text"
                  name="first_name"
                  value={application.user.first_name}
                  onChange={(e) =>
                    handleUserChange('first_name', e.target.value)
                  }
                  placeholder="Enter first name"
                />
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Last Name:</label>
              <div className="p-4 w-[400px]">
                <Input
                  className="py-2"
                  type="text"
                  name="last_name"
                  value={application.user.last_name}
                  onChange={(e) =>
                    handleUserChange('last_name', e.target.value)
                  }
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Father's Name:</label>
              <div className="p-4 w-[400px]">
                <Input
                  className="py-2"
                  type="text"
                  name="father_name"
                  value={application.user.father_name}
                  onChange={(e) =>
                    handleUserChange('father_name', e.target.value)
                  }
                  placeholder="Enter father's name"
                />
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Nationality:</label>
              <div className="p-4 w-[400px]">
                <Input
                  className="py-2"
                  type="text"
                  name="nationality"
                  value={application.user.nationality}
                  onChange={(e) =>
                    handleUserChange('nationality', e.target.value)
                  }
                  placeholder="Enter nationality"
                />
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Date of Birth:</label>
              <div className="p-4 w-[400px]">
                <DatePicker
                  className="py-2"
                  format="DD.MM.YYYY"
                  value={formatDateForInput(application.user.date_of_birth)}
                  onChange={(date) => handleUserChange('date_of_birth', date)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Address:</label>
              <div className="p-4 w-[400px]">
                <Input
                  className="py-2"
                  type="text"
                  name="address"
                  value={application.user.address}
                  onChange={(e) => handleUserChange('address', e.target.value)}
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Place of Birth:</label>
              <div className="p-4 w-[400px]">
                <Input
                  className="py-2"
                  type="text"
                  name="place_of_birth"
                  value={application.user.place_of_birth}
                  onChange={(e) =>
                    handleUserChange('place_of_birth', e.target.value)
                  }
                  placeholder="Enter place of birth"
                />
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Home Phone:</label>
              <div className="p-4 w-[400px]">
                <Input
                  className="py-2"
                  type="text"
                  name="home_phone"
                  value={application.user.home_phone}
                  onChange={(e) =>
                    handleUserChange('home_phone', e.target.value)
                  }
                  placeholder="Enter home phone"
                />
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Area:</label>
              <div className="p-4  w-[400px] h-20">
                <Select
                  value={application.user.area}
                  onChange={(value) => handleUserChange('area', value)}
                  style={{ width: '100%', height: '85%' }}
                  placeholder="Select Area"
                >
                  {areas?.results.map((area) => (
                    <Select.Option key={area.id} value={area.id}>
                      {area.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Gender:</label>
              <div className="p-4 w-[400px] ">
                <Select
                  className=""
                  value={application.user.gender}
                  onChange={(value) => handleUserChange('gender', value)}
                  style={{ width: '100%', height: '42px' }}
                >
                  <Select.Option value="male">Male</Select.Option>
                  <Select.Option value="female">Female</Select.Option>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Phone:</label>
              <div className="p-4 w-[400px]">
                <Input
                  className="py-2"
                  type="text"
                  name="phone"
                  value={application.user.phone}
                  onChange={(e) => handleUserChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Email:</label>
              <div className="p-4 w-[400px]">
                <Input
                  className="py-2"
                  type="email"
                  name="email"
                  value={application.user.email}
                  onChange={(e) => handleUserChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Majors */}
        <div className="w-full mb-40">
          <h3 className="text-md text-[#4570EA] font-semibold mb-2">
            Major Selection
          </h3>
          <div className="flex flex-col">
            <div className="flex items-center space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Primary Major:</label>
              <div className="p-4 w-[400px]">
                <Select
                  value={application.primary_major}
                  onChange={(value) =>
                    setApplication((prev) => ({
                      ...prev,
                      primary_major: Number(value),
                    }))
                  }
                  style={{ width: '100%', height: '40px' }}
                  placeholder="Select Major"
                >
                  {majors?.results.map((major) => (
                    <Select.Option key={major.id} value={major.id}>
                      {major.major}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex items-start space-x-5 mb-2">
              <label className="p-3 font-medium w-48">Admission Majors:</label>
              <div className="p-3 w-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {majors?.results.map((major) => (
                    <div key={major.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`major-${major.id}`}
                        checked={application.admission_major.includes(major.id)}
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
                      <label htmlFor={`major-${major.id}`}>{major.major}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guardians */}
        <div className="mb-40">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md text-[#4570EA] font-semibold">Guardians</h3>
          </div>
          {application.guardians.map((guardian, index) => (
            <div key={index} className="mb-4 p-4 rounded relative">
              <button
                type="button"
                onClick={() => removeItem('guardians', index)}
                className="absolute top-2 right-2 text-gray-400"
              >
                <TrashIcon />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Relation:</label>
                  <div className="p-4 w-[400px]">
                    <Select
                      value={guardian.relation}
                      onChange={(value) =>
                        handleGuardianChange(index, 'relation', value)
                      }
                      style={{ width: '100%', height: '40px' }}
                    >
                      <Select.Option value="father">Father</Select.Option>
                      <Select.Option value="mother">Mother</Select.Option>
                      <Select.Option value="grandparent">
                        Grandparent
                      </Select.Option>
                      <Select.Option value="sibling">Sibling</Select.Option>
                      <Select.Option value="uncle">Uncle</Select.Option>
                      <Select.Option value="aunt">Aunt</Select.Option>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">First Name:</label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="text"
                      name="first_name"
                      value={guardian.first_name}
                      onChange={(e) =>
                        handleGuardianChange(
                          index,
                          'first_name',
                          e.target.value
                        )
                      }
                      placeholder="Enter first name"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Last Name:</label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="text"
                      name="last_name"
                      value={guardian.last_name}
                      onChange={(e) =>
                        handleGuardianChange(index, 'last_name', e.target.value)
                      }
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Father's Name:</label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="text"
                      name="father_name"
                      value={guardian.father_name}
                      onChange={(e) =>
                        handleGuardianChange(
                          index,
                          'father_name',
                          e.target.value
                        )
                      }
                      placeholder="Enter father's name"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Date of Birth:</label>
                  <div className="p-4 w-[400px]">
                    <DatePicker
                      format="DD.MM.YYYY"
                      value={formatDateForInput(guardian.date_of_birth)}
                      onChange={(date) =>
                        handleGuardianChange(index, 'date_of_birth', date)
                      }
                      style={{ width: '100%', height: '40px' }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">
                    Place of Birth:
                  </label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="text"
                      name="place_of_birth"
                      value={guardian.place_of_birth}
                      onChange={(e) =>
                        handleGuardianChange(
                          index,
                          'place_of_birth',
                          e.target.value
                        )
                      }
                      placeholder="Enter place of birth"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Phone:</label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="text"
                      name="phone"
                      value={guardian.phone}
                      onChange={(e) =>
                        handleGuardianChange(index, 'phone', e.target.value)
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Address:</label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="text"
                      name="address"
                      value={guardian.address}
                      onChange={(e) =>
                        handleGuardianChange(index, 'address', e.target.value)
                      }
                      placeholder="Enter address"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Work Place:</label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="text"
                      name="work_place"
                      value={guardian.work_place}
                      onChange={(e) =>
                        handleGuardianChange(
                          index,
                          'work_place',
                          e.target.value
                        )
                      }
                      placeholder="Enter work place"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addGuardian}
            className="px-8 py-2 flex items-center gap-2 border-blue-500 border text-blue-500 rounded"
          >
            <PlusIcon /> Add Guardian
          </button>
        </div>

        {/* Institutions */}
        <div className="w-full mb-40">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md text-[#4570EA] font-semibold">
              Educational Institutions
            </h3>
          </div>
          {application.institutions.map((institution, index) => (
            <div key={index} className="mb-4 p-4 rounded relative">
              <button
                type="button"
                onClick={() => removeItem('institutions', index)}
                className="absolute top-2 right-2 text-gray-400"
              >
                <TrashIcon />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">
                    Institution Name:
                  </label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="text"
                      name="name"
                      value={institution.name}
                      onChange={(e) => handleInstitutionChange(index, e)}
                      placeholder="Enter institution name"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">School GPA:</label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="number"
                      name="school_gpa"
                      value={institution.school_gpa}
                      onChange={(e) => handleInstitutionChange(index, e)}
                      placeholder="Enter GPA"
                      step="0.01"
                      min="0"
                      max="5"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">
                    Graduated Year:
                  </label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="number"
                      name="graduated_year"
                      value={institution.graduated_year}
                      onChange={(e) => handleInstitutionChange(index, e)}
                      placeholder="Enter graduation year"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Certificate:</label>
                  <div className="p-4 w-[400px]">
                    <input
                      type="file"
                      name="certificate"
                      onChange={(e) => handleInstitutionFileUpload(index, e)}
                      className="w-full p-2"
                      disabled={isFileUploadLoading}
                    />
                    {institution.certificateFileId && (
                      <span className="text-sm text-gray-600">
                        Uploaded File ID: {institution.certificateFileId}
                      </span>
                    )}
                    {isFileUploadLoading && <div>File is uploading...</div>}
                    {fileUploadError && <div>Error uploading file.</div>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstitution}
            className="px-8 py-2 flex items-center gap-2 border-blue-500 border text-blue-500 rounded"
          >
            <PlusIcon /> Add Institution
          </button>
        </div>

        {/* Olympics */}
        <div className="w-full mb-40">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md text-[#4570EA] font-semibold">
              Olympic Participation
            </h3>
          </div>
          {application.olympics.map((olympic, index) => (
            <div key={index} className="mb-4 p-4 rounded relative">
              <button
                type="button"
                onClick={() => removeItem('olympics', index)}
                className="absolute top-2 right-2 text-gray-400"
              >
                <TrashIcon />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Olympic Type:</label>
                  <div className="p-4 w-[400px]">
                    <Select
                      value={olympic.type}
                      onChange={(value) =>
                        handleOlympicChange(index, value, 'type')
                      }
                      style={{ width: '100%', height: '40px' }}
                    >
                      <Select.Option value="area">Area</Select.Option>
                      <Select.Option value="region">Region</Select.Option>
                      <Select.Option value="state">State</Select.Option>
                      <Select.Option value="international">
                        International
                      </Select.Option>
                      <Select.Option value="other">Other</Select.Option>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Description:</label>
                  <div className="p-4 w-[400px]">
                    <Input
                      className="py-2"
                      type="text"
                      name="description"
                      value={olympic.description}
                      onChange={(e) => handleOlympicInputChange(index, e)}
                      placeholder="Enter description"
                    />
                  </div>
                </div>
                               <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">
                    Certificate File:
                  </label>
                  <div className="p-4 w-[400px]">
                    <input
                      type="file"
                      name="file"
                      onChange={(e) => handleOlympicFileUpload(index, e)}
                      className="w-full p-2"
                    />
                    {olympic.olympicFileId && (
                      <span className="text-sm text-gray-600">
                        Uploaded File ID: {olympic.olympicFileId}
                      </span>
                    )}
                    {isFileUploadLoading && <div>File is uploading...</div>}
                    {fileUploadError && <div>Error uploading file.</div>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addOlympic}
            className="px-8 py-2 flex items-center gap-2 border-blue-500 border text-blue-500 rounded"
          >
            <PlusIcon /> Add Olympic
          </button>
        </div>

        {/* Documents */}
        <div className="w-full mb-40">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md text-[#4570EA] font-semibold">Documents</h3>
          </div>
          {application.documents.map((document, index) => (
            <div key={index} className="mb-4 p-4 rounded relative">
              <button
                type="button"
                onClick={() => removeItem('documents', index)}
                className="absolute top-2 right-2 text-gray-400"
              >
                <TrashIcon />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Document Type:</label>
                  <div className="p-4 w-[400px]">
                    <Select
                      value={document.type}
                      onChange={(value) =>
                        handleDocumentChange(index, value, 'type')
                      }
                      style={{ width: '100%', height: '40px' }}
                    >
                      <Select.Option value="school_certificate">
                        School Certificate
                      </Select.Option>
                      <Select.Option value="passport">Passport</Select.Option>
                      <Select.Option value="military_document">
                        Military Document
                      </Select.Option>
                      <Select.Option value="information">
                        Information
                      </Select.Option>
                      <Select.Option value="relationship_tree">
                        Relationship Tree
                      </Select.Option>
                      <Select.Option value="medical_record">
                        Medical Record
                      </Select.Option>
                      <Select.Option value="description">
                        Description
                      </Select.Option>
                      <Select.Option value="terjiimehal">
                        Terjiimehal
                      </Select.Option>
                      <Select.Option value="labor_book">
                        Labor Book
                      </Select.Option>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                  <label className="p-3 font-medium w-48">Document File:</label>
                  <div className="p-4 w-[400px]">
                    <input
                      type="file"
                      name="file"
                      onChange={(e) => handleDocumentFileUpload(index, e)}
                      className="w-full p-2 rounded"
                    />
                    {document.documentFileId && (
                      <span className="text-sm text-gray-600">
                        Uploaded File ID: {document.documentFileId}
                      </span>
                    )}
                    {isFileUploadLoading && <div>File is uploading...</div>}
                    {fileUploadError && <div>Error uploading file.</div>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addDocument}
            className="px-8 py-2 flex items-center gap-2 border-blue-500 border text-blue-500 rounded"
          >
            <PlusIcon /> Add Document
          </button>
        </div>

        <div className="col-span-12 flex justify-end gap-4 items-center">
          <LinkButton
            to={`/application_list`}
            type="button"
            variant="cancel"
            className="px-4 py-5"
          >
            Cancel
          </LinkButton>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit'}
          </button>
        </div>

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