import { Input, Space, Button, Select, Spin } from "antd";

import { Link, useNavigate } from "react-router-dom";

import React, { useRef, useEffect } from "react";
import { OlympicTypeValue, useApplicationStore } from "../store/applicationStore";
import { useSendFiles } from "../hooks/ApplicationList/useSendFiles";
import toast, { Toaster } from "react-hot-toast";
import TrashIcon from "../assets/icons/TrashIcon";
import PlusIcon from "../assets/icons/PlusIcon";
import InfoCircleIcon from "../assets/icons/InfoCircleIcon";

const OlympicType = {
  AREA: "area",
  REGION: "region",
  STATE: "state",
  INTERNATIONAL: "international",
  OTHER: "other",
} as const;

interface AwardInfo {
  type: OlympicTypeValue | null;
  description: string | null;
  files: any[]; // backend file IDs
  filePaths: string[]; // backend file URLs
  selectedFile: File | null;
  isUploading: boolean;
}

export default function EditAwardsInfo() {
  const navigate = useNavigate();

  /* ------------------------------ ZUSTAND ------------------------------ */
  const { awardInfos, setAwardInfos } = useApplicationStore();

  /* ---------------------------- LOCAL REFS ----------------------------- */
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* --------------------------- HYDRATE STATE --------------------------- */
  useEffect(() => {
    const cached = sessionStorage.getItem("zustandAwardInformation");
    if (cached) {
      try {
        setAwardInfos(JSON.parse(cached));
      } catch {
        /* ignore */
      }
    }
  }, [setAwardInfos]);

  /* ----------------------- KEEP FILE REFS IN SYNC ---------------------- */
  useEffect(() => {
    fileInputRefs.current = Array(awardInfos.length).fill(null);
  }, [awardInfos.length]);

  /* --------------------------- FILE UPLOAD ----------------------------- */
  const { mutate: uploadFile } = useSendFiles();

  /* --------------------------- HELPERS --------------------------------- */
  const getDisplayName = (info: AwardInfo) => {
    if (info.selectedFile) return info.selectedFile.name;
    if (info.filePaths.length) return info.filePaths[0].split("/").pop() ?? "Attach document";
    return "Attach document";
  };

  /* ---------------------------- HANDLERS ------------------------------- */
  const handleAwardTypeChange = (index: number, value: OlympicTypeValue | null) => {
    const copy = [...awardInfos];
    copy[index].type = value;
    setAwardInfos(copy);
  };

  const handleAwardInfoChange = (
    index: number,
    fieldName: keyof Omit<AwardInfo, "selectedFile" | "isUploading" | "files" | "filePaths">,
    value: string | OlympicTypeValue | null
  ) => {
    const copy = [...awardInfos];
    // @ts-expect-error – dynamic key
    copy[index][fieldName] = value;
    setAwardInfos(copy);
  };

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    // optimistic UI
    setAwardInfos((prev) => {
      const clone = [...prev];
      clone[index] = {
        ...clone[index],
        isUploading: true,
        selectedFile: file,
      };
      return clone;
    });

    const formData = new FormData();
    formData.append("path", file);
    formData.append("certificateType", "participation");

    uploadFile(formData, {
      onSuccess: (data: any) => {
        setAwardInfos((prev) => {
          const clone = [...prev];
          clone[index] = {
            ...clone[index],
            files: [data.id],
            filePaths: [data.path],
            isUploading: false,
          };
          return clone;
        });
        toast.success("File uploaded successfully");
      },
      onError: () => {
        setAwardInfos((prev) => {
          const clone = [...prev];
          clone[index] = { ...clone[index], isUploading: false, selectedFile: null };
          return clone;
        });
        toast.error("File upload failed");
      },
    });
  };

  const deleteFile = (index: number) => {
    setAwardInfos((prev) => {
      const clone = [...prev];
      clone[index] = {
        ...clone[index],
        files: [],
        filePaths: [],
        selectedFile: null,
        isUploading: false,
      };
      return clone;
    });
  };

  const handlePlusClick = (index: number) => fileInputRefs.current[index]?.click();

  const handleAddAwardInfo = () =>
    setAwardInfos((prev) => [
      ...prev,
      { type: null, description: "", files: [], filePaths: [], selectedFile: null, isUploading: false },
    ]);

  const handleDeleteAwardInfo = (index: number) =>
    setAwardInfos((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    for (const info of awardInfos) {
      if (!info.type) return toast.error("Please select an award type.");
      if (!info.description) return toast.error("Please enter a description.");
      if (!info.files.length) return toast.error("Please upload a certificate.");
    }
    sessionStorage.setItem("zustandAwardInformation", JSON.stringify(awardInfos));
    navigate("/infos/edit-other-doc-info");
  };

  /* ----------------------------- RENDER -------------------------------- */
  return (
    <div className="pt-10 px-4 pb-10">
      <Toaster />
      <Space direction="vertical" size="middle" className="w-full">
        <div className="mb-14">
          <h1 className="text-headerBlue text-[14px] font-[500] mb-4">Awards</h1>

          {awardInfos.map((info, index) => (
            <div key={index} className="rounded mb-6">
              {/* Award type */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 font-[400] text-[14px] self-center">Award type</label>
                <Space>
                  <Select
                    placeholder="Select Award Type"
                    className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                    value={info.type ?? undefined}
                    onChange={(value) => handleAwardTypeChange(index, value as OlympicTypeValue)}>
                    {Object.entries(OlympicType).map(([key, value]) => (
                      <Select.Option key={key} value={value as OlympicTypeValue}>
                        {key}
                      </Select.Option>
                    ))}
                  </Select>
                </Space>
              </div>

              {/* Description */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 font-[400] text-[14px] self-center">Description</label>
                <Space>
                  <Input
                    placeholder="Enter Description"
                    className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                    value={info.description ?? ""}
                    onChange={(e) => handleAwardInfoChange(index, "description", e.target.value)}
                  />
                </Space>
              </div>

              {/* Certificate */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 font-[400] text-[14px] self-center">Certificate of graduation</label>
                <Space>
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      type="text"
                      onClick={() => (info.selectedFile || info.filePaths.length ? deleteFile(index) : handlePlusClick(index))}
                      className="cursor-pointer border-[#DFE5EF] rounded-md text-[14px] w-[400px] h-[40px] flex items-center justify-center">
                      {info.isUploading ? (
                        <Spin size="small" />
                      ) : (
                        <div className="flex items-center justify-center w-full gap-1">
                          {getDisplayName(info)}
                          {info.selectedFile || info.filePaths.length ? (
                            <TrashIcon className="w-4" />
                          ) : (
                            <PlusIcon style={{ fontSize: "16px" }} />
                          )}
                        </div>
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      style={{ display: "none" }}
                      onChange={(e) => handleFileChange(index, e)}
                      accept="image/*,application/pdf"
                    />
                    <InfoCircleIcon className="text-blue-500 hover:text-blue-700" />
                  </div>
                </Space>
              </div>

              {/* Delete block if multiple */}
              {awardInfos.length > 1 && (
                <button
                  onClick={() => handleDeleteAwardInfo(index)}
                  className="px-8 py-2 flex items-center justify-center gap-2 border-[#FA896B] border text-[#FA896B] rounded hover:text-[#FA896B] hover:border-[#FA896B] w-[200px]">
                  Delete info
                  <TrashIcon className="w-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add award info */}
          <button
            type="button"
            onClick={handleAddAwardInfo}
            className="px-8 py-2 flex items-center gap-2 border-blue-500 border text-blue-500 rounded">
            <PlusIcon /> Add
          </button>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-end mt-10 space-x-5">
          <Link
            to="/infos/edit-education-info"
            className="text-textSecondary bg-white border border-[#DFE5EF] hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all hover:duration-500">
            Previous
          </Link>
          <button onClick={handleSubmit} className="bg-primaryBlue text-white py-2 px-4 rounded">
            Save & Continue
          </button>
        </div>
      </Space>
    </div>
  );
}


