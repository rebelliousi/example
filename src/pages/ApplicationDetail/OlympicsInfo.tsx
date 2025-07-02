import React from 'react';
import { Space, Typography } from 'antd';
import DownloadIcon from '../../assets/icons/DownloadIcon';
import Button from '../../components/Buttons/Button';

const { Text } = Typography;

interface Olympic {
    type: string;
    description: string;
    olympicFilePaths?: string[] | string;
}

interface Props {
    olympics: Olympic[];
}

const OlympicsInfo: React.FC<Props> = ({ olympics }) => {

    const getFileExtension = (filename: string): string => {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    };

    const getFileIcon = (filename: string): string => {
        const extension = getFileExtension(filename).toLowerCase();
        switch (extension) {
            case 'pdf': return '📄';
            case 'doc':
            case 'docx': return 'Word';
            case 'xls':
            case 'xlsx': return 'Excel';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif': return '🖼️';
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

    const formatOlympicType = (type: string): string => {
        return type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (match) => match.toUpperCase());
    };

    return (
        <div className="w-full mb-16">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-md text-[#4570EA] font-semibold">
                    Olympic Participation
                </h3>
            </div>
            {olympics.map((olympic, index) => (
                <div key={index} className="mb-4 p-4 rounded relative">
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-5 mb-2">
                            <label className="p-3 font-medium w-48">Olympic Type:</label>
                            <div className="p-4 w-[400px]">
                                {formatOlympicType(olympic.type)}
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
                            <div className=" w-[400px]">
                                {(() => {
                                    if (olympic.olympicFilePaths && typeof olympic.olympicFilePaths === 'string') {
                                        const filename = olympic.olympicFilePaths.substring(olympic.olympicFilePaths.lastIndexOf('/') + 1);
                                        return (
                                            <ul>
                                                <li key={0}>
                                                    <Space direction="horizontal" align="center">
                                                        <Text>{getFileIcon(olympic.olympicFilePaths)}</Text>
                                                        <Button
                                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#4570EA] text-[#4570EA]  rounded-full "
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                downloadFile(olympic.olympicFilePaths as string, filename);
                                                            }}
                                                        >
                                                            <DownloadIcon className="w-4 h-4" />
                                                            Download
                                                        </Button>
                                                    </Space>
                                                </li>
                                            </ul>
                                        );
                                    } else if (olympic.olympicFilePaths && Array.isArray(olympic.olympicFilePaths) && olympic.olympicFilePaths.length > 0) {
                                        return (
                                            <ul>
                                                {olympic.olympicFilePaths.map((path, idx) => {
                                                    const filename = path.substring(path.lastIndexOf('/') + 1);
                                                    return (
                                                        <li key={idx}>
                                                            <Space>
                                                                <Text>{getFileIcon(path)}</Text>
                                                                <Button
                                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#4570EA] text-[#4570EA]  rounded-full "
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        downloadFile(path, filename);
                                                                    }}
                                                                >
                                                                    <DownloadIcon className="w-4 h-4" />
                                                                    Download
                                                                </Button>
                                                            </Space>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        );
                                    } else {
                                        return <div>No files uploaded.</div>;
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OlympicsInfo;
