import React, { useState, useEffect } from 'react';
import { useArea } from '../../hooks/Area/useAreas';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';
import {
    Document,
    Guardian,
    Institution,
    Olympic,
} from '../../hooks/ApplicationList/useAddApplicationList';

import { Button, Typography, Space } from 'antd';
import moment from 'moment';
import Container from '../../components/Container/Container'

import { useParams } from 'react-router-dom';
import { useApplicationById, IApplicationData } from '../../hooks/ApplicationList/useApplicationListById'; // Correct import here
import LoadingIndicator from '../../components/Status/LoadingIndicator';

const { Text } = Typography;

interface InstitutionWithFiles extends Omit<Institution, 'certificates'> {
    certificates: number[];
    certificateFilePaths?: string[];
}

interface OlympicWithFiles extends Omit<Olympic, 'files'> {
    files: number[];
    olympicFilePaths?: string[];
}

interface DocumentWithFiles extends Omit<Document, 'file'> { // Changed 'files' to 'file'
    file?: number;  // file ids
    documentFilePaths?: string[];
}

interface GuardianWithFiles extends Omit<Guardian, 'documents'> {
    documents: number[];
    documentFilePaths?: string[];
    relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt';
}

interface IApplicationWithFiles extends Omit<IApplicationData, 'institutions' | 'olympics' | 'documents' | 'guardians' | 'user'> {
    user: Omit<IApplicationData['user'], 'documents' | 'guardians'> & { // Pick the base properties from User interface
      documents: DocumentWithFiles[];
      guardians: GuardianWithFiles[];
    };
    institutions: InstitutionWithFiles[];
    olympics: OlympicWithFiles[];
}

const ApplicationDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return <p>Application ID not found in URL.</p>;
    }

    const { data: applicationData, isLoading } = useApplicationById(id);
    const [application, setApplication] = useState<IApplicationWithFiles | null>(null);

    const { data: areas } = useArea();
    const { data: majors } = useAdmissionMajor(1);

    useEffect(() => {
        if (applicationData) {
            const initialApplicationState: IApplicationWithFiles = {
                primary_major: applicationData.primary_major,
                admission_major: applicationData.admission_major,
                user: {
                    username: applicationData.user.username, // ADD THIS LINE
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
                    documents: applicationData?.user?.documents?.map(doc => { // Modified mapping
                        const firstFile = doc?.file;
                        return {
                            type: doc.type,
                            file: firstFile?.id,
                            documentFilePaths: [firstFile?.path || ''] // Use array of filepaths to match existing logic
                        };
                    }) || [],
                    guardians: applicationData?.user?.guardians?.map(guardian => {
                        const documents = guardian?.documents ? guardian.documents.map(doc => {
                            const firstFile = doc?.file;
                            return firstFile?.id || 0;
                        }).filter(id => id !== 0) : [];

                        const documentFilePaths = guardian?.documents ? guardian.documents.map(doc => {
                            const firstFile = doc?.file;
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
                },
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
                id: applicationData.id,
                date_approved: applicationData.date_approved,
                date_rejected: applicationData.date_rejected,
                rejection_reason: applicationData.rejection_reason,
                status: applicationData.status
            };
            setApplication(initialApplicationState);
        }
    }, [applicationData]);

    const formatDateForInput = (dateString: string): moment.Moment | null => {
        if (!dateString) return null;
        return moment(dateString, 'DD.MM.YYYY');
    };

    const getFileExtension = (filename: string): string => {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    };

    const getFileIcon = (filename: string): string => {
        const extension = getFileExtension(filename).toLowerCase();
        switch (extension) {
            case 'pdf': return '📄';
            case 'doc': case 'docx': return 'Word';
            case 'xls': case 'xlsx': return 'Excel';
            case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
            default: return '';
        }
    };

   const downloadFile = (url: string, filename: string) => {
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/octet-stream',
        },
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Download error:', error);

    });
};

    if (isLoading || !application) {
        return <div><LoadingIndicator /></div>;
    }

    return (
        <Container>
            <div className="p-4">
                <div className="mb-40">
                    <h3 className="text-md text-[#4570EA] font-semibold mb-2">
                        Personal Information
                    </h3>
                    <div className="flex flex-col">

                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">First Name:</label>
                            <div className="p-4 w-[400px]">
                                {application.user.first_name}
                            </div>
                        </div>
                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Last Name:</label>
                            <div className="p-4 w-[400px]">
                                {application.user.last_name}
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Father's Name:</label>
                            <div className="p-4 w-[400px]">
                                {application.user.father_name}
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Nationality:</label>
                            <div className="p-4 w-[400px]">
                                {application.user.nationality}
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Date of Birth:</label>
                            <div className="p-4 w-[400px]">
                                {formatDateForInput(application.user.date_of_birth)?.format('DD.MM.YYYY')}
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Address:</label>
                            <div className="p-4 w-[400px]">
                                {application.user.address}
                            </div>
                        </div>
                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Place of Birth:</label>
                            <div className="p-4 w-[400px]">
                                {application.user.place_of_birth}
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Home Phone:</label>
                            <div className="p-4 w-[400px]">
                                {application.user.home_phone}
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Area:</label>
                            <div className="p-4  w-[400px] h-20">
                                {areas?.results.find(area => area.id === application.user.area)?.name}
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Gender:</label>
                            <div className="p-4 w-[400px] ">
                                {application.user.gender === "male" ? "Male" : "Female"}
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Phone:</label>
                            <div className="p-4 w-[400px]">
                                {application.user.phone}
                            </div>
                        </div>

                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Email:</label>
                            <div className="p-4 w-[400px]">
                                {application.user.email}
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
                                {majors?.results.find(major => major.id === application.primary_major)?.major}
                            </div>
                        </div>

                        <div className="flex items-start space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Admission Majors:</label>
                            <div className="p-3 w-[400px]">
                                {application.admission_major.length > 0 ? (
                                    <ul>
                                        {application.admission_major.map((majorId: number) => {
                                            const major = majors?.results.find(m => m.id === majorId);
                                            return (
                                                <li key={majorId}>
                                                    {major?.major}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div>No admission majors selected.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guardians */}
                <div className="mb-40">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-md text-[#4570EA] font-semibold">Guardians</h3>
                    </div>
                    {application.user.guardians.map((guardian, index) => (
                        <div key={index} className="mb-4 p-4 rounded relative">

                            <div className="flex flex-col">
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Relation:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.relation}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">First Name:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.first_name}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Last Name:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.last_name}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Father's Name:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.father_name}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Date of Birth:</label>
                                    <div className="p-4 w-[400px]">
                                        {formatDateForInput(guardian.date_of_birth)?.format('DD.MM.YYYY')}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">
                                        Place of Birth:
                                    </label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.place_of_birth}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Phone:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.phone}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Address:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.address}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Work Place:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.work_place}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Guardian Documents:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.documentFilePaths && guardian.documentFilePaths.length > 0 ? (
                                            <ul>
                                                {guardian.documentFilePaths.map((path, idx) => (
                                                    <li key={idx}>
                                                        <Space direction="horizontal" align="center">
                                                            <Text>{getFileIcon(path)}</Text>
                                                            <Button type="primary" size="small" onClick={(e) => {
                                                                e.preventDefault();
                                                                downloadFile(path, path.substring(path.lastIndexOf('/') + 1));
                                                            }}>
                                                                Download File
                                                            </Button>
                                                        </Space>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div>No documents uploaded.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

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

                            <div className="flex flex-col">
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">
                                        Institution Name:
                                    </label>
                                    <div className="p-4 w-[400px]">
                                        {institution.name}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">School GPA:</label>
                                    <div className="p-4 w-[400px]">
                                        {institution.school_gpa}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">
                                        Graduated Year:
                                    </label>
                                    <div className="p-4 w-[400px]">
                                        {institution.graduated_year}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Certificates:</label>
                                    <div className="p-4 w-[400px]">
                                        {institution.certificateFilePaths && institution.certificateFilePaths.length > 0 ? (
                                            <ul>
                                                {institution.certificateFilePaths.map((path, idx) => (
                                                    <li key={idx}>
                                                        <Space direction="horizontal" align="center">
                                                            <Text>{getFileIcon(path)}</Text>
                                                            <Button type="primary" size="small" onClick={(e) => {
                                                                e.preventDefault();
                                                                downloadFile(path, path.substring(path.lastIndexOf('/') + 1));
                                                            }}>
                                                                Download Certificate
                                                            </Button>
                                                        </Space>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div>No certificates uploaded.</div>
                                        )}
                                    </div>
                                </div>


                            </div>
                        </div>
                    ))}

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

                            <div className="flex flex-col">
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Olympic Type:</label>
                                    <div className="p-4 w-[400px]">
                                        {olympic.type}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Description:</label>
                                    <div className="p-4 w-[400px]">
                                        {olympic.description}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Olympic Files:</label>
                                    <div className="p-4 w-[400px]">
                                        {olympic.olympicFilePaths && olympic.olympicFilePaths.length > 0 ? (
                                            <ul>
                                                {olympic.olympicFilePaths.map((path, idx) => (
                                                    <li key={idx}>
                                                        <Space direction="horizontal" align="center">
                                                            <Text>{getFileIcon(path)}</Text>
                                                            <Button type="primary" size="small" onClick={(e) => {
                                                                e.preventDefault();
                                                                downloadFile(path, path.substring(path.lastIndexOf('/') + 1));
                                                            }}>
                                                                Download File
                                                            </Button>
                                                        </Space>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div>No files uploaded.</div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}

                </div>
                {/* Documents */}
                <div className="w-full mb-40">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-md text-[#4570EA] font-semibold">Documents</h3>
                    </div>
                    {application?.user?.documents?.map((document, index) => (
                        <div key={index} className="mb-4 p-4 rounded relative">
                            <div className="flex flex-col">
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Document Type:</label>
                                    <div className="p-4 w-[400px]">
                                        {document.type}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Documents Files:</label>
                                    <div className="p-4 w-[400px]">
                                        {document.documentFilePaths && document.documentFilePaths.length > 0 ? (
                                            <ul>
                                                {document.documentFilePaths.map((path, idx) => (
                                                    <li key={idx}>
                                                        <Space direction="horizontal" align="center">
                                                            <Text>{getFileIcon(path)}</Text>
                                                            <Button type="primary" size="small" onClick={(e) => {
                                                                e.preventDefault();
                                                                downloadFile(path, path.substring(path.lastIndexOf('/') + 1));
                                                            }}>
                                                                Download File
                                                            </Button>
                                                        </Space>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div>No files uploaded.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
};

export default ApplicationDetails;