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
  id?: number;
  type: OlympicTypeValue | null;
  description: string | null;
  files: Array<{
    id: number;
    name: string;
    path: string;
    order: number;
  }>;
  isUploading: boolean;
}

export default function EditAwardsInfo() {
  const navigate = useNavigate();
  const { awardInfos, setAwardInfos, applicationData } = useApplicationStore();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { mutate: uploadFile } = useSendFiles();

  /* --------------------------- HYDRATE STATE --------------------------- */
  useEffect(() => {
    // 1. First try to load from sessionStorage
    const cached = sessionStorage.getItem("zustandAwardInformation");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setAwardInfos(parsed);
          return;
        }
      } catch (error) {
        console.error("Error parsing cached awards:", error);
      }
    }

    // 2. If no cached data, check applicationData from backend
    if (applicationData?.olympics) {
      const mappedAwards = applicationData.olympics.map((olympic: any) => ({
        id: olympic.id,
        type: olympic.type,
        description: olympic.description,
        files: olympic.files || [],
        isUploading: false
      }));
      
      if (mappedAwards.length > 0) {
        setAwardInfos(mappedAwards);
        return;
      }
    }

    // 3. Initialize with default if empty
    if (awardInfos.length === 0) {
      setAwardInfos([createBlankAward()]);
    }
  }, [setAwardInfos, applicationData]);

  /* ----------------------- KEEP FILE REFS IN SYNC ---------------------- */
  useEffect(() => {
    fileInputRefs.current = fileInputRefs.current.slice(0, awardInfos.length);
  }, [awardInfos.length]);

  /* --------------------------- HELPERS --------------------------------- */
  const createBlankAward = (): AwardInfo => ({
    type: null,
    description: "",
    files: [],
    isUploading: false
  });

  const getDisplayName = (info: AwardInfo) => {
    if (info.files[0]?.path) {
      return info.files[0].path.split("/").pop() ?? "Attach certificate";
    }
    return "Attach certificate";
  };

  /* ---------------------------- HANDLERS ------------------------------- */
  const handleAwardTypeChange = (index: number, value: OlympicTypeValue | null) => {
    setAwardInfos(prev => {
      const clone = [...prev];
      clone[index].type = value;
      return clone;
    });
  };

  const handleDescriptionChange = (index: number, value: string) => {
    setAwardInfos(prev => {
      const clone = [...prev];
      clone[index].description = value;
      return clone;
    });
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAwardInfos(prev => {
      const clone = [...prev];
      clone[index].isUploading = true;
      return clone;
    });

    const formData = new FormData();
    formData.append("path", file);
    formData.append("certificateType", "olympic");

    uploadFile(formData, {
      onSuccess: (data) => {
        setAwardInfos(prev => {
          const clone = [...prev];
          clone[index] = {
            ...clone[index],
            files: [data],
            isUploading: false
          };
          return clone;
        });
        toast.success("Certificate uploaded successfully");
      },
      onError: () => {
        setAwardInfos(prev => {
          const clone = [...prev];
          clone[index].isUploading = false;
          return clone;
        });
        toast.error("File upload failed");
      },
    });
  };

  const deleteFile = (index: number) => {
    setAwardInfos(prev => {
      const clone = [...prev];
      clone[index].files = [];
      return clone;
    });
  };

  const handleAddAward = () => {
    setAwardInfos(prev => [...prev, createBlankAward()]);
  };

  const handleDeleteAward = (index: number) => {
    if (awardInfos.length <= 1) {
      toast.error("You must have at least one award");
      return;
    }
    setAwardInfos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Validate all fields
    for (const info of awardInfos) {
      if (!info.type) {
        toast.error("Please select an award type");
        return;
      }
      if (!info.description?.trim()) {
        toast.error("Please enter a description");
        return;
      }
      if (!info.files.length) {
        toast.error("Please upload a certificate");
        return;
      }
    }

    // Save to sessionStorage
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
            <div key={info.id || index} className="rounded mb-6">
              {/* Award Type */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 font-[400] text-[14px] self-center">Award type</label>
                <Select
                  placeholder="Select Award Type"
                  className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                  value={info.type}
                  onChange={(value) => handleAwardTypeChange(index, value)}
                >
                  {Object.entries(OlympicType).map(([key, value]) => (
                    <Select.Option key={key} value={value}>
                      {key}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              {/* Description */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 font-[400] text-[14px] self-center">Description</label>
                <Input
                  placeholder="Enter description"
                  className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                  value={info.description || ""}
                  onChange={(e) => handleDescriptionChange(index, e.target.value)}
                />
              </div>

              {/* Certificate */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 font-[400] text-[14px] self-center">Certificate</label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="text"
                    onClick={() => info.files.length ? deleteFile(index) : fileInputRefs.current[index]?.click()}
                    className="cursor-pointer border-[#DFE5EF] rounded-md w-[400px] h-[40px] flex items-center justify-center"
                  >
                    {info.isUploading ? (
                      <Spin size="small" />
                    ) : (
                      <div className="flex items-center gap-1 truncate">
                        {getDisplayName(info)}
                        {info.files.length ? (
                          <TrashIcon className="w-4" />
                        ) : (
                          <PlusIcon style={{ fontSize: "16px" }} />
                        )}
                      </div>
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={el => fileInputRefs.current[index] = el}
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(index, e)}
                    accept="image/*,application/pdf"
                  />
                  <InfoCircleIcon className="text-blue-500" />
                </div>
              </div>

              {/* Delete button for additional awards */}
              {awardInfos.length > 1 && (
                <button
                  onClick={() => handleDeleteAward(index)}
                  className="px-8 py-2 flex items-center gap-2 border-[#FA896B] text-[#FA896B] rounded"
                >
                  Delete award <TrashIcon className="w-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add Award Button */}
          <button
            onClick={handleAddAward}
            className="px-8 py-2 flex items-center gap-2 border-blue-500 text-blue-500 rounded"
          >
            <PlusIcon /> Add Award
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end mt-10 space-x-5">
          <Link
            to="/infos/edit-education-info"
            className="text-textSecondary border border-[#DFE5EF] py-2 px-4 rounded hover:bg-primaryBlue hover:text-white"
          >
            Previous
          </Link>
          <button
            onClick={handleSubmit}
            className="bg-primaryBlue text-white py-2 px-4 rounded"
          >
            Save & Continue
          </button>
        </div>
      </Space>
    </div>
  );
}