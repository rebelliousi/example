import React, { useState, useEffect } from 'react';
import { useArea } from '../../hooks/Area/useAreas';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';
import {
    Document,
    Guardian,
    IApplication,
    Institution,
    Olympic,
} from '../../hooks/ApplicationList/useAddApplicationList';
import { useSendFiles } from '../../hooks/ApplicationList/useSendFiles';
import { Select, DatePicker, Input, message, Upload } from 'antd';
import { UploadFile, UploadListType } from 'antd/es/upload/interface';
import 'antd';
import moment from 'moment';
import Container from '../../components/Container/Container';
import TrashIcon from '../../assets/icons/TrashIcon';
import PlusIcon from '../../assets/icons/PlusIcon';
import { LinkButton } from '../../components/Buttons/LinkButton';
import { useNavigate, useParams } from 'react-router-dom';
import { useApplicationById } from '../../hooks/ApplicationList/useApplicationListById';
import { useEditApplication } from '../../hooks/ApplicationList/useEditApplication';
import LoadingIndicator from '../../components/Status/LoadingIndicator';
import { InboxOutlined } from '@ant-design/icons';

interface InstitutionWithFiles extends Omit<Institution, 'certificates'> {
    certificates: number[];
    certificateFilePaths?: string[];
}

interface OlympicWithFiles extends Omit<Olympic, 'files'> {
    files: number[];
    olympicFilePaths?: string[];
}

interface DocumentWithFiles extends Omit<Document, 'files'> {
    files: number[];
    documentFilePaths?: string[];
}

interface GuardianWithFiles extends Omit<Guardian, 'documents'> {
    documents: number[];
    documentFilePaths?: string[];
    relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt';
}

interface IApplicationWithFiles extends Omit<IApplication, 'institutions' | 'olympics' | 'documents' | 'guardians' | 'primary_major' | 'admission_major'> {
    institutions: InstitutionWithFiles[];
    olympics: OlympicWithFiles[];
    documents: DocumentWithFiles[];
    guardians: GuardianWithFiles[];
    primary_major: number | null;
    admission_major: (number | null)[];
}

const EditApplicationForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data: applicationData, isLoading } = useApplicationById(id);
    const [application, setApplication] = useState<IApplicationWithFiles | null>(null);

    const { data: areas } = useArea();
    const { data: majors } = useAdmissionMajor(1);
    const mutation = useEditApplication();
    const navigate = useNavigate();

    const {
        mutate: uploadFile,
        isPending: isFileUploadLoading,
    } = useSendFiles();

    useEffect(() => {
        if (applicationData) {
            const initialApplicationState: IApplicationWithFiles = {
                primary_major: applicationData.primary_major,
                admission_major: [null, null, null],
                user: {
                    first_name: applicationData.user.first_name,
                    last_name: applicationData.user.last_name,
                    father_name: applicationData.user.father_name,
                    area: applicationData.user.area,
                    gender: applicationData.user.gender,
                    nationality: applicationData.user.nationality,
                    date_of_birth: applicationData.user.date_of_birth,
                    address: applicationData.user.address,
                    place_of_birth: applicationData.user.place_of_birth,
                    home_phone: applicationData.user.home_phone,
                    phone: applicationData.user.phone,
                    email: applicationData.user.email,
                },
                guardians: applicationData?.user?.guardians?.map(guardian => {
                    const documents = guardian?.documents ? guardian.documents.map(doc => {
                        const firstFile = doc?.files?.[0];
                        return firstFile?.id || 0;
                    }).filter(id => id !== 0) : [];

                    const documentFilePaths = guardian?.documents ? guardian.documents.map(doc => {
                        const firstFile = doc?.files?.[0];
                        return firstFile?.path || '';
                    }) : [];

                    return {
                        relation: (guardian.relation && ['mother', 'father', 'grandparent', 'sibling', 'uncle', 'aunt'].includes(guardian.relation))
                            ? guardian.relation as 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt'
                            : 'father',
                        first_name: guardian.first_name,
                        last_name: guardian.last_name,
                        father_name: guardian.father_name,
                        date_of_birth: guardian.date_of_birth,
                        place_of_birth: guardian.place_of_birth,
                        phone: guardian.phone,
                        address: guardian.address,
                        work_place: guardian.work_place,
                        documents: documents,
                        documentFilePaths: documentFilePaths
                    };
                }) || [],
                institutions: applicationData.institutions.map(institution => ({
                    name: institution.name,
                    school_gpa: institution.school_gpa,
                    graduated_year: institution.graduated_year,
                    certificates: institution.certificates.map(cert => cert.id),
                    certificateFilePaths: institution.certificates.map(cert => cert.path)
                })),
                olympics: applicationData.olympics.map(olympic => ({
                    type: olympic.type,
                    description: olympic.description,
                    files: olympic.files.map(file => file.id),
                    olympicFilePaths: olympic.files.map(file => file.path)
                })),
                documents: applicationData?.user?.documents?.map(doc => ({
                    type: doc.type,
                    files: doc.files.map(file => file.id),
                    documentFilePaths: doc.files.map(file => file.path)
                })) || [],
            };
             // Mevcut admission_major değerlerini initialApplicationState'e aktar
            if (applicationData.admission_major && applicationData.admission_major.length === 3) {
                initialApplicationState.admission_major = [...applicationData.admission_major];
            }
            setApplication(initialApplicationState);
        }
    }, [applicationData]);


    const formatDateForApi = (date: moment.Moment | null): string => {
        if (!date) return '';
        return date.format('DD.MM.YYYY');
    };

    const formatDateForInput = (dateString: string): moment.Moment | null => {
        if (!dateString) return null;
        return moment(dateString, 'DD.MM.YYYY');
    };

    const handleUserChange = (name: string, value: any) => {
        if (!application) return;
        let updatedValue = value;
        if (name === 'date_of_birth') {
            updatedValue = formatDateForApi(value);
        }

        setApplication((prev) => prev ? ({
            ...prev,
            user: {
                ...prev.user,
                [name]: updatedValue,
            },
        }) : null);
    };

    const handleGuardianChange = (index: number, name: string, value: any) => {
        if (!application) return;

        let updatedValue = value;
        if (name === 'date_of_birth') {
            updatedValue = formatDateForApi(value);
        }

        setApplication((prev) => {
            if (!prev) return null;
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

    const handleGuardianFileUpload = async (
        index: number,
        fileList: UploadFile[]
    ) => {
        if (!application) return;

        if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj as File;

            const formData = new FormData();
            formData.append('path', file);

            uploadFile(formData, {
                onSuccess: (data) => {
                    setApplication((prev) => {
                        if (!prev) return null;
                        const newGuardians = [...prev.guardians];
                        const newFiles = [...newGuardians[index].documents, data.id];
                        const newDocumentFilePaths = [...(newGuardians[index].documentFilePaths || []), data.path];

                        newGuardians[index] = {
                            ...newGuardians[index],
                            documents: newFiles,
                            documentFilePaths: newDocumentFilePaths
                        };
                        return {
                            ...prev,
                            guardians: newGuardians,
                        };
                    });
                    message.success('File uploaded successfully');
                },
                onError: (error: any) => {
                    console.error('File upload failed', error);
                    message.error('File upload failed');
                },
            });
        }
    };


    const handleInstitutionChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        if (!application) return;

        const { name, value } = e.target;
        setApplication((prev) => {
            if (!prev) return null;
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
        fileList: UploadFile[]
    ) => {
        if (!application) return;

        if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj as File;

            const formData = new FormData();
            formData.append('path', file);

            uploadFile(formData, {
                onSuccess: (data) => {
                    setApplication((prev) => {
                        if (!prev) return null;
                        const newInstitutions = [...prev.institutions];
                        const newCertificates = [...newInstitutions[index].certificates, data.id];
                        const newCertificateFilePaths = [...(newInstitutions[index].certificateFilePaths || []), data.path];

                        newInstitutions[index] = {
                            ...newInstitutions[index],
                            certificates: newCertificates,
                            certificateFilePaths: newCertificateFilePaths,
                        };
                        return {
                            ...prev,
                            institutions: newInstitutions,
                        };
                    });
                    message.success('File uploaded successfully');
                },
                onError: (error: any) => {
                    console.error('File upload failed', error);
                    message.error('File upload failed');
                },
            });
        }
    };

    const handleOlympicChange = (
        index: number,
        value: 'area' | 'region' | 'state' | 'international' | 'other',
        name: string
    ) => {
        if (!application) return;
        setApplication((prev) => {
            if (!prev) return null;
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
        if (!application) return;
        const { name, value } = e.target;
        setApplication((prev) => {
            if (!prev) return null;
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
        fileList: UploadFile[]
    ) => {
        if (!application) return;

        if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj as File;

            const formData = new FormData();
            formData.append('path', file);

            uploadFile(formData, {
                onSuccess: (data) => {
                    setApplication((prev) => {
                        if (!prev) return null;
                        const newOlympics = [...prev.olympics];
                        const newFiles = [...newOlympics[index].files, data.id];
                        const newOlympicFilePaths = [...(newOlympics[index].olympicFilePaths || []), data.path];

                        newOlympics[index] = {
                            ...newOlympics[index],
                            files: newFiles,
                            olympicFilePaths: newOlympicFilePaths
                        };
                        return {
                            ...prev,
                            olympics: newOlympics,
                        };
                    });
                    message.success('File uploaded successfully');
                },
                onError: (error: any) => {
                    console.error('File upload failed', error);
                    message.error('File upload failed');
                },
            });
        }
    };

    const handleDocumentChange = (index: number, value: string, name: string) => {
        if (!application) return;
        setApplication((prev) => {
            if (!prev) return null;
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
        fileList: UploadFile[]
    ) => {
        if (!application) return;

        if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj as File;

            const formData = new FormData();
            formData.append('path', file);

            uploadFile(formData, {
                onSuccess: (data) => {
                    setApplication((prev) => {
                        if (!prev) return null;
                        const newDocuments = [...prev.documents];
                        const newFiles = [...newDocuments[index].files, data.id];
                        const newDocumentFilePaths = [...(newDocuments[index].documentFilePaths || []), data.path];

                        newDocuments[index] = {
                            ...newDocuments[index],
                            files: newFiles,
                            documentFilePaths: newDocumentFilePaths
                        };
                        return {
                            ...prev,
                            documents: newDocuments,
                        };
                    });
                    message.success('File uploaded successfully');
                },
                onError: (error: any) => {
                    console.error('File upload failed', error);
                    message.error('File upload failed');
                },
            });
        }
    };

    const addGuardian = () => {
        if (!application) return;
        setApplication((prev) => prev ? ({
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
                    documents: [],
                    documentFilePaths: []
                },
            ],
        }) : null);
    };

    const addInstitution = () => {
        if (!application) return;
        setApplication((prev) => prev ? ({
            ...prev,
            institutions: [
                ...prev.institutions,
                {
                    name: '',
                    school_gpa: 0,
                    graduated_year: 0,
                    certificates: [],
                    certificateFilePaths: []
                },
            ],
        }) : null);
    };

    const addOlympic = () => {
        if (!application) return;
        setApplication((prev) => prev ? ({
            ...prev,
            olympics: [
                ...prev.olympics,
                {
                    type: 'area',
                    description: '',
                    files: [],
                    olympicFilePaths: []
                },
            ],
        }) : null);
    };

    const addDocument = () => {
        if (!application) return;
        setApplication((prev) => prev ? ({
            ...prev,
            documents: [
                ...prev.documents,
                {
                    type: 'school_certificate',
                    files: [],
                    documentFilePaths: []
                },
            ],
        }) : null);
    };

    const removeItem = (
        type: 'guardians' | 'institutions' | 'olympics' | 'documents',
        index: number
    ) => {
        if (!application) return;
        setApplication((prev) => {
            if (!prev) return null;
            const newItems = [...prev[type]];
            newItems.splice(index, 1);

            return {
                ...prev,
                [type]: newItems,
            };
        });
    };

     const handleAdmissionMajorChange = (index: number, value: number | null) => {
        setApplication(prev => {
            if (!prev) return null;
            const newAdmissionMajors = [...prev.admission_major];
            newAdmissionMajors[index] = value;
            return { ...prev, admission_major: newAdmissionMajors };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!application || !id) return;

        // Required alanlar kontrolü
        if (!application.user.first_name || !application.user.last_name || !application.user.father_name) {
            message.error('Lütfen zorunlu alanları doldurun.');
            return;
        }

        const formattedApplication: IApplication = {
            primary_major: application.primary_major !== null ? application.primary_major : 0,
            admission_major: application.admission_major.filter(major => major !== null) as number[],
           user: {
            ...application.user,
            date_of_birth: application.user.date_of_birth
                ? moment(application.user.date_of_birth, 'DD.MM.YYYY').format('DD.MM.YYYY')
                : '',
            // username: applicationData?.user.username || application.user.username, // Mevcut kullanıcı adını koru
            area: application.user.area !== null ? application.user.area : 0,  // area dönüşümü
            gender: application.user.gender === 'male' ? 'male' : 'female', // gender dönüşümü
        },
            guardians: application.guardians.map((guardian) => ({
                ...guardian,
                date_of_birth: guardian.date_of_birth
                    ? moment(guardian.date_of_birth, 'DD.MM.YYYY').format('DD.MM.YYYY') // Giriş ve çıkış formatlarını belirtin
                    : '',
                documentFilePaths: undefined,
                relation: guardian.relation
            })),
            institutions: application.institutions.map(institution => ({
                ...institution,
                certificateFilePaths: undefined,
            })),
            olympics: application.olympics.map(olympic => ({
                ...olympic,
                olympicFilePaths: undefined,
            })),
            documents: application.documents.map(document => ({
                ...document,
                documentFilePaths: undefined,
            })),
        };
        try {
            mutation.mutate({ id: Number(id), data: formattedApplication }, {
                onSuccess: () => {
                    message.success('Başvuru başarıyla güncellendi!');
                    navigate('/application_list');
                },
                onError: (error: any) => {
                    console.error('Güncelleme başarısız:', error);
                    message.error('Başvuru güncellenirken bir hata oluştu!');
                },
            });
        } catch (error) {
            console.error('Başvuru gönderilirken hata oluştu:', error);
            message.error('Beklenmedik bir hata oluştu.');
        }
    };

      const uploadProps = {
        name: 'file',
        multiple: false, // tek dosya yüklemesi için
        beforeUpload: () => false,
        listType: "picture-card" as UploadListType,
    };

    const YearPicker = (props: any) => {
        return (
            <DatePicker
                {...props}
                picker="year"
                style={{ width: '100%' }}
                format="YYYY"
            />
        );
    };

    const handleGraduationYearChange = (index: number, date: moment.Moment | null) => {
        if (!application) return;
        const year = date ? date.year() : null;
        setApplication((prev) => {
            if (!prev) return null;
            const newInstitutions = [...prev.institutions];
            newInstitutions[index] = {
                ...newInstitutions[index],
                graduated_year: year !== null ? Number(year) : 0,
            };
            return {
                ...prev,
                institutions: newInstitutions,
            };
        });
    };

    if (isLoading || !application) {
        return <div><LoadingIndicator /></div>;
    }

    return (
        <Container>
            <form
                onSubmit={handleSubmit}
                className="p-4"
                encType="multipart/form-data"
            >

                <div className="mb-40">
                    <h3 className="text-md text-[#4570EA] font-semibold mb-2">
                        Personal Information
                    </h3>
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">First Name:</label>
                            <div className="p-4 w-[400px]">
                                <Input
                                    className="py-2"
                                    type="text"
                                    name="first_name"
                                    value={application.user.first_name}
                                    onChange={(e) =>
                                        handleUserChange('first_name', e.target.value)
                                    }
                                    placeholder="Enter first name"
                                    required
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
                                    required
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
                                    required
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
                                        setApplication((prev) => prev ? ({
                                            ...prev,
                                            primary_major: Number(value),
                                        }) : null)
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

                        {/* Admission Majors - Using Three Select Components */}
                        {[0, 1, 2].map((index) => (
                            <div className="flex items-center space-x-5 mb-2" key={index}>
                                <label className="p-3 font-medium w-48">Admission Major {index + 1}:</label>
                                <div className="p-4 w-[400px]">
                                    <Select
                                        value={application.admission_major[index] || null}
                                        onChange={(value) => handleAdmissionMajorChange(index, value)}
                                        style={{ width: '100%', height: '40px' }}
                                        placeholder={`Select Admission Major ${index + 1}`}
                                    >
                                        <Select.Option value={null}>None</Select.Option> {/* Allow selecting no major */}
                                        {majors?.results.map((major) => (
                                            <Select.Option key={major.id} value={major.id}>
                                                {major.major}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        ))}
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
                                <div className="flex items-center  space-x-5 mb-2">
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
                                            onChange={(e) => handleGuardianChange(index, 'phone', e.target.value)}
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
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Guardian Document File:</label>
                                    <div className="p-4 w-[400px]">
                                        <Upload.Dragger
                                            {...uploadProps}
                                            onChange={(info) => {
                                                handleGuardianFileUpload(index, info.fileList);
                                            }}
                                        >
                                            <p className="ant-upload-drag-icon">
                                                <InboxOutlined />
                                            </p>
                                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                            <p className="ant-upload-hint">
                                                Support for a single or bulk upload.
                                            </p>
                                        </Upload.Dragger>
                                        {guardian.documentFilePaths && guardian.documentFilePaths.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                Uploaded Files:
                                                <ul>
                                                    {guardian.documentFilePaths.map((path, idx) => (
                                                        <li key={idx}>{path}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {isFileUploadLoading && <div>File is uploading...</div>}
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
        
                                            max="5"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">
                                        Graduated Year:
                                    </label>
                                     <div className="p-4 w-[400px]">
                                      <YearPicker
                                      className='py-2'
                                            value={institution.graduated_year ? moment(institution.graduated_year.toString(), 'YYYY') : null}
                                            onChange={(date:any) => handleGraduationYearChange(index, date)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Certificate:</label>
                                    <div className="p-4 w-[400px]">
                                        <Upload.Dragger
                                            {...uploadProps}
                                            onChange={(info) => {
                                                handleInstitutionFileUpload(index, info.fileList);
                                            }}
                                        >
                                            <p className="ant-upload-drag-icon">
                                                <InboxOutlined />
                                            </p>
                                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                            <p className="ant-upload-hint">
                                                Support for a single or bulk upload.
                                            </p>
                                        </Upload.Dragger>
                                        {institution.certificateFilePaths && institution.certificateFilePaths.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                Uploaded Files:
                                                <ul>
                                                    {institution.certificateFilePaths.map((path, idx) => (
                                                        <li key={idx}>{path}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {isFileUploadLoading && <div>File is uploading...</div>}
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
                                        <Upload.Dragger
                                            {...uploadProps}
                                            onChange={(info) => {
                                                handleOlympicFileUpload(index, info.fileList);
                                            }}
                                        >
                                            <p className="ant-upload-drag-icon">
                                                <InboxOutlined />
                                            </p>
                                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                            <p className="ant-upload-hint">
                                                Support for a single or bulk upload.
                                            </p>
                                        </Upload.Dragger>
                                        {olympic.olympicFilePaths && olympic.olympicFilePaths.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                Uploaded Files:
                                                <ul>
                                                    {olympic.olympicFilePaths.map((path, idx) => (
                                                        <li key={idx}>{path}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {isFileUploadLoading && <div>File is uploading...</div>}
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
                    {application?.documents?.map((document, index) => (
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
                                            <Select.Option value="Dushundirish">
                                                Dushundirish
                                            </Select.Option>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Document File:</label>
                                    <div className="p-4 w-[400px]">
                                        <Upload.Dragger
                                            {...uploadProps}
                                            onChange={(info) => {
                                                handleDocumentFileUpload(index, info.fileList);
                                            }}
                                        >
                                            <p className="ant-upload-drag-icon">
                                                <InboxOutlined />
                                            </p>
                                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                            <p className="ant-upload-hint">
                                                Support for a single or bulk upload.
                                            </p>
                                        </Upload.Dragger>
                                        {document.documentFilePaths && document.documentFilePaths.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                Uploaded Files:
                                                <ul>
                                                    {document.documentFilePaths.map((path, idx) => (
                                                        <li key={idx}>{path}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {isFileUploadLoading && <div>File is uploading...</div>}
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

export default EditApplicationForm;