import React, { useState, useRef, useEffect } from 'react';
import { Space, Button, Spin } from "antd";
import InfoCircleIcon from "../assets/icons/InfoCircleIcon";
import { Link, useNavigate } from "react-router-dom";
import PlusIcon from "../assets/icons/PlusIcon";
import TrashIcon from "../assets/icons/TrashIcon";
import toast from "react-hot-toast";
import { useSendFiles } from '../hooks/ApplicationList/useSendFiles';
import { useEditClient } from '../hooks/Client/useEditCLient';
import { useApplicationStore } from '../store/applicationStore';

export type DocumentType =
    | 'school_certificate'
    | 'passport'
    | 'military_document'
    | 'information'
    | 'relationship_tree'
    | 'medical_record'
    | 'description'
    | 'terjiimehal'
    | 'labor_book'
    | 'Dushundirish'
    | 'nika_haty'
    | 'death_certificate'
    | 'diploma'
    | 'relations'
    | 'other'; // Yeni değer

type FileFieldName = "saglykKepilnama" | "threeArka" | "maglumat" | "terjimehal" | "threeXFourSurat" | "militaryService" | "nikaHaty";

interface FileState {
    type: DocumentType | null;
    file: File | null;
    filePaths: string[];
    isUploading: boolean;
    fileId?: number | null;
}

interface FileIdsState {
    [key: string]: number | null;
}

interface AwardInfo {
    awardType?: string;
    description?: string;
    certificate?: File | null;
}

interface IClient {
    degree: string;
    primary_major: number;
    admission_major: number[];
    user: any;
    guardians: any[];
    institutions: any[];
    olympics: any[];
    documents: { type: DocumentType, file: number | null }[];
    status: string | undefined;
}

const EditOtherDocuments = () => {
    const navigate = useNavigate();
    const { mutate: editClient, isPending: isEditingClient } = useEditClient();
    const { mutate: uploadFile } = useSendFiles();
    const { applicationData, degree, primaryMajor, additionalMajors, generalInformation, guardians, educationInfos, awardInfos } = useApplicationStore();

    const [files, setFiles] = useState<{ [key in FileFieldName]?: FileState }>({});
    const [fileIds, setFileIds] = useState<FileIdsState>({});
    const [gender, setGender] = useState<string | null>(null);

    const fileInputRefs = useRef<{ [key in FileFieldName]: HTMLInputElement | null }>({
        saglykKepilnama: null,
        threeArka: null,
        maglumat: null,
        terjimehal: null,
        threeXFourSurat: null,
        militaryService: null,
        nikaHaty: null,
    });

    const uploadDocument = async (fieldName: FileFieldName, file: File, documentType: DocumentType) => {
        return new Promise<number>((resolve, reject) => {
            const formData = new FormData();
            formData.append('path', file);
            formData.append('documentType', documentType);

            uploadFile(formData, {
                onSuccess: (data: any) => {
                    console.log(`File uploaded successfully for ${fieldName}:`, data.id);
                    setFileIds(prev => ({ ...prev, [fieldName]: data.id }));
                    setFiles(prev => {
                        const updatedFiles = { ...prev };
                        if (updatedFiles[fieldName]) {
                            updatedFiles[fieldName]!.isUploading = false;
                            updatedFiles[fieldName]!.fileId = data.id;
                            updatedFiles[fieldName]!.filePaths = [data.path];
                        }
                        return updatedFiles;
                    });
                    resolve(data.id);
                },
                onError: (error: any) => {
                    console.error(`File upload failed for ${fieldName}:`, error);
                    toast.error('File upload failed');
                    setFiles(prev => {
                        const updatedFiles = { ...prev };
                        delete updatedFiles[fieldName];
                        return updatedFiles;
                    });
                    setFileIds(prev => {
                        const { [fieldName]: deleted, ...rest } = prev;
                        return rest;
                    });
                    reject(error);
                },
            });
        });
    };

    const handleFileChange = async (
        fieldName: FileFieldName,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            const currentFileState = files[fieldName];
            if (!currentFileState?.type) {
                console.warn("Document type was unexpectedly null.");
                return;
            }

            setFiles(prev => ({
                ...prev,
                [fieldName]: {
                    ...currentFileState,
                    file: file,
                    isUploading: true,
                }
            }));

            try {
                await uploadDocument(fieldName, file, currentFileState.type);
            } catch (error) {
                console.error("Something went wrong:", error);
                setFiles(prev => {
                    const updatedFiles = { ...prev };
                    delete updatedFiles[fieldName];
                    return updatedFiles;
                });
                setFileIds(prev => {
                    const { [fieldName]: deleted, ...rest } = prev;
                    return rest;
                });
            }
        }
    };

    const handlePlusClick = async (fieldName: FileFieldName) => {
        fileInputRefs.current[fieldName]?.click();
    };

    const handleDeleteFile = (fieldName: FileFieldName) => {
        setFiles(prev => {
            const updatedFiles = { ...prev };
            if (updatedFiles[fieldName]) {
                updatedFiles[fieldName]!.file = null;
                updatedFiles[fieldName]!.fileId = null;
                updatedFiles[fieldName]!.filePaths = [];
            }
            return updatedFiles;
        });
        setFileIds(prev => {
            const { [fieldName]: deleted, ...rest } = prev;
            return rest;
        });
    };

    const handleSubmit = async () => {
        const requiredFields: FileFieldName[] = ["saglykKepilnama", "threeArka", "maglumat", "terjimehal", "threeXFourSurat",];
        if (gender !== 'female') {
            requiredFields.push("militaryService");
        }

        for (const field of requiredFields) {
            if (!fileIds[field]) {
                toast.error(`Please upload ${field}`);
                return;
            }
        }

        const clientData: IClient = {
            degree: degree,
            primary_major: primaryMajor,
            admission_major: additionalMajors,
            user: generalInformation,
            guardians: guardians.map((guardian: any) => ({
                ...guardian,
                date_of_birth: guardian.date_of_birth,
                documents: guardian.documents.map((doc: any) => ({
                    type: doc.type,
                    file: doc.file,
                })),
            })),
            institutions: educationInfos.map((education: any) => ({
                name: education.name,
                school_gpa: education.school_gpa,
                graduated_year: education.graduated_year,
                certificates: education.certificates,
            })),
            olympics: awardInfos.map((award: any) => ({
                type: award.type,
                description: award.description,
                files: award.files,
            })),
            documents: Object.entries(fileIds).map(([key, value]) => {
                let documentType: DocumentType | undefined;

                switch (key) {
                    case "saglykKepilnama":
                        documentType = "medical_record";
                        break;
                    case "threeArka":
                        documentType = "relationship_tree";
                        break;
                    case "maglumat":
                        documentType = "information";
                        break;
                    case "terjimehal":
                        documentType = "terjiimehal";
                        break;
                    case "threeXFourSurat":
                        documentType = "other"; // 3X4 surat için tip "other" olarak ayarlandı
                        break;
                    case "militaryService":
                        documentType = "military_document";
                        break;
                    case "nikaHaty":
                        documentType = "nika_haty";
                        break;
                    default:
                        documentType = undefined;
                }
                if (value !== null && documentType) {
                    return { type: documentType, file: value };
                } else {
                    return null;
                }
            }).filter(doc => doc !== null) as { type: DocumentType; file: number }[],
            status: applicationData?.status
        };

        console.log("Client Data being submitted:", clientData);

        try {
            await editClient({ id: applicationData.id, data: clientData });
            toast.success('Application updated');
            navigate("/application-status");
        } catch (error: any) {
            console.error("API Error:", error);
            toast.error('An error occurred while submitting');
            console.error("Error", error);
        }
    };

    useEffect(() => {
        const storedGender = sessionStorage.getItem("gender");
        if (storedGender) {
            setGender(storedGender);
        }
    }, []);

    const getDefaultDocumentType = (fieldName: FileFieldName): DocumentType => {
        switch (fieldName) {
            case "threeXFourSurat":
                return "other"; // 3X4 surat için tip "other" olarak ayarlandı
            case "saglykKepilnama":
                return "medical_record";
            case "threeArka":
                return "relationship_tree";
            case "maglumat":
                return "information";
            case "terjimehal":
                return "terjiimehal";
            case "militaryService":
                return "military_document";
            case "nikaHaty":
                return "nika_haty";
            default:
                throw new Error(`Unknown field name: ${fieldName}`);
        }
    };

    useEffect(() => {
        if (applicationData) {
            const initialFiles: { [key in FileFieldName]?: FileState } = {};

            if (applicationData.user?.documents) {
                applicationData.user.documents.forEach(doc => {
                    let fieldName: FileFieldName | undefined;
                    switch (doc.type) {
                        case 'medical_record':
                            fieldName = "saglykKepilnama";
                            break;
                        case 'relationship_tree':
                            fieldName = "threeArka";
                            break;
                        case 'terjiimehal':
                            fieldName = "terjimehal";
                            break;
                        case 'military_document':
                            fieldName = "militaryService";
                            break;
                        case 'nika_haty':
                            fieldName = "nikaHaty";
                            break;
                        case 'information':
                             fieldName = "maglumat";
                            break;
                        case 'other':
                             fieldName = "threeXFourSurat";
                            break;
                    }

                    if (fieldName) {
                        initialFiles[fieldName] = {
                            type: doc.type,
                            file: null,
                            filePaths: [doc.file?.path || ""],
                            isUploading: false,
                            fileId: doc.file?.id
                        };
                        setFileIds(prev => ({ ...prev, [fieldName]: doc.file?.id || null }));
                    }
                });
                setFiles(initialFiles);
            }
        }
    }, [applicationData]);

    useEffect(() => {
        Object.keys(fileInputRefs.current).forEach((fieldNameKey) => {
            const fieldName = fieldNameKey as FileFieldName;
            const defaultType = getDefaultDocumentType(fieldName);
            setFiles(prev => ({
                ...prev,
                [fieldName]: {
                    type: defaultType,
                    file: null,
                    filePaths: [],
                    isUploading: false,
                    fileId: prev[fieldName]?.fileId || null
                }
            }));
        });
    }, []);

    return (
        <div className="pt-10 px-4 pb-10">
            <Space direction="vertical" size="middle" className="w-full">
                <div className="mb-4">
                    <h1 className="text-headerBlue text-[14px] font-[500]">
                        Other Documents
                    </h1>
                </div>

                <DocumentUpload
                    label="Saglyk kepilnama"
                    fieldName="saglykKepilnama"
                    file={files.saglykKepilnama?.file}
                    selectedDocumentType={files.saglykKepilnama?.type}
                    isUploading={files.saglykKepilnama?.isUploading}
                    fileInputRef={el => (fileInputRefs.current.saglykKepilnama = el)}
                    onFileChange={handleFileChange}
                    onPlusClick={handlePlusClick}
                    onDeleteFile={handleDeleteFile}
                    defaultDocumentType={getDefaultDocumentType("saglykKepilnama")}
                    fileId={files.saglykKepilnama?.fileId}
                />

                <DocumentUpload
                    label="3 arka"
                    fieldName="threeArka"
                    file={files.threeArka?.file}
                    selectedDocumentType={files.threeArka?.type}
                    isUploading={files.threeArka?.isUploading}
                    fileInputRef={el => (fileInputRefs.current.threeArka = el)}
                    onFileChange={handleFileChange}
                    onPlusClick={handlePlusClick}
                    onDeleteFile={handleDeleteFile}
                    defaultDocumentType={getDefaultDocumentType("threeArka")}
                    fileId={files.threeArka?.fileId}
                />

                <DocumentUpload
                    label="Maglumat"
                    fieldName="maglumat"
                    file={files.maglumat?.file}
                    selectedDocumentType={files.maglumat?.type}
                    isUploading={files.maglumat?.isUploading}
                    fileInputRef={el => (fileInputRefs.current.maglumat = el)}
                    onFileChange={handleFileChange}
                    onPlusClick={handlePlusClick}
                    onDeleteFile={handleDeleteFile}
                    defaultDocumentType={getDefaultDocumentType("maglumat")}
                    fileId={files.maglumat?.fileId}
                />

                <DocumentUpload
                    label="Terjimehal"
                    fieldName="terjimehal"
                    file={files.terjimehal?.file}
                    selectedDocumentType={files.terjimehal?.type}
                    isUploading={files.terjimehal?.isUploading}
                    fileInputRef={el => (fileInputRefs.current.terjimehal = el)}
                    onFileChange={handleFileChange}
                    onPlusClick={handlePlusClick}
                    onDeleteFile={handleDeleteFile}
                    defaultDocumentType={getDefaultDocumentType("terjimehal")}
                    fileId={files.terjimehal?.fileId}
                />

                <DocumentUpload
                    label="3X4 surat"
                    fieldName="threeXFourSurat"
                    file={files.threeXFourSurat?.file}
                    selectedDocumentType={files.threeXFourSurat?.type}
                    isUploading={files.threeXFourSurat?.isUploading}
                    fileInputRef={el => (fileInputRefs.current.threeXFourSurat = el)}
                    onFileChange={handleFileChange}
                    onPlusClick={handlePlusClick}
                    onDeleteFile={handleDeleteFile}
                    defaultDocumentType={getDefaultDocumentType("threeXFourSurat")}
                    fileId={files.threeXFourSurat?.fileId}
                />

                {gender !== 'female' && (
                    <DocumentUpload
                        label="Military service"
                        fieldName="militaryService"
                        file={files.militaryService?.file}
                        selectedDocumentType={files.militaryService?.type}
                        isUploading={files.militaryService?.isUploading}
                        fileInputRef={el => (fileInputRefs.current.militaryService = el)}
                        onFileChange={handleFileChange}
                        onPlusClick={handlePlusClick}
                        onDeleteFile={handleDeleteFile}
                        defaultDocumentType={getDefaultDocumentType("militaryService")}
                        fileId={files.militaryService?.fileId}
                    />
                )}

                <DocumentUpload
                    label="Nika haty"
                    fieldName="nikaHaty"
                    file={files.nikaHaty?.file}
                    selectedDocumentType={files.nikaHaty?.type}
                    isUploading={files.nikaHaty?.isUploading}
                    fileInputRef={el => (fileInputRefs.current.nikaHaty = el)}
                    onFileChange={handleFileChange}
                    onPlusClick={handlePlusClick}
                    onDeleteFile={handleDeleteFile}
                    defaultDocumentType={getDefaultDocumentType("nikaHaty")}
                    fileId={files.nikaHaty?.fileId}
                />

                <div className="flex justify-end mt-12 space-x-5">
                    <Link
                        to='/infos/edit-awards-info'
                        className="text-textSecondary bg-white border  border-#DFE5EF hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all hover:duration-500"
                    >
                        Previous
                    </Link>

                    <button
                        onClick={handleSubmit}
                        className="bg-primaryBlue hover:text-white  text-white  py-2 px-4 rounded"
                        disabled={isEditingClient}
                    >
                        {isEditingClient ? "Submitting..." : "Finish"}
                    </button>
                </div>
            </Space>
        </div>
    );
};

interface DocumentUploadProps {
    label: string;
    fieldName: FileFieldName;
    file?: File | null;
    selectedDocumentType?: DocumentType | null;
    isUploading?: boolean;
    fileInputRef: (el: HTMLInputElement | null) => void;
    onFileChange: (fieldName: FileFieldName, e: React.ChangeEvent<HTMLInputElement>) => void;
    onPlusClick: (fieldName: FileFieldName) => void;
    onDeleteFile: (fieldName: FileFieldName) => void;
    defaultDocumentType: DocumentType;
    required?: boolean;
    fileId?: number | null;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
    label,
    fieldName,
    file,
    selectedDocumentType,
    isUploading,
    fileInputRef,
    onFileChange,
    onPlusClick,
    onDeleteFile,
    defaultDocumentType,
    required = true,
    fileId,
}) => {

    return (
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
            <label className="w-44 font-[400] text-[14px] self-center">{label} ({defaultDocumentType})</label>
            <Space direction="vertical">

                <div className="flex items-center justify-center space-x-2">
                    <Button
                        onClick={() => {
                            if (file || fileId) {
                                onDeleteFile(fieldName);
                            } else {
                                onPlusClick(fieldName);
                            }
                        }}
                        type="text"
                        className="cursor-pointer hover:bg-hoverBgFile bg-bgFile border-[#DFE5EF] rounded-md text-[14px] w-[400px] h-[40px] flex items-center justify-center"
                    >
                        {isUploading ? (
                            <Spin size="small" />
                        ) : (
                            <div className="flex items-center justify-center w-full gap-1">
                                {file ? file.name : (fileId ? "Dosya Yüklendi" : "Attach document")}
                                {file || fileId ? <TrashIcon /> : <PlusIcon style={{ fontSize: '16px' }} />}
                            </div>
                        )}
                    </Button>

                    <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => onFileChange(fieldName, e)}
                        ref={fileInputRef}
                        required={required}
                    />

                    <InfoCircleIcon className="text-blue-500 hover:text-blue-700" />
                </div>
            </Space>
        </div>
    );
};

export default EditOtherDocuments;