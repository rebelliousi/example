import React, { useState, useRef, useEffect } from 'react';
import { Space, Button, Spin } from "antd"; //Import select
import InfoCircleIcon from "../../assets/icons/InfoCircleIcon";
import { Link, useNavigate } from "react-router-dom";
import PlusIcon from "../../assets/icons/PlusIcon";
import TrashIcon from "../../assets/icons/TrashIcon"; // Import TrashIcon

import toast from "react-hot-toast";
import { useSendFiles } from '../../hooks/ApplicationList/useSendFiles';
import { useAddClient } from '../../hooks/Client/useAddClient';

export type DocumentType = // Moved to the top-level for better reusability
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
    | 'diploma';

type FileFieldName = "saglykKepilnama" | "threeArka" | "maglumat" | "terjimehal" | "threeXFourSurat" | "militaryService" | "nikaHaty";

// Remove enum DocumentType and use the type definition above

interface FileState {
    type: DocumentType | null; // Allow null initially
    file: File | null;
    filePaths: string[];
    isUploading: boolean; // Yükleme durumunu takip etmek için
}

interface FileIdsState {
    [key: string]: number | null;
}

interface AwardInfo {
    awardType?: string;
    description?: string;
    certificate?: File | null;
}

// Interface for the Client Data
interface IClient {
    degree: string;
    primary_major: string;
    admission_major: string;
    user: any; // Replace 'any' with a more specific type if you have one for user info
    guardians: any[]; // Replace 'any[]' with a more specific type if you have one for guardian info
    institutions: any[]; // Replace 'any[]' with a more specific type if you have one for education info
    olympics: any[]; // Replace 'any[]' with a more specific type if you have one for award info
    documents: { type: DocumentType, file: number | null }[];
}

const OtherDocuments = () => {
    const navigate = useNavigate();
    const { mutate: addClient, isPending: isAddingClient } = useAddClient();
    const { mutate: uploadFile } = useSendFiles();

    const [files, setFiles] = useState<{ [key in FileFieldName]?: FileState }>({});
    const [fileIds, setFileIds] = useState<FileIdsState>({});
    const [gender, setGender] = useState<string | null>(null); // State to hold gender

    const fileInputRefs = useRef<{
        [key in FileFieldName]: HTMLInputElement | null;
    }>({
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
            formData.append('documentType', documentType); //Send Doc Type

            uploadFile(formData, {
                onSuccess: (data: any) => {
                    console.log(`File uploaded successfully for ${fieldName}:`, data.id); // DEBUG
                    setFileIds(prev => ({ ...prev, [fieldName]: data.id }));
                    setFiles(prev => {
                        const updatedFiles = { ...prev };
                        if (updatedFiles[fieldName]) {
                            updatedFiles[fieldName]!.isUploading = false;
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
                // This should not happen anymore because types are pre-selected
                console.warn("Document type was unexpectedly null.");
                return;
            }

            setFiles(prev => ({
                ...prev,
                [fieldName]: {
                    ...currentFileState,
                    file: file,
                    isUploading: true
                }
            }));

            try {
                const fileId = await uploadDocument(fieldName, file, currentFileState.type);
                setFileIds(prev => ({ ...prev, [fieldName]: fileId }));
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

    //Silme işlemini yönetecek fonksiyon
    const handleDeleteFile = (fieldName: FileFieldName) => {
        setFiles(prev => {
            const { [fieldName]: deleted, ...rest } = prev;
            return rest;
        });
        setFileIds(prev => {
            const { [fieldName]: deleted, ...rest } = prev;
            return rest;
        });
    };

    //No longer used - type is now pre-selected
    // const handleDocumentTypeChange = (fieldName: FileFieldName, value: DocumentType | null) => {
    //     setFiles(prev => ({
    //         ...prev,
    //         [fieldName]: {
    //             ...prev[fieldName] || { file: null, filePaths: [], isUploading: false }, // Preserve existing file if any.
    //             type: value
    //         }
    //     }));
    // };

    const handleSubmit = async () => {
        // Validation: Ensure required files are uploaded (except Nika Haty)
        const requiredFields: FileFieldName[] = ["saglykKepilnama", "threeArka", "maglumat", "terjimehal", "threeXFourSurat",];
        if (gender !== 'female') {
            requiredFields.push("militaryService"); //Add to required fields only if NOT female.
        }

        for (const field of requiredFields) {
            if (!fileIds[field]) {
                toast.error(`Please upload ${field}`);
                return; // Stop submission
            }
        }

        // Retrieve data from sessionStorage
        const degreeInformation = JSON.parse(sessionStorage.getItem('degreeInformation') || '{}');
        const generalInformation = JSON.parse(sessionStorage.getItem('generalInformation') || '{}');
        const guardians = JSON.parse(sessionStorage.getItem('guardians') || '[]');
        console.log("OtherDocuments - handleSubmit - sessionStorage'dan okunan guardians verisi:", guardians);
        const educationInformation = JSON.parse(sessionStorage.getItem('educationInformation') || '[]');
        const awardInformation = JSON.parse(sessionStorage.getItem('awardInformation') || '[]');

        // Create the IClient object
        const clientData: IClient = {
            degree: degreeInformation.degree,
            primary_major: degreeInformation.primary_major,
            admission_major: degreeInformation.admission_major,
            user: generalInformation,
            guardians: guardians.map((guardian: any) => ({
                ...guardian,
                date_of_birth: guardian.date_of_birth,
                documents: guardian.documents.map((doc: any) => ({
                    type: doc.type,
                    file: doc.file,
                })),
            })),
            institutions: educationInformation.map((education: any) => ({
                name: education.name,
                school_gpa: education.school_gpa,
                graduated_year: education.graduated_year,
                certificates: education.files,
            })),
            olympics: awardInformation.map((award: any) => ({
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
                        documentType = "information";
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
                    return null;  // Or handle the case where value is null differently
                }
            }).filter(doc => doc !== null) as { type: DocumentType; file: number }[], //Explicit type assertion and filtering null values
        };

        console.log("Client Data being submitted:", clientData); // Verileri konsola yazdır

        // API call
        try {
            const response = await addClient(clientData);

            //** ADD THIS LOG **//
            console.log("API Response:", response);

            toast.success('Application submitted');

            // *** Benzersiz bir tanımlayıcı ile sessionStorage'a kaydet ***
            const uniqueIdentifier = `applicationSubmitted_${Date.now()}`;
            sessionStorage.setItem('applicationStatus', uniqueIdentifier);

            // SADECE başvuruyla ilgili anahtarları sil
            sessionStorage.removeItem('degreeInformation');
            sessionStorage.removeItem('generalInformation');
            sessionStorage.removeItem('guardians');
            sessionStorage.removeItem('educationInformation');
            sessionStorage.removeItem('awardInformation');
            sessionStorage.removeItem('gender');

            navigate("/application_list");
        } catch (error: any) {
            // ** AND ADD THIS LOG **//
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
            case "saglykKepilnama":
                return "medical_record";
            case "threeArka":
                return "relationship_tree";
            case "maglumat":
                return "information";
            case "terjimehal":
                return "terjiimehal";
            case "threeXFourSurat":
                return "information";
            case "militaryService":
                return "military_document";
            case "nikaHaty":
                return "nika_haty";
            default:
                throw new Error(`Unknown field name: ${fieldName}`);
        }
    };

    useEffect(() => {
        // Set default document types on component mount
        Object.keys(fileInputRefs.current).forEach((fieldNameKey) => {
            const fieldName = fieldNameKey as FileFieldName;
            const defaultType = getDefaultDocumentType(fieldName);
            setFiles(prev => ({
                ...prev,
                [fieldName]: {
                    type: defaultType,
                    file: null,
                    filePaths: [],
                    isUploading: false
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
                    onDeleteFile={handleDeleteFile} //Dosya silme işleyicisi aktarılıyor
                    // onDocumentTypeChange={handleDocumentTypeChange} // Pass handler - No longer used
                    defaultDocumentType={getDefaultDocumentType("saglykKepilnama")} // Pass default type
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
                    onDeleteFile={handleDeleteFile} //Dosya silme işleyicisi aktarılıyor
                    // onDocumentTypeChange={handleDocumentTypeChange} // Pass handler - No longer used
                    defaultDocumentType={getDefaultDocumentType("threeArka")} // Pass default type
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
                    onDeleteFile={handleDeleteFile} //Dosya silme işleyicisi aktarılıyor
                    // onDocumentTypeChange={handleDocumentTypeChange} // Pass handler - No longer used
                    defaultDocumentType={getDefaultDocumentType("maglumat")} // Pass default type
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
                    onDeleteFile={handleDeleteFile} //Dosya silme işleyicisi aktarılıyor
                    // onDocumentTypeChange={handleDocumentTypeChange} // Pass handler - No longer used
                    defaultDocumentType={getDefaultDocumentType("terjimehal")} // Pass default type
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
                    onDeleteFile={handleDeleteFile} //Dosya silme işleyicisi aktarılıyor
                    // onDocumentTypeChange={handleDocumentTypeChange} // Pass handler - No longer used
                    defaultDocumentType={getDefaultDocumentType("threeXFourSurat")} // Pass default type
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
                        onDeleteFile={handleDeleteFile} //Dosya silme işleyicisi aktarılıyor
                        // onDocumentTypeChange={handleDocumentTypeChange} // Pass handler - No longer used
                        defaultDocumentType={getDefaultDocumentType("militaryService")} // Pass default type
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
                    onDeleteFile={handleDeleteFile} //Dosya silme işleyicisi aktarılıyor
                    // onDocumentTypeChange={handleDocumentTypeChange} // Pass handler - No longer used
                    defaultDocumentType={getDefaultDocumentType("nikaHaty")} // Pass default type
                />

                <div className="flex justify-end mt-12 space-x-5">
                    <Link
                        to='/infos/awards-info'
                        className="text-textSecondary bg-white border  border-#DFE5EF hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all hover:duration-500"
                    >
                        Previous
                    </Link>

                    <button
                        onClick={handleSubmit}
                        className="bg-primaryBlue hover:text-white  text-white  py-2 px-4 rounded"
                        disabled={isAddingClient}
                    >
                        {isAddingClient ? "Submitting..." : "Finish"}
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
    onDeleteFile: (fieldName: FileFieldName) => void; //Silme işleyicisi eklendi
    // onDocumentTypeChange: (fieldName: FileFieldName, value: DocumentType | null) => void; //No longer used
    defaultDocumentType: DocumentType;  //New Prop - Default Document Type
    required?: boolean;
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
    onDeleteFile, //Silme işleyicisi alındı
    // onDocumentTypeChange, //No longer used
    defaultDocumentType,  //New Prop
    required = true
}) => {
    // const documentTypeOptions = [    //No longer used in DocumentUpload
    //     { value: 'school_certificate', label: 'School Certificate' },
    //     { value: 'passport', label: 'Passport' },
    //     { value: 'military_document', label: 'Military Document' },
    //     { value: 'information', label: 'Information' },
    //     { value: 'relationship_tree', label: 'Relationship Tree' },
    //     { value: 'medical_record', label: 'Medical Record' },
    //     { value: 'description', label: 'Description' },
    //     { value: 'terjiimehal', label: 'Terjiimehal' },
    //     { value: 'labor_book', label: 'Labor Book' },
    //     { value: 'Dushundirish', label: 'Dushundirish' },
    //     { value: 'nika_haty', label: 'Nika Haty' },
    //     { value: 'death_certificate', label: 'Death Certificate' },
    //     { value: 'diploma', label: 'Diploma' },
    // ];

    return (
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
            <label className="w-44 font-[400] text-[14px] self-center">{label} ({defaultDocumentType})</label>
            <Space direction="vertical">
                {/*  Select component removed - type is preselected */}
                {/*<Select*/}
                {/*    placeholder="Select Document Type"*/}
                {/*    style={{ width: 400 }}*/}
                {/*    value={selectedDocumentType || undefined}*/}
                {/*    onChange={(value) => onDocumentTypeChange(fieldName, value as DocumentType | null)}*/}
                {/*options={documentTypeOptions}*/}
                {/*/>*/}

                <div className="flex items-center justify-center space-x-2">
                    <Button
                        onClick={() => {
                            if (file) {
                                onDeleteFile(fieldName); //Dosyayı sil
                            } else {
                                onPlusClick(fieldName); //Dosya seçme penceresini aç
                            }
                        }}
                        type="text"
                        className="cursor-pointer hover:bg-hoverBgFile bg-bgFile border-[#DFE5EF] rounded-md text-[14px] w-[400px] h-[40px] flex items-center justify-center"
                    >
                        {isUploading ? (
                            <Spin size="small" />
                        ) : (
                            <div className="flex items-center justify-center w-full gap-1">
                                {file ? file.name : "Attach document"}
                                {file ? <TrashIcon /> : <PlusIcon style={{ fontSize: '16px' }} />}
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

export default OtherDocuments;