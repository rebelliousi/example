import React, { useState, useRef, useEffect } from "react";
import { Space, Button, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import moment from "moment";
import type { Moment } from "moment";
import { DocumentType, useApplicationStore } from "../store/applicationStore";
import { useSendFiles } from "../hooks/ApplicationList/useSendFiles";
import { useEditClient } from "../hooks/Client/useEditCLient";
import InfoCircleIcon from "../assets/icons/InfoCircleIcon";
import TrashIcon from "../assets/icons/TrashIcon";
import PlusIcon from "../assets/icons/PlusIcon";

/* ---------- TYPES ---------- */
export type FileFieldName =
  | "saglykKepilnama"
  | "threeArka"
  | "maglumat"
  | "terjimehal"
  | "threeXFourSurat"
  | "militaryService"
  | "nikaHaty";

interface FileState {
  type: DocumentType | null;
  file: File | null;
  filePaths: string[];
  isUploading: boolean;
  fileId: number | null;
}

interface GuardianDocument {
  type: string;
  file: { id: number } | string | number;
}

/* ---------- DOC‑TYPE ↔ FIELD MAPPING ---------- */
const docTypeToField: Record<DocumentType, FileFieldName | undefined> = {
  medical_record: "saglykKepilnama",
  relationship_tree: "threeArka",
  information: undefined, // iki farklı alan – altta kontrol ediyoruz
  terjiimehal: "terjimehal",
  military_document: "militaryService",
  nika_haty: "nikaHaty",
  passport: undefined,
  school_certificate: undefined,
  labor_book: undefined,
  description: undefined,
  Dushundirish: undefined,
  death_certificate: undefined,
  diploma: undefined,
  relations: undefined,
};

/* ---------- HELPER ---------- */
const pickFileId = (f: unknown): number | null => {
  if (typeof f === "object" && f !== null && "id" in f) {
    return (f as { id: number }).id;
  }
  const num = Number(f);
  return Number.isFinite(num) ? num : null;
};

/* ---------- COMPONENT ---------- */
const EditOtherDocuments: React.FC = () => {
  const navigate = useNavigate();
  const {
    applicationData,
    generalInformation,
    guardians,
    educationInfos,
    awardInfos,
  } = useApplicationStore();

  const { mutate: uploadFile } = useSendFiles();
  const editClientMutation = useEditClient();

  /* ---------- STATE ---------- */
  const [fileIds, setFileIds] = useState<{ [key in FileFieldName]?: number | null }>({});
  const [gender, setGender] = useState<string | null>(null);
  const [files, setFiles] = useState<{ [key in FileFieldName]?: FileState }>({
    saglykKepilnama: {
      type: "medical_record",
      file: null,
      filePaths: [],
      isUploading: false,
      fileId: null,
    },
    threeArka: {
      type: "relationship_tree",
      file: null,
      filePaths: [],
      isUploading: false,
      fileId: null,
    },
    maglumat: {
      type: "information",
      file: null,
      filePaths: [],
      isUploading: false,
      fileId: null,
    },
    terjimehal: {
      type: "terjimehal",
      file: null,
      filePaths: [],
      isUploading: false,
      fileId: null,
    },
    threeXFourSurat: {
      type: "information",
      file: null,
      filePaths: [],
      isUploading: false,
      fileId: null,
    },
    militaryService: {
      type: "military_document",
      file: null,
      filePaths: [],
      isUploading: false,
      fileId: null,
    },
    nikaHaty: {
      type: "nika_haty",
      file: null,
      filePaths: [],
      isUploading: false,
      fileId: null,
    },
  });

  /* ---------- REFS ---------- */
  const fileInputRefs = useRef<{ [key in FileFieldName]?: HTMLInputElement | null }>({});

  /* ---------- HYDRATE MEVCUT DOSYALAR ---------- */
  useEffect(() => {
    if (!applicationData?.user?.documents?.length) return;

    let infoSeen = 0;
    setFiles(prev => {
      const next = { ...prev };
      applicationData.user.documents.forEach((doc: any) => {
        let field = docTypeToField[doc.type as DocumentType];
        if (doc.type === "information") {
          field = infoSeen === 0 ? "maglumat" : "threeXFourSurat";
          infoSeen += 1;
        }
        if (!field) return;
        next[field] = {
          type: doc.type,
          file: null,
          filePaths: [doc.file?.path ?? ""],
          isUploading: false,
          fileId: doc.file?.id ?? null,
        };
      });
      return next;
    });

    setFileIds(prev => {
      const ids = { ...prev };
      infoSeen = 0;
      applicationData.user.documents.forEach((doc: any) => {
        let field = docTypeToField[doc.type as DocumentType];
        if (doc.type === "information") {
          field = infoSeen === 0 ? "maglumat" : "threeXFourSurat";
          infoSeen += 1;
        }
        if (field) ids[field] = doc.file?.id ?? null;
      });
      return ids;
    });
  }, [applicationData]);

  /* ---------- GENDER ---------- */
  useEffect(() => {
    const storedGender = sessionStorage.getItem("gender");
    if (storedGender) setGender(storedGender);
  }, []);

  /* ---------- SINGLE DOC UPLOAD ---------- */
  const uploadDocument = (
    fieldName: FileFieldName,
    file: File,
    documentType: DocumentType,
  ) =>
    new Promise<number>((resolve, reject) => {
      const formData = new FormData();
      formData.append("path", file);
      formData.append("documentType", documentType);

      uploadFile(formData, {
        onSuccess: (data: any) => {
          setFileIds(prev => ({ ...prev, [fieldName]: data.id }));
          setFiles(prev => {
            const updated = { ...prev };
            updated[fieldName] = {
              ...updated[fieldName]!,
              isUploading: false,
              fileId: data.id,
              filePaths: [data.path],
              file,
            };
            return updated;
          });
          resolve(data.id);
        },
        onError: err => {
          toast.error("File upload failed");
          setFiles(prev => {
            const updated = { ...prev };
            if (updated[fieldName]) updated[fieldName]!.isUploading = false;
            return updated;
          });
          reject(err);
        },
      });
    });

  /* ---------- HANDLERS ---------- */
  const handleFileChange = async (
    fieldName: FileFieldName,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const current = files[fieldName];
    if (!current?.type) return;

    setFiles(prev => ({
      ...prev,
      [fieldName]: { ...current, file, isUploading: true, filePaths: [], fileId: null },
    }));

    try {
      await uploadDocument(fieldName, file, current.type);
    } catch {
      /* already handled */
    }
  };

  const handlePlusClick = (f: FileFieldName) => fileInputRefs.current[f]?.click();

  const handleDeleteFile = (fieldName: FileFieldName) => {
    setFiles(prev => {
      const updated = { ...prev };
      if (updated[fieldName]) {
        updated[fieldName] = {
          ...updated[fieldName]!,
          file: null,
          filePaths: [],
          fileId: null,
        };
      }
      return updated;
    });
    setFileIds(prev => {
      const { [fieldName]: _deleted, ...rest } = prev;
      return rest;
    });
  };

  const formatDate = (d: Moment | null) => (d ? d.format("YYYY-MM-DD") : "");

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    // 1️⃣ Required uploads
    const required: FileFieldName[] = [
      "saglykKepilnama",
      "threeArka",
      "maglumat",
      "terjimehal",
      "threeXFourSurat",
    ];
    if (gender !== "female") required.push("militaryService");

    for (const f of required) {
      if (!fileIds[f]) return toast.error(`Please upload ${f}`);
    }

    // 2️⃣ Degree info stored in session
    const degreeData = JSON.parse(sessionStorage.getItem("zustandDegree") || "null");

    // 3️⃣ Clean & transform helpers ------------------------------------
    const cleanedEducationInfos = educationInfos.map(edu => ({
      name: edu.name,
      school_gpa: edu.school_gpa,
      graduated_year: edu.graduated_year,
      certificates: edu.files
        .map(pickFileId)
        .filter((id): id is number => id !== null),
    }));

    const cleanedAwardInfos = awardInfos.map(aw => ({
      type: aw.type,
      description: aw.description,
      files: aw.files
        .map(pickFileId)
        .filter((id): id is number => id !== null),
    }));

    const cleanedGuardians = guardians.map(g => ({
      relation: g.relation,
      first_name: g.first_name,
      last_name: g.last_name,
      father_name: g.father_name,
      date_of_birth: formatDate(moment(g.date_of_birth, "YYYY-MM-DD")),
      place_of_birth: g.place_of_birth,
      phone: g.phone,
      address: g.address,
      work_place: g.work_place,
      documents: g.documents.map<GuardianDocument>(d => ({
        type: d.type,
        file: pickFileId(d.file)!,
      })),
    }));

    // 4️⃣ Build payload -----------------------------------------------
    const clientData = {
      degree: degreeData?.degree,
      primary_major: degreeData?.primaryMajor,
      admission_major: degreeData?.additionalMajors || [],
      user: {
        ...generalInformation,
        date_of_birth: formatDate(moment(generalInformation.date_of_birth, "YYYY-MM-DD")),
      },
      guardians: cleanedGuardians,
      institutions: cleanedEducationInfos,
      olympics: cleanedAwardInfos,
      documents: [
        { type: "medical_record", file: fileIds.saglykKepilnama },
        { type: "relationship_tree", file: fileIds.threeArka },
        { type: "information", file: fileIds.maglumat },
        { type: "terjiimehal", file: fileIds.terjimehal },
        { type: "information", file: fileIds.threeXFourSurat },
        ...(gender !== "female"
          ? [{ type: "military_document", file: fileIds.militaryService }]
          : []),
        ...(fileIds.nikaHaty ? [{ type: "nika_haty", file: fileIds.nikaHaty }] : []),
      ],
      status: applicationData?.status,
    };

    console.log("clientData (pretty):", JSON.stringify(clientData, null, 2));

    // 5️⃣ Fire request -----------------------------------------------
    try {
      if (applicationData?.id) {
        await editClientMutation.mutateAsync({ id: applicationData.id, data: clientData });
        toast.success("Application updated successfully!");
        sessionStorage.clear();
        navigate("/application_list");
      } else {
        toast.error("Application ID is missing!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to update application: ${err.message}`);
    }
  };

  /* ---------- DOCUMENT UPLOAD SUB‑COMP ---------- */
  interface DocumentUploadProps {
    label: string;
    fieldName: FileFieldName;
    state: FileState | undefined;
    onPlusClick: (f: FileFieldName) => void;
    onDeleteFile: (f: FileFieldName) => void;
    fileInputRef: (el: HTMLInputElement | null) => void;
  }

  const DocumentUpload: React.FC<DocumentUploadProps> = ({
    label,
    fieldName,
    state,
    onPlusClick,
    onDeleteFile,
    fileInputRef,
  }) => {
    const fileLabel = state?.file
      ? state.file.name
      : state?.filePaths[0]
      ? state.filePaths[0].split("/").pop() ?? "Attach document"
      : "Attach document";

    return (
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
        <label className="w-44 text-[14px]">{label}</label>
        <Space>
          <Button
            type="text"
            onClick={() =>
              state?.file || state?.filePaths.length
                ? onDeleteFile(fieldName)
                : onPlusClick(fieldName)
            }
            className="cursor-pointer border-[#DFE5EF] rounded-md w-[400px] h-[40px] flex items-center justify-center"
          >
            {state?.isUploading ? (
              <Spin size="small" />
            ) : (
              <div className="flex items-center gap-1 truncate w-full justify-center">
                {fileLabel}
                {state?.file || state?.filePaths.length ? <TrashIcon /> : <PlusIcon style={{ fontSize: 16 }} />}
              </div>
            )}
          </Button>

          <input
            type="file"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={e => handleFileChange(fieldName, e)}
            accept="image/*,application/pdf"
          />

          <InfoCircleIcon className="text-blue-500" />
        </Space>
      </div>
    );
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="pt-10 px-4 pb-10">
      <Space direction="vertical" size="middle" className="w-full">
        <h1 className="text-headerBlue text-[14px] font-[500] mb-4">Other Documents</h1>

        <DocumentUpload
          label="Saglyk kepilnama"
          fieldName="saglykKepilnama"
          state={files.saglykKepilnama}
          onPlusClick={handlePlusClick}
          onDeleteFile={handleDeleteFile}
          fileInputRef={el => (fileInputRefs.current.saglykKepilnama = el)}
        />

        <DocumentUpload
          label="3 arka"
          fieldName="threeArka"
          state={files.threeArka}
          onPlusClick={handlePlusClick}
          onDeleteFile={handleDeleteFile}
          fileInputRef={el => (fileInputRefs.current.threeArka = el)}
        />

        <DocumentUpload
          label="Maglumat"
          fieldName="maglumat"
          state={files.maglumat}
          onPlusClick={handlePlusClick}
          onDeleteFile={handleDeleteFile}
          fileInputRef={el => (fileInputRefs.current.maglumat = el)}
        />

        <DocumentUpload
          label="Terjimehal"
          fieldName="terjimehal"
          state={files.terjimehal}
          onPlusClick={handlePlusClick}
          onDeleteFile={handleDeleteFile}
          fileInputRef={el => (fileInputRefs.current.terjimehal = el)}
        />

        <DocumentUpload
          label="3×4 surat"
          fieldName="threeXFourSurat"
          state={files.threeXFourSurat}
          onPlusClick={handlePlusClick}
          onDeleteFile={handleDeleteFile}
          fileInputRef={el => (fileInputRefs.current.threeXFourSurat = el)}
        />

        {gender !== "female" && (
          <DocumentUpload
            label="Military service"
            fieldName="militaryService"
            state={files.militaryService}
            onPlusClick={handlePlusClick}
            onDeleteFile={handleDeleteFile}
            fileInputRef={el => (fileInputRefs.current.militaryService = el)}
          />
        )}

        <DocumentUpload
          label="Nika haty"
          fieldName="nikaHaty"
          state={files.nikaHaty}
          onPlusClick={handlePlusClick}
          onDeleteFile={handleDeleteFile}
          fileInputRef={el => (fileInputRefs.current.nikaHaty = el)}
        />

        {/* NAVIGATION */}
        <div className="flex justify-end mt-12 space-x-5">
          <Link
            to="/infos/edit-awards-info"
            className="text-textSecondary border border-[#DFE5EF] py-2 px-4 rounded hover:bg-primaryBlue hover:text-white"
          >
            Previous
          </Link>
          <Button onClick={handleSubmit} className="bg-primaryBlue text-white">
            Finish
          </Button>
        </div>
      </Space>
    </div>
  );
};

export default EditOtherDocuments;