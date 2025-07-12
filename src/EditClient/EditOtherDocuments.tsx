import React, { useState, useRef, useEffect } from 'react';
import { Space, Button, Spin, Form, DatePicker } from "antd";
import InfoCircleIcon from "../assets/icons/InfoCircleIcon";
import { Link, useNavigate } from "react-router-dom";
import PlusIcon from "../assets/icons/PlusIcon";
import TrashIcon from "../assets/icons/TrashIcon";
import toast from "react-hot-toast";
import { useSendFiles } from '../hooks/ApplicationList/useSendFiles';
import { useEditClient } from '../hooks/Client/useEditCLient';
import { useApplicationStore } from '../store/applicationStore';
import dayjs from 'dayjs';

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
  degree: "BACHELOR" | "MASTER" | undefined;
  primary_major: number | undefined;
  admission_major: number[];
  user: any;
  guardians: any[];
  institutions: any[];
  olympics: any[];
  documents: { type: DocumentType, file: number | null }[];
  status: "PENDING" | "APPROVED" | "REJECTED" | undefined;
}

const EditOtherDocuments = () => {
  const navigate = useNavigate();
  const { mutate: editClient, isPending: isEditingClient } = useEditClient();
  const { mutate: uploadFile } = useSendFiles();
  const { applicationData } = useApplicationStore();
  const [form] = Form.useForm();

  const [files, setFiles] = useState<{ [key in FileFieldName]?: FileState }>({});
  const [fileIds, setFileIds] = useState<FileIdsState>({});
  const [gender, setGender] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRefs = useRef<{ [key in FileFieldName]: HTMLInputElement | null }>({
    saglykKepilnama: null,
    threeArka: null,
    maglumat: null,
    terjimehal: null,
    threeXFourSurat: null,
    militaryService: null,
    nikaHaty: null,
  });

  const formatDate = (date: any): string => {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD');
  };

  const uploadDocument = async (fieldName: FileFieldName, file: File, documentType: DocumentType) => {
    return new Promise<number>((resolve, reject) => {
      const formData = new FormData();
      formData.append('path', file);
      formData.append('documentType', documentType);

      uploadFile(formData, {
        onSuccess: (data: any) => {
          setFileIds(prev => ({ ...prev, [fieldName]: data.id }));
          setFiles(prev => ({
            ...prev,
            [fieldName]: {
              ...prev[fieldName],
              type: documentType,
              isUploading: false,
              fileId: data.id,
              filePaths: [data.path]
            }
          }));
          resolve(data.id);
        },
        onError: (error: any) => {
          toast.error('Dosya yükleme başarısız');
          setFiles(prev => {
            const updated = { ...prev };
            delete updated[fieldName];
            return updated;
          });
          setFileIds(prev => {
            const updated = { ...prev };
            delete updated[fieldName];
            return updated;
          });
          reject(error);
        },
      });
    });
  };

  const handleFileChange = async (fieldName: FileFieldName, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentFileState = files[fieldName] || {
      type: getDefaultDocumentType(fieldName),
      file: null,
      filePaths: [],
      isUploading: false
    };

    setFiles(prev => ({
      ...prev,
      [fieldName]: {
        ...currentFileState,
        file,
        isUploading: true
      }
    }));

    try {
      await uploadDocument(fieldName, file, currentFileState.type!);
    } catch (error) {
      setFiles(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
      toast.error(`${getLabelFromFieldName(fieldName)} yüklenemedi.`);
    }
  };

  const handlePlusClick = (fieldName: FileFieldName) => {
    fileInputRefs.current[fieldName]?.click();
  };

  const handleDeleteFile = (fieldName: FileFieldName) => {
    setFiles(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    setFileIds(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
    toast.success(`${getLabelFromFieldName(fieldName)} başarıyla silindi.`);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const requiredFields: FileFieldName[] = [
      "saglykKepilnama", 
      "threeArka", 
      "maglumat", 
      "terjimehal", 
      "threeXFourSurat"
    ];
    
    if (gender !== 'female') {
      requiredFields.push("militaryService");
    }

    const missingFields = requiredFields.filter(field => !fileIds[field]);
    if (missingFields.length > 0) {
      toast.error(`Lütfen yükleyin: ${missingFields.map(getLabelFromFieldName).join(', ')}.`);
      setIsSubmitting(false);
      return;
    }

    try {
      const {
        degree,
        primaryMajor,
        additionalMajors,
        generalInformation,
        guardians,
        educationInfos,
        awardInfos,
        applicationData: currentAppData
      } = useApplicationStore.getState();

      if (!currentAppData?.id) {
        throw new Error("Başvuru ID bulunamadı");
      }

      // Tarih formatlama
      const formattedUser = {
        ...generalInformation,
        date_of_birth: formatDate(generalInformation.date_of_birth)
      };

      const formattedGuardians = guardians.map(guardian => ({
        ...guardian,
        date_of_birth: formatDate(guardian.date_of_birth),
        documents: guardian.documents?.map(doc => ({
          type: doc.type,
          file: doc.file
        })) || []
      }));

      const documents = Object.entries(fileIds)
        .map(([key, fileId]) => {
          if (!fileId) return null;
          return {
            type: getDefaultDocumentType(key as FileFieldName),
            file: fileId
          };
        })
        .filter(Boolean) as { type: DocumentType; file: number }[];

      const clientData: IClient = {
        degree,
        primary_major: primaryMajor,
        admission_major: additionalMajors,
        user: formattedUser,
        guardians: formattedGuardians,
        institutions: educationInfos.map(edu => ({
          id: edu.id,
          name: edu.name,
          school_gpa: edu.school_gpa,
          graduated_year: edu.graduated_year,
          certificates: edu.certificates?.map(c => c.id) || []
        })),
        olympics: awardInfos.map(award => ({
          id: award.id,
          type: award.type,
          description: award.description,
          files: award.files?.map(f => f.id) || []
        })),
        documents,
        status: currentAppData.status
      };

      await editClient({ 
        id: currentAppData.id, 
        data: clientData 
      });

      toast.success('Başvuru başarıyla gönderildi!');
      useApplicationStore.getState().resetAll();
      navigate("/application_list");
    } catch (error) {
      console.error("Gönderim hatası:", error);
      toast.error('Başvuru gönderilemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const { generalInformation } = useApplicationStore.getState();
    if (generalInformation.gender) {
      setGender(generalInformation.gender);
    } else {
      const storedGender = sessionStorage.getItem("gender");
      if (storedGender) setGender(storedGender);
    }
  }, []);

  useEffect(() => {
    if (applicationData?.user?.documents) {
      const initialFiles: typeof files = {};
      const initialFileIds: typeof fileIds = {};

      applicationData.user.documents.forEach((doc: any) => {
        const fieldName = getFieldNameFromDocumentType(doc.type);
        if (fieldName && doc.file) {
          initialFiles[fieldName] = {
            type: doc.type as DocumentType,
            file: null,
            filePaths: [doc.file.path || ""],
            isUploading: false,
            fileId: doc.file.id
          };
          initialFileIds[fieldName] = doc.file.id;
        }
      });

      setFiles(initialFiles);
      setFileIds(initialFileIds);
    }
  }, [applicationData]);

  // Helper functions remain the same...
  const getDefaultDocumentType = (fieldName: FileFieldName): DocumentType => {
    const map: Record<FileFieldName, DocumentType> = {
      "threeXFourSurat": "labor_book",
      "saglykKepilnama": "medical_record",
      "threeArka": "relationship_tree",
      "maglumat": "information",
      "terjimehal": "terjiimehal",
      "militaryService": "military_document",
      "nikaHaty": "nika_haty"
    };
    return map[fieldName];
  };

  const getFieldNameFromDocumentType = (type: string): FileFieldName | null => {
    const map: Record<string, FileFieldName> = {
      'medical_record': "saglykKepilnama",
      'relationship_tree': "threeArka",
      'terjiimehal': "terjimehal",
      'military_document': "militaryService",
      'nika_haty': "nikaHaty",
      'information': "maglumat",
      'labor_book': "threeXFourSurat"
    };
    return map[type] || null;
  };

  const getLabelFromFieldName = (fieldName: FileFieldName): string => {
    const labels: Record<FileFieldName, string> = {
      "saglykKepilnama": "Sağlık Kepilnama",
      "threeArka": "3 Arka",
      "maglumat": "Maglumat",
      "terjimehal": "Terjimehal",
      "threeXFourSurat": "3x4 Fotoğraf",
      "militaryService": "Askerlik Belgesi",
      "nikaHaty": "Nikah Belgesi"
    };
    return labels[fieldName];
  };

  const isFieldRequired = (fieldName: FileFieldName, gender: string | null): boolean => {
    const requiredFields: FileFieldName[] = [
      "saglykKepilnama", 
      "threeArka", 
      "maglumat", 
      "terjimehal", 
      "threeXFourSurat"
    ];
    
    if (gender !== 'female') {
      requiredFields.push("militaryService");
    }
    
    return requiredFields.includes(fieldName);
  };

  return (
    <div className="pt-10 px-4 pb-10">
      <Form form={form} onFinish={handleSubmit}>
        <Space direction="vertical" size="middle" className="w-full">
          <div className="mb-4">
            <h1 className="text-headerBlue text-[14px] font-[500]">
              Diğer Belgeler
            </h1>
          </div>

          {Object.entries(fileInputRefs.current).map(([fieldNameKey, ref]) => {
            const fieldName = fieldNameKey as FileFieldName;
            const fileState = files[fieldName];
            
            if (fieldName === "militaryService" && gender === 'female') {
              return null;
            }

            return (
              <DocumentUpload
                key={fieldName}
                label={getLabelFromFieldName(fieldName)}
                fieldName={fieldName}
                file={fileState?.file}
                isUploading={fileState?.isUploading}
                fileInputRef={el => (fileInputRefs.current[fieldName] = el)}
                onFileChange={handleFileChange}
                onPlusClick={handlePlusClick}
                onDeleteFile={handleDeleteFile}
                defaultDocumentType={getDefaultDocumentType(fieldName)}
                fileId={fileState?.fileId}
                required={isFieldRequired(fieldName, gender)}
              />
            );
          })}

          <div className="flex justify-end mt-12 space-x-5">
            <Link
              to='/infos/edit-awards-info'
              className="text-textSecondary bg-white border border-#DFE5EF hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all hover:duration-500"
            >
              Önceki
            </Link>

            <Button
              htmlType="submit"
              className="bg-primaryBlue hover:text-white text-white py-2 px-4 rounded"
              disabled={isSubmitting || isEditingClient}
            >
              {isSubmitting || isEditingClient ? (
                <Spin size="small" />
              ) : (
                "Tamamla"
              )}
            </Button>
          </div>
        </Space>
      </Form>
    </div>
  );
};

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

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  fieldName,
  file,
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
      <label className="w-44 font-[400] text-[14px] self-center">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <Space direction="vertical">
        <div className="flex items-center justify-center space-x-2">
          <Button
            onClick={() => file || fileId ? onDeleteFile(fieldName) : onPlusClick(fieldName)}
            type="text"
            className="cursor-pointer hover:bg-hoverBgFile bg-bgFile border-[#DFE5EF] rounded-md text-[14px] w-[400px] h-[40px] flex items-center justify-center"
            disabled={isUploading}
          >
            {isUploading ? (
              <Spin size="small" />
            ) : (
              <div className="flex items-center justify-center w-full gap-1">
                {file ? file.name : (fileId ? "Dosya Yüklendi" : "Belge Ekle")}
                {file || fileId ? <TrashIcon /> : <PlusIcon style={{ fontSize: '16px' }} />}
              </div>
            )}
          </Button>

          <input
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => onFileChange(fieldName, e)}
            ref={fileInputRef}
            accept=".pdf,.jpg,.jpeg,.png"
          />

          <InfoCircleIcon className="text-blue-500 hover:text-blue-700" />
        </div>
      </Space>
    </div>
  );
};

export default EditOtherDocuments;