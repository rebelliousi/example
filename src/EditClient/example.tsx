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

// TypeScript tipleriniz (Değişiklik yok)
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
    | 'relations';

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

interface IClient {
    degree: string | undefined;
    primary_major: number | undefined;
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

    // Bu hook'u sadece başlangıç verilerini (applicationData) yüklemek
    // ve UI'ı ilk render etmek için kullanıyoruz.
    const { applicationData } = useApplicationStore();

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

    // --- Dosya Yükleme Fonksiyonları (Değişiklik Gerekmiyor) ---
    const uploadDocument = async (fieldName: FileFieldName, file: File, documentType: DocumentType) => {
        return new Promise<number>((resolve, reject) => {
            const formData = new FormData();
            formData.append('path', file);
            formData.append('documentType', documentType);
            uploadFile(formData, {
                onSuccess: (data: any) => {
                    setFileIds(prev => ({ ...prev, [fieldName]: data.id }));
                    setFiles(prev => ({ ...prev, [fieldName]: { ...prev[fieldName]!, isUploading: false, fileId: data.id, filePaths: [data.path] } }));
                    resolve(data.id);
                },
                onError: (error: any) => {
                    toast.error(`File upload failed for ${fieldName}`);
                    reject(error);
                },
            });
        });
    };

    const handleFileChange = async (fieldName: FileFieldName, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const currentFileState = files[fieldName];
            if (!currentFileState?.type) return;
            setFiles(prev => ({ ...prev, [fieldName]: { ...currentFileState, file, isUploading: true } }));
            try {
                await uploadDocument(fieldName, file, currentFileState.type);
            } catch (error) {
                setFiles(prev => ({ ...prev, [fieldName]: { ...prev[fieldName]!, file: null, isUploading: false } }));
            }
        }
    };

    const handlePlusClick = (fieldName: FileFieldName) => fileInputRefs.current[fieldName]?.click();
    const handleDeleteFile = (fieldName: FileFieldName) => {
        setFiles(prev => ({ ...prev, [fieldName]: { ...prev[fieldName]!, file: null, fileId: null, filePaths: [] } }));
        setFileIds(prev => {
            const { [fieldName]: _, ...rest } = prev;
            return rest;
        });
    };
    // -----------------------------------------------------------

    // ***************************************************************
    // ******** ANA DEĞİŞİKLİĞİN YAPILDIĞI YER: handleSubmit *********
    // ***************************************************************
    const handleSubmit = async () => {
        const requiredFields: FileFieldName[] = ["saglykKepilnama", "threeArka", "maglumat", "terjimehal", "threeXFourSurat"];
        if (gender !== 'female') {
            requiredFields.push("militaryService");
        }
        for (const field of requiredFields) {
            if (!fileIds[field]) {
                toast.error(`Please upload the required document: ${field}`);
                return;
            }
        }

        // --- ÇÖZÜM: STALE STATE'İ ÖNLEMEK ---
        // Fonksiyon çalıştığı anda store'un en güncel halini alıyoruz.
        const currentState = useApplicationStore.getState();

        if (!currentState.applicationData?.id) {
            toast.error("Application ID not found. Cannot submit.");
            return;
        }

        // clientData nesnesini, bileşenin tepesindeki eski değişkenlerle değil,
        // tam şu anda aldığımız güncel 'currentState' verileriyle oluşturuyoruz.
        const clientData: IClient = {
            degree: currentState.degree,
            primary_major: currentState.primaryMajor,
            admission_major: currentState.additionalMajors,
            user: currentState.generalInformation,
            guardians: currentState.guardians.map(g => ({ ...g, documents: g.documents.map(d => ({ type: d.type, file: d.file })) })),
            institutions: currentState.educationInfos.map(edu => ({ id: edu.id, name: edu.name, school_gpa: edu.school_gpa, graduated_year: edu.graduated_year, certificates: edu.certificates?.map(cert => cert.id) })),
            olympics: currentState.awardInfos.map(award => ({ id: award.id, type: award.type, description: award.description, files: award.files?.map(file => file.id) })),
            documents: Object.entries(fileIds).map(([key, value]) => {
                let documentType: DocumentType | undefined;
                switch (key) {
                    case "saglykKepilnama": documentType = "medical_record"; break;
                    case "threeArka": documentType = "relationship_tree"; break;
                    case "maglumat": documentType = "information"; break;
                    case "terjimehal": documentType = "terjiimehal"; break;
                    case "threeXFourSurat": documentType = "labor_book"; break;
                    case "militaryService": documentType = "military_document"; break;
                    case "nikaHaty": documentType = "nika_haty"; break;
                }
                if (value !== null && documentType) {
                    return { type: documentType, file: value };
                }
                return null;
            }).filter(Boolean) as { type: DocumentType; file: number }[],
            status: currentState.applicationData?.status
        };

        console.log("Submitting FRESH data:", clientData);

        try {
            await editClient({ id: currentState.applicationData.id, data: clientData });
            toast.success('Application updated successfully!');
            navigate("/application_list");
        } catch (error: any) {
            console.error("API Submission Error:", error);
            toast.error('An error occurred while submitting the application.');
        }
    };

    // --- useEffect Kancaları (Değişiklik Gerekmiyor) ---
    useEffect(() => {
        const currentGender = useApplicationStore.getState().generalInformation.gender;
        setGender(currentGender);
    }, []);
    
    const getDefaultDocumentType = (fieldName: FileFieldName): DocumentType => {
        const map: Record<FileFieldName, DocumentType> = {
            "saglykKepilnama": "medical_record",
            "threeArka": "relationship_tree",
            "maglumat": "information",
            "terjimehal": "terjiimehal",
            "threeXFourSurat": "labor_book",
            "militaryService": "military_document",
            "nikaHaty": "nika_haty"
        };
        return map[fieldName];
    };

    useEffect(() => {
        if (applicationData?.user?.documents) {
            const initialFiles: { [key in FileFieldName]?: FileState } = {};
            const initialFileIds: FileIdsState = {};

            applicationData.user.documents.forEach((doc: any) => {
                let fieldName: FileFieldName | undefined;
                switch (doc.type) {
                    case 'medical_record': fieldName = "saglykKepilnama"; break;
                    case 'relationship_tree': fieldName = "threeArka"; break;
                    case 'terjiimehal': fieldName = "terjimehal"; break;
                    case 'military_document': fieldName = "militaryService"; break;
                    case 'nika_haty': fieldName = "nikaHaty"; break;
                    case 'information': fieldName = "maglumat"; break;
                    case 'labor_book': fieldName = "threeXFourSurat"; break;
                }
                if (fieldName && doc.file) {
                    initialFiles[fieldName] = { type: doc.type, file: null, filePaths: [doc.file.path || ""], isUploading: false, fileId: doc.file.id };
                    initialFileIds[fieldName] = doc.file.id;
                }
            });
            setFiles(prev => ({ ...prev, ...initialFiles }));
            setFileIds(prev => ({ ...prev, ...initialFileIds }));
        }
    }, [applicationData]);

    useEffect(() => {
        const allFieldNames: FileFieldName[] = ["saglykKepilnama", "threeArka", "maglumat", "terjimehal", "threeXFourSurat", "militaryService", "nikaHaty"];
        allFieldNames.forEach(fieldName => {
            setFiles(prev => {
                if (prev[fieldName]) return prev;
                return { ...prev, [fieldName]: { type: getDefaultDocumentType(fieldName), file: null, filePaths: [], isUploading: false, fileId: null } };
            });
        });
    }, []);
    
    // --- JSX (Arayüz) Kısmı (Değişiklik Gerekmiyor) ---
    return (
        <div className="pt-10 px-4 pb-10">
            <Space direction="vertical" size="middle" className="w-full">
                <div className="mb-4"><h1 className="text-headerBlue text-[14px] font-[500]">Other Documents</h1></div>

                {/* DocumentUpload bileşenlerini map ile oluşturmak daha temiz olabilir */}
                {(Object.keys(files) as FileFieldName[]).map(fieldName => {
                    if (fieldName === 'militaryService' && gender === 'female') return null; // Cinsiyete göre render etme
                    return (
                        <DocumentUpload
                            key={fieldName}
                            label={fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} // Otomatik etiket
                            fieldName={fieldName}
                            file={files[fieldName]?.file}
                            isUploading={files[fieldName]?.isUploading}
                            fileInputRef={el => (fileInputRefs.current[fieldName] = el)}
                            onFileChange={handleFileChange}
                            onPlusClick={handlePlusClick}
                            onDeleteFile={handleDeleteFile}
                            defaultDocumentType={getDefaultDocumentType(fieldName)}
                            fileId={files[fieldName]?.fileId}
                        />
                    )
                })}

                <div className="flex justify-end mt-12 space-x-5">
                    <Link to='/infos/edit-awards-info' className="text-textSecondary bg-white border border-[#DFE5EF] hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all hover:duration-500">Previous</Link>
                    <button onClick={handleSubmit} className="bg-primaryBlue text-white py-2 px-4 rounded" disabled={isEditingClient}>
                        {isEditingClient ? "Submitting..." : "Finish"}
                    </button>
                </div>
            </Space>
        </div>
    );
};


// DocumentUpload bileşeninde değişiklik yok
interface DocumentUploadProps {
    label: string;
    fieldName: FileFieldName;
    file?: File | null;
    isUploading?: boolean;
    fileInputRef: (el: HTMLInputElement | null) => void;
    onFileChange: (fieldName: FileFieldName, e: React.ChangeEvent<HTMLInputElement>) => void;
    onPlusClick: (fieldName: FileFieldName) => void;
    onDeleteFile: (fieldName: FileFieldName) => void;
    defaultDocumentType: DocumentType;
    required?: boolean;
    fileId?: number | null;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ label, fieldName, file, isUploading, fileInputRef, onFileChange, onPlusClick, onDeleteFile, fileId }) => (
    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
        <label className="w-44 font-[400] text-[14px] self-center">{label}</label>
        <Space>
            <div className="flex items-center justify-center space-x-2">
                <Button onClick={() => file || fileId ? onDeleteFile(fieldName) : onPlusClick(fieldName)} type="text" className="cursor-pointer hover:bg-hoverBgFile bg-bgFile border-[#DFE5EF] rounded-md text-[14px] w-[400px] h-[40px] flex items-center justify-center">
                    {isUploading ? <Spin size="small" /> : <div className="flex items-center justify-center w-full gap-1">{file ? file.name : (fileId ? "File Uploaded" : "Attach document")}{file || fileId ? <TrashIcon /> : <PlusIcon style={{ fontSize: '16px' }} />}</div>}
                </Button>
                <input type="file" style={{ display: 'none' }} onChange={(e) => onFileChange(fieldName, e)} ref={fileInputRef} />
                <InfoCircleIcon className="text-blue-500 hover:text-blue-700" />
            </div>
        </Space>
    </div>
);

export default EditOtherDocuments;