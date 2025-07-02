import React from 'react';
import {  Space, Typography } from 'antd';
import Button from '../../components/Buttons/Button';
import DownloadIcon from '../../assets/icons/DownloadIcon';

const { Text } = Typography;

interface Document {
    type: string;
    documentFilePaths?: string[]; 
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
        if (!type) return '';
        return type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (match) => match.toUpperCase());
    };

    return (
        <div className="w-full mb-16">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-md text-[#4570EA] font-semibold">Documents</h3>
            </div>
            {documents.map((document, index) => (
                <div key={index} className="mb-4 p-4 rounded relative">
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Document Type:</label>
                            <div className="p-4 w-[400px]">
                                {formatDocumentType(document.type)}
                            </div>
                        </div>
                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Documents Files:</label>
                            <div className=" w-[400px]">
                                {document.documentFilePaths && document.documentFilePaths.length > 0 ? (
                                    <ul>
                                        {document.documentFilePaths.map((path, idx) => {
                                            if (!path) return null; // Handle potentially null paths
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

export default DocumentsInfo;