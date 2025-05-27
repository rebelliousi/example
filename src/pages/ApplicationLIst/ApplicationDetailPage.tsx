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

import 'antd';
import moment from 'moment';
import Container from '../../components/Container/Container'

import { useParams } from 'react-router-dom';
import { useApplicationById } from '../../hooks/ApplicationList/useApplicationListById';
import LoadingIndicator from '../../components/Status/LoadingIndicator';

interface InstitutionWithFiles extends Omit<Institution, 'certificates'> {
    certificates: number[]; // Changed to number array as expected by API
    certificateFilePaths?: string[]; // Store file paths temporarily for display
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
    relation: 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt'; // Güncellendi
}

interface IApplicationWithFiles extends Omit<IApplication, 'institutions' | 'olympics' | 'documents' | 'guardians'> {
    institutions: InstitutionWithFiles[];
    olympics: OlympicWithFiles[];
    documents: DocumentWithFiles[];
    guardians: GuardianWithFiles[];
}

const ApplicationDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
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
                documents: applicationData?.user?.documents?.map(doc => ({ // Access documents through user
                    type: doc.type,
                    files: doc.files.map(file => file.id),
                    documentFilePaths: doc.files.map(file => file.path)
                })) || [],
            };
            setApplication(initialApplicationState);
        }
    }, [applicationData]);

    const formatDateForInput = (dateString: string): moment.Moment | null => {
        if (!dateString) return null;
        return moment(dateString, 'DD.MM.YYYY');
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {majors?.results.map((major) => (
                                        <div key={major.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`major-${major.id}`}
                                                checked={application.admission_major.includes(major.id)}
                                                disabled
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
                              
                            </div>
                        </div>
                    ))}

                </div>

              
               
            </div>
        </Container>
    );
};

export default ApplicationDetails;