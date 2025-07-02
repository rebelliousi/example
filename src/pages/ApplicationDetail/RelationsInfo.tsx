import React from 'react';
import moment from 'moment';
import {  Space, Typography } from 'antd';
import Button from '../../components/Buttons/Button';
import DownloadIcon from '../../assets/icons/DownloadIcon';

const { Text } = Typography;

// Define the allowed values for 'relation'
export type GuardianRelation = 'mother' | 'father' | 'grandparent' | 'sibling' | 'uncle' | 'aunt' | 'other';  // Add 'other' to the type definition
export interface Guardian {
    relation: GuardianRelation; // Use the specific type
    first_name: string;
    last_name: string;
    father_name: string;
    date_of_birth: string;
    place_of_birth: string;
    phone?: string; // Optional yapıldı
    address?: string; // Optional yapıldı
    work_place?: string; // Optional yapıldı
    documentFilePaths?: string[];
    documents: {
        id: number;
        type: string;
        file: {
            path: string;
        } | null;
    }[];
}

interface GuardianInfoProps {
    guardians: Guardian[];
}

const GuardianInfo: React.FC<GuardianInfoProps> = ({ guardians }) => {
    return (
        <div>
            {guardians.map((guardian, index) => (
                <div key={index}>
                    {/* Other guardian information */}
                    <DocumentsInfo documents={guardian.documents.map(doc => ({ type: doc.type, documentFilePaths: doc.file ? [doc.file.path] : [] }))} />
                </div>
            ))}
        </div>
    );
};

interface Document {
    type: string;
    documentFilePaths?: string[]; // undefined olabilir, string[] olmalı
}

interface Props {
    documents: Document[];
}

const DocumentsInfo: React.FC<Props> = ({ documents }) => {

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
    const formatDocumentType = (type: string): string => {
        const formattedType = type
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/\b\w/g, (match) => match.toUpperCase()); // Capitalize each word
        return formattedType;
    };

    return (
        <div className="w-full mb-16">
            <div className="flex justify-between items-center mb-2">

            </div>
            {documents.map((document, index) => (
                <div key={index} className="mb-2 rounded relative">
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Document Type:</label>
                            <div className="p-4 w-[400px]">
                                {formatDocumentType(document.type)}
                            </div>
                        </div>
                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Documents Files:</label>
                            <div className="w-[400px]">
                                {document.documentFilePaths && document.documentFilePaths.length > 0 ? (
                                    <ul>
                                        {document.documentFilePaths.map((path, idx) => {
                                            if (!path) return null; // Skip undefined paths

                                            const filename = path.split('/').pop() || 'document'; // Dosya adını çıkar
                                            return (
                                                <li key={idx}>
                                                    <Space direction="horizontal" align="center">
                                                        <Text>{getFileIcon(path)}</Text>
                                                        <Button                                                             className="flex items-center gap-2 px-4 py-2 bg-white border border-[#4570EA] text-[#4570EA]  rounded-full "
 onClick={(e) => {
                                                            e.preventDefault();
                                                            downloadFile(path, filename); // Fonksiyonu doğru parametrelerle çağır
                                                        }}> <DownloadIcon className="w-4 h-4" />
                                                            Download 
                                                        </Button>
                                                    </Space>
                                                </li>
                                            );
                                        })}
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
    );
};

interface GuardiansInfoProps {
    guardians: Guardian[];
}

const GuardiansInfo: React.FC<GuardiansInfoProps> = ({ guardians }) => {

    const formatDateForInput = (dateString: string): string => {
        if (!dateString) return '';
        return moment(dateString, 'DD.MM.YYYY').format('DD.MM.YYYY');
    };
    const formatRelation = (relation: GuardianRelation): string => {
        const formattedRelation = relation
            .replace(/_/g, ' ') // Replace underscores with spaces (not really needed for GuardianRelation)
            .replace(/\b\w/g, (match) => match.toUpperCase()); // Capitalize each word
        return formattedRelation;
    };

    const getSectionTitle = (relation: GuardianRelation): string => {
        switch (relation) {
            case 'mother':
                return "Mother's Information";
            case 'father':
                return "Father's Information";
            default:
                return "Other Relation's Information"; // or `formatRelation(relation) + "'s Information"` if you want the formatted relation
        }
    };

    return (
        <div className="">
            {/* <div className="flex justify-between items-center mb-2">
                <h3 className="text-md text-[#4570EA] font-semibold">Guardians</h3>
            </div> */}
            {guardians.map((guardian, index) => {
                const sectionTitle = getSectionTitle(guardian.relation);

                return (
                    <div key={index} className="mb-2 rounded relative">
                        <h4 className="text-md text-[#4570EA] font-semibold">{sectionTitle}</h4>
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-5 mb-2">
                                <label className="p-3 font-medium w-48">Relation:</label>
                                <div className="p-4 w-[400px]">
                                    {formatRelation(guardian.relation)}
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
                                    {formatDateForInput(guardian.date_of_birth)}
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

                            {guardian.phone && (  // phone varsa göster
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Phone:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.phone}
                                    </div>
                                </div>
                            )}

                            {guardian.address && (  // address varsa göster
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Address:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.address}
                                    </div>
                                </div>
                            )}

                            {guardian.work_place && (  // work_place varsa göster
                                <div className="flex items-center space-x-5 mb-2">
                                    <label className="p-3 font-medium w-48">Work Place:</label>
                                    <div className="p-4 w-[400px]">
                                        {guardian.work_place}
                                    </div>
                                </div>
                            )}
                            <DocumentsInfo
                                documents={guardian.documents.map(doc => ({
                                    type: doc.type,
                                    documentFilePaths: doc.file && doc.file.path ? [doc.file.path] : []
                                }))}
                            />
                        </div>
                    </div>
                );
            })}

        </div>
    );
};

export default GuardiansInfo;