import React, { useState } from 'react';
import { useArea } from '../../hooks/Area/useAreas';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';
import {
    Guardian,
    IApplication,
    Institution,
    Olympic,
    useAddApplication,
    Document as ApplicationDocument,
    GuardianDocument
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
import { useNavigate } from 'react-router-dom';
import { InboxOutlined } from '@ant-design/icons';

// Enum'lar
enum GuardianRelation {
    FATHER = 'father',
    MOTHER = 'mother',
    GRANDPARENT = 'grandparent',
    SIBLING = 'sibling',
    UNCLE = 'uncle',
    AUNT = 'aunt',
}

enum OlympicType {
    AREA = 'area',
    REGION = 'region',
    STATE = 'state',
    INTERNATIONAL = 'international',
    OTHER = 'other',
}

// Use the GuardianDocument's type union directly, rather than a separate enum
enum DocumentType {
    SCHOOL_CERTIFICATE = 'school_certificate',
    PASSPORT = 'passport',
    MILITARY_DOCUMENT = 'military_document',
    INFORMATION = 'information',
    RELATIONSHIP_TREE = 'relationship_tree',
    MEDICAL_RECORD = 'medical_record',
    DESCRIPTION = 'description',
    TERJIIMEHAL = 'terjiimehal',
    LABOR_BOOK = 'labor_book',
    DUSHUNDIRISH = 'Dushundirish',
}

// Yardımcı Arayüzler
interface WithFilePaths {
    filePaths?: string[];
}

interface InstitutionWithFiles extends Omit<Institution, 'certificates'>, WithFilePaths {
    certificates: number[];
}

interface OlympicWithFiles extends Omit<Olympic, 'files'>, WithFilePaths {
    files: number[];
}


export interface Document {
    owner?: number;
    type: DocumentType;
    file: number | null;
}

interface DocumentWithFiles extends Omit<ApplicationDocument, 'file'>, WithFilePaths {  //Use ApplicationDocument to avoid confusion
    file: number | null;
}


interface GuardianWithFiles extends Omit<Guardian, 'documents'>, WithFilePaths {
    documents: GuardianDocumentWithFile[];
}

interface ApplicationUserForm {
    first_name: string;
    last_name: string;
    father_name: string;
    area: number | null;
    gender: 'male' | 'female';
    nationality: string;
    date_of_birth: string;
    address: string;
    place_of_birth: string;
    home_phone: string;
    phone: string;
    email: string;
}

interface IApplicationWithFiles extends Omit<IApplication, 'institutions' | 'olympics' | 'documents' | 'guardians' | 'primary_major' | 'user' | 'admission_major' | 'degree'> {
    institutions: InstitutionWithFiles[];
    olympics: OlympicWithFiles[];
    documents: DocumentWithFiles[];
    guardians: GuardianWithFiles[];
    primary_major: number | null;
    user: ApplicationUserForm;
    admission_major: (number | null)[];
    degree?: 'BACHELOR' | 'MASTER';
}

interface GuardianDocumentWithFile {
    type: DocumentType;
    file: number | null;
}


const ApplicationForm: React.FC = () => {
    const [application, setApplication] = useState<IApplicationWithFiles>({
        degree: undefined,
        primary_major: null,
        admission_major: [null, null, null],
        user: {
            first_name: '',
            last_name: '',
            father_name: '',
            area: null,
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
                relation: GuardianRelation.FATHER,
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
            },
        ],
        institutions: [
            {
                name: '',
                school_gpa: 0,
                graduated_year: 0,
                certificates: [],
                filePaths: [],
            },
        ],
        olympics: [
            {
                type: OlympicType.AREA,
                description: '',
                files: [],
                filePaths: [],
            },
        ],
        documents: [
            {
                type: DocumentType.SCHOOL_CERTIFICATE,
                file: null, // Başlangıçta null
                filePaths: [],
            },
        ],
    });

    const { data: areas } = useArea();
    const { data: majors } = useAdmissionMajor(1);
    const mutation = useAddApplication();
    const navigate = useNavigate();

    const {
        mutate: uploadFile,
        isPending: isFileUploadLoading,
    } = useSendFiles();

    // **Modified Date Formatting Function**
    const formatDateForApi = (date: moment.Moment | null): string => {
        if (!date) return '';
        return date.format('YYYY-MM-DD'); // API expects YYYY-MM-DD
    };

    const formatDateForInput = (dateString: string): moment.Moment | null => {
        if (!dateString) return null;
        return moment(dateString, 'YYYY-MM-DD');  // Parse as YYYY-MM-DD
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

    const [selectedGuardianDocumentType, setSelectedGuardianDocumentType] = useState<DocumentType | null>(null);

    const handleGuardianFileUpload = async (
        index: number,
        fileList: UploadFile[]
    ) => {
        if (!selectedGuardianDocumentType) {
            message.error("Please select a document type first.");
            return;
        }

        if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj as File;

            const formData = new FormData();
            formData.append('path', file);

            uploadFile(formData, {
                onSuccess: (data: any) => { // data'nın türünü any olarak değiştirdim.
                    setApplication((prev) => {
                        const newGuardians = [...prev.guardians];
                        const updatedDocuments: GuardianDocumentWithFile[] = [...newGuardians[index].documents, {
                            type: selectedGuardianDocumentType,
                            file: data.id,
                        }];
                        newGuardians[index] = {
                            ...newGuardians[index],
                            documents: updatedDocuments,
                            filePaths: [...(newGuardians[index].filePaths || []), data.path],
                        };
                        return {
                            ...prev,
                            guardians: newGuardians,
                        };
                    });
                    message.success('File uploaded successfully');
                    setSelectedGuardianDocumentType(null); // Reset after successful upload
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
        fileList: UploadFile[]
    ) => {
        if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj as File;

            const formData = new FormData();
            formData.append('path', file);

            uploadFile(formData, {
                onSuccess: (data) => {
                    setApplication((prev) => {
                        const newInstitutions = [...prev.institutions];
                        newInstitutions[index] = {
                            ...newInstitutions[index],
                            certificates: [...newInstitutions[index].certificates, data.id],
                            filePaths: [...(newInstitutions[index].filePaths || []), data.path],
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
        value: OlympicType,
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
        fileList: UploadFile[]
    ) => {
        if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj as File;

            const formData = new FormData();
            formData.append('path', file);

            uploadFile(formData, {
                onSuccess: (data) => {
                    setApplication((prev) => {
                        const newOlympics = [...prev.olympics];
                        newOlympics[index] = {
                            ...newOlympics[index],
                            files: [...newOlympics[index].files, data.id],
                            filePaths: [...(newOlympics[index].filePaths || []), data.path],
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

    // Document File Upload Güncellendi
    const handleDocumentChange = (index: number, value: DocumentType, name: string) => {
        setApplication((prev) => {
            const newDocuments = [...prev.documents];
            newDocuments[index] = {
                ...newDocuments[index],
                [name]: value,
                file: null, // Dosya ID'sini sıfırla
                filePaths: [], // Dosya yollarını sıfırla
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
        if (fileList && fileList.length > 0) {
            const file = fileList[0].originFileObj as File;

            const formData = new FormData();
            formData.append('path', file);

            uploadFile(formData, {
                onSuccess: (data) => {
                    setApplication((prev) => {
                        const newDocuments = [...prev.documents];
                        newDocuments[index] = {
                            ...newDocuments[index],
                            file: data.id, // Tek dosya ID'si
                            filePaths: [data.path],
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
        setApplication((prev) => ({
            ...prev,
            guardians: [
                ...prev.guardians,
                {
                    relation: GuardianRelation.FATHER,
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
                    certificates: [],
                    filePaths: [],
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
                    type: OlympicType.AREA,
                    description: '',
                    files: [],
                    filePaths: [],
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
                    type: DocumentType.SCHOOL_CERTIFICATE,
                    file: null,
                    filePaths: [],
                },
            ],
        }));
    };

    const removeItem = (
        type: 'guardians' | 'institutions' | 'olympics' | 'documents',
        index: number
    ) => {
        setApplication((prev) => {
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
            const newAdmissionMajors = [...prev.admission_major];
            newAdmissionMajors[index] = value;
            return { ...prev, admission_major: newAdmissionMajors };
        });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!application.user.first_name || !application.user.last_name || !application.user.father_name) {
            message.error('Please fill in all required fields.');
            return;
        }

        const formattedApplication: IApplication = {
            ...application,
            degree: application.degree, // Degree değerini ekle
            primary_major: application.primary_major !== null ? application.primary_major : 0,
            admission_major: application.admission_major.filter(major => major !== null) as number[],
            user: {
                ...application.user,
                date_of_birth: application.user.date_of_birth
                    ? moment(application.user.date_of_birth, 'YYYY-MM-DD').format(  // Format before sending
                        'YYYY-MM-DD'
                    )
                    : '',
                area: application.user.area !== null ? application.user.area : 0,
                gender: application.user.gender === 'male' ? 'male' : 'female',
            },
            guardians: application.guardians.map((guardian) => ({
                ...guardian,
                relation: guardian.relation as Guardian['relation'],
                date_of_birth: guardian.date_of_birth
                    ? moment(guardian.date_of_birth, 'YYYY-MM-DD').format('YYYY-MM-DD') // Format before sending
                    : '',
                documents: guardian.documents.map(doc => ({
                    type: doc.type as GuardianDocument['type'],
                    file: doc.file
                })) || [], // Map GuardianDocumentWithFile to GuardianDocument
            })),
            institutions: application.institutions.map(institution => ({
                ...institution,
                certificates: institution.certificates || [],
            })),
            olympics: application.olympics.map(olympic => ({
                ...olympic,
                type: olympic.type as Olympic['type'],
                files: olympic.files || [],
            })),
            documents: application.documents.map(document => ({
                ...document,
                type: document.type as ApplicationDocument['type'],  // Use ApplicationDocument
                file: document.file,
            })),
        };

        try {
            mutation.mutate(formattedApplication, {
                onSuccess: () => {
                    message.success('Application submitted successfully!');
                    navigate('/application_list');
                },
                onError: (error: any) => {
                    console.error('Mutation failed:', error);
                    message.error('Application submission failed!');
                },
            });
        } catch (error) {
            console.error('Error submitting application:', error);
            message.error('An unexpected error occurred.');
        }
    };

    const uploadProps = {
        name: 'file',
        multiple: false, // Tek dosya yüklemeye izin ver
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
        const year = date ? date.year() : null;
        setApplication((prev) => {
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


    return (
        <Container>
            <form
                onSubmit={handleSubmit}
                className="p-4"
                encType="multipart/form-data"
            >
                 {/* Degree Alanı */}
                 <div className="w-full mb-40">
                    <h3 className="text-md text-[#4570EA] font-semibold mb-2">
                        Degree
                    </h3>
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Degree:</label>
                            <div className="p-4 w-[400px]">
                                <Select
                                    value={application.degree}
                                    onChange={(value) =>
                                        setApplication((prev) => ({
                                            ...prev,
                                            degree: value as 'BACHELOR' | 'MASTER', // Tür güvenliği için
                                        }))
                                    }
                                    style={{ width: '100%', height: '40px' }}
                                    placeholder="Select Degree"
                                >
                                    <Select.Option value="BACHELOR">Bachelor</Select.Option>
                                    <Select.Option value="MASTER">Master</Select.Option>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

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
                                    format="YYYY-MM-DD"  // Use YYYY-MM-DD for display
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
                                    value={application.user.area || null}
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

                <div className="w-full mb-40">
                    <h3 className="text-md text-[#4570EA] font-semibold mb-2">
                        Major Selection
                    </h3>
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Primary Major:</label>
                            <div className="p-4 w-[400px]">
                                <Select
                                    value={application.primary_major || null}
                                    onChange={(value) =>
                                        setApplication((prev) => ({
                                            ...prev,
                                            primary_major: Number(value),
                                        }))
                                    }
                                    style={{ width: '100%', height: '40px' }}
                                    placeholder="Select Primary Major"
                                >
                                    {majors?.results.map((major) => (
                                        <Select.Option key={major.id} value={major.id}>
                                            {major.major}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>
                        </div>


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
                                        <Select.Option value={null}>Major</Select.Option>
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
                                            <Select.Option value={GuardianRelation.FATHER}>Father</Select.Option>
                                            <Select.Option value={GuardianRelation.MOTHER}>Mother</Select.Option>
                                            <Select.Option value={GuardianRelation.GRANDPARENT}>
                                                Grandparent
                                            </Select.Option>
                                            <Select.Option value={GuardianRelation.SIBLING}>Sibling</Select.Option>
                                            <Select.Option value={GuardianRelation.UNCLE}>Uncle</Select.Option>
                                            <Select.Option value={GuardianRelation.AUNT}>Aunt</Select.Option>
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
                                            format="YYYY-MM-DD"  // Use YYYY-MM-DD for display
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

                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Document Type:</label>
                                    <div className="p-4 w-[400px]">
                                        <Select
                                            value={selectedGuardianDocumentType}
                                            onChange={(value) => setSelectedGuardianDocumentType(value as DocumentType)}
                                            style={{ width: '100%', height: '40px' }}
                                            placeholder="Select Document Type"
                                        >
                                            <Select.Option value={DocumentType.PASSPORT}>Passport</Select.Option>
                                            <Select.Option value={DocumentType.MILITARY_DOCUMENT}>Military Document</Select.Option>
                                            <Select.Option value={DocumentType.RELATIONSHIP_TREE}>Relationship Tree</Select.Option>
                                            <Select.Option value={DocumentType.MEDICAL_RECORD}>Medical Record</Select.Option>
                                            <Select.Option value={DocumentType.DESCRIPTION}>Description</Select.Option>
                                            <Select.Option value={DocumentType.TERJIIMEHAL}>Terjiimehal</Select.Option>
                                            <Select.Option value={DocumentType.LABOR_BOOK}>Labor Book</Select.Option>
                                            <Select.Option value={DocumentType.DUSHUNDIRISH}>Dushundirish</Select.Option>
                                        </Select>
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
                                        {guardian.filePaths && guardian.filePaths.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                Uploaded Files:
                                                <ul>
                                                    {guardian.filePaths.map((path, idx) => (
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
                                            max='5'

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
                                            onChange={(date: any) => handleGraduationYearChange(index, date)}
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
                                        {institution.filePaths && institution.filePaths.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                Uploaded Files:
                                                <ul>
                                                    {institution.filePaths.map((path, idx) => (
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
                                                handleOlympicChange(index, value as OlympicType, 'type')
                                            }
                                            style={{ width: '100%', height: '40px' }}
                                        >
                                            <Select.Option value={OlympicType.AREA}>Area</Select.Option>
                                            <Select.Option value={OlympicType.REGION}>Region</Select.Option>
                                            <Select.Option value={OlympicType.STATE}>State</Select.Option>
                                            <Select.Option value={OlympicType.INTERNATIONAL}>
                                                International
                                            </Select.Option>
                                            <Select.Option value={OlympicType.OTHER}>Other</Select.Option>
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
                                        {olympic.filePaths && olympic.filePaths.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                Uploaded Files:
                                                <ul>
                                                    {olympic.filePaths.map((path, idx) => (
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
                                                handleDocumentChange(index, value as DocumentType, 'type')
                                            }
                                            style={{ width: '100%', height: '40px' }}
                                        >
                                            <Select.Option value={DocumentType.SCHOOL_CERTIFICATE}>
                                                School Certificate
                                            </Select.Option>
                                            <Select.Option value={DocumentType.PASSPORT}>Passport</Select.Option>
                                            <Select.Option value={DocumentType.MILITARY_DOCUMENT}>
                                                Military Document
                                            </Select.Option>
                                            <Select.Option value={DocumentType.INFORMATION}>
                                                Information
                                            </Select.Option>
                                            <Select.Option value={DocumentType.RELATIONSHIP_TREE}>
                                                Relationship Tree
                                            </Select.Option>
                                            <Select.Option value={DocumentType.MEDICAL_RECORD}>
                                                Medical Record
                                            </Select.Option>
                                            <Select.Option value={DocumentType.DESCRIPTION}>
                                                Description
                                            </Select.Option>
                                            <Select.Option value={DocumentType.TERJIIMEHAL}>
                                                Terjiimehal
                                            </Select.Option>
                                            <Select.Option value={DocumentType.LABOR_BOOK}>
                                                Labor Book
                                            </Select.Option>
                                            <Select.Option value={DocumentType.DUSHUNDIRISH}>
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
                                        {document.filePaths && document.filePaths.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                Uploaded Files:
                                                <ul>
                                                    {document.filePaths.map((path, idx) => (
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
}

export default ApplicationForm;