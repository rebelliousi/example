import { Input, Space, Button, DatePicker, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import React, { useRef, useEffect } from "react";
import { useApplicationStore } from "../store/applicationStore";
import { useSendFiles } from "../hooks/ApplicationList/useSendFiles";
import toast, { Toaster } from "react-hot-toast";
import TrashIcon from "../assets/icons/TrashIcon";
import PlusIcon from "../assets/icons/PlusIcon";
import InfoCircleIcon from "../assets/icons/InfoCircleIcon";
import type { Moment } from "moment";
import moment from "moment";

interface EducationInformation {
  id?: number;
  name: string;
  school_gpa: number | null;
  graduated_year: number;
  certificates?: {
    id: number;
    name: string;
    path: string;
    order: number;
  }[];
  isUploading?: boolean;
}

export default function EditEducationInfo() {
  const navigate = useNavigate();

  /* ------------------------------ ZUSTAND ------------------------------ */
  const { educationInfos, setEducationInfos } = useApplicationStore();

  /* ---------------------------- LOCAL REFS ----------------------------- */
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* --------------------------- HYDRATE STATE --------------------------- */
  useEffect(() => {
    const cached = sessionStorage.getItem("zustandEducationInformation");
    if (cached) {
      try {
        setEducationInfos(JSON.parse(cached));
      } catch {
        /* ignore */
      }
    }
  }, [setEducationInfos]);

  /* ----------------------- KEEP FILE REFS IN SYNC ---------------------- */
  useEffect(() => {
    fileInputRefs.current = Array(educationInfos.length).fill(null);
  }, [educationInfos.length]);

  /* --------------------------- FILE UPLOAD ----------------------------- */
  const { mutate: uploadFile } = useSendFiles();

  /* --------------------------- HELPERS --------------------------------- */
  const getDisplayName = (info: EducationInformation) => {
    if (info.certificates?.[0]?.path) {
      return info.certificates[0].path.split("/").pop() ?? "Attach document";
    }
    return "Attach document";
  };

  /* ---------------------------- HANDLERS ------------------------------- */
  const handleInputChange = (
    index: number,
    fieldName: keyof Omit<EducationInformation, "certificates" | "isUploading">,
    value: string | number | null
  ) => {
    setEducationInfos(prev => {
      const clone = [...prev];
      // @ts-expect-error - dynamic key assignment
      clone[index][fieldName] = value;
      return clone;
    });
  };

  const handleGPAChange = (index: number, value: string) => {
    const regex = /^[0-5]?(\.\d*)?$/;
    if (!regex.test(value)) return;

    const parsed = value === "" ? null : Number(value);
    if (parsed !== null && parsed > 5) return;

    handleInputChange(index, "school_gpa", parsed);
  };

  const handleGraduatedYearChange = (index: number, date: Moment | null) => {
    handleInputChange(index, "graduated_year", date ? date.year() : 0);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEducationInfos(prev => {
      const clone = [...prev];
      clone[index] = { ...clone[index], isUploading: true };
      return clone;
    });

    const formData = new FormData();
    formData.append("path", file);

    uploadFile(formData, {
      onSuccess: (certificate) => {
        setEducationInfos(prev => {
          const clone = [...prev];
          clone[index] = {
            ...clone[index],
            certificates: [certificate],
            isUploading: false
          };
          return clone;
        });
        toast.success("Certificate uploaded successfully");
      },
      onError: () => {
        setEducationInfos(prev => {
          const clone = [...prev];
          clone[index] = { ...clone[index], isUploading: false };
          return clone;
        });
        toast.error("File upload failed");
      },
    });
  };

  const deleteFile = (index: number) => {
    setEducationInfos(prev => {
      const clone = [...prev];
      clone[index] = { ...clone[index], certificates: [] };
      return clone;
    });
  };

  const handlePlusClick = (index: number) => fileInputRefs.current[index]?.click();

  const handleAddEducationInfo = () => {
    setEducationInfos(prev => [
      ...prev,
      {
        name: "",
        school_gpa: null,
        graduated_year: 0,
        certificates: [],
        isUploading: false
      }
    ]);
  };

  const handleDeleteEducationInfo = (index: number) => {
    if (educationInfos.length <= 1) {
      toast.error("You must have at least one education entry");
      return;
    }
    setEducationInfos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    for (const info of educationInfos) {
      if (!info.name.trim()) {
        toast.error("School name is required");
        return;
      }
      if (info.school_gpa === null) {
        toast.error("School GPA is required");
        return;
      }
      if (!info.graduated_year) {
        toast.error("Graduation Year is required");
        return;
      }
      if (!info.certificates?.length) {
        toast.error("Certificate is required");
        return;
      }
    }

    sessionStorage.setItem(
      "zustandEducationInformation",
      JSON.stringify(educationInfos)
    );
    navigate("/infos/edit-awards-info");
  };

  /* ----------------------------- RENDER -------------------------------- */
  return (
    <div className="pt-10 px-4 pb-10">
      <Toaster />
      <Space direction="vertical" size="middle" className="w-full">
        <div className="mb-14">
          <h1 className="text-headerBlue text-[14px] font-[500] mb-4">Education Information</h1>

          {educationInfos.map((info, index) => (
            <div key={index} className="rounded mb-6">
              {/* School Name */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 font-[400] text-[14px] self-center">School Name</label>
                <Input
                  placeholder="Enter School Name"
                  className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                  value={info.name}
                  onChange={e => handleInputChange(index, "name", e.target.value)}
                />
              </div>

              {/* School GPA */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 font-[400] text-[14px] self-center">School GPA</label>
                <Input
                  type="text"
                  placeholder="Enter School GPA (0-5)"
                  className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                  value={info.school_gpa ?? ""}
                  onChange={e => handleGPAChange(index, e.target.value)}
                />
              </div>

              {/* Graduated Year */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 font-[400] text-[14px] self-center">Graduated Year</label>
                <DatePicker
                  picker="year"
                  className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                  value={info.graduated_year ? moment(String(info.graduated_year), "YYYY") : null}
                  onChange={date => handleGraduatedYearChange(index, date)}
                  placeholder="Select Year"
                />
              </div>

              {/* Certificate */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 font-[400] text-[14px] self-center">Certificate</label>
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    type="text"
                    onClick={() => info.certificates?.length ? deleteFile(index) : handlePlusClick(index)}
                    className="cursor-pointer border-[#DFE5EF] rounded-md text-[14px] w-[400px] h-[40px] flex items-center justify-center"
                  >
                    {info.isUploading ? (
                      <Spin size="small" />
                    ) : (
                      <div className="flex items-center justify-center w-full gap-1">
                        {getDisplayName(info)}
                        {info.certificates?.length ? (
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
                    onChange={e => handleFileChange(index, e)}
                    accept="image/*,application/pdf"
                  />
                  <InfoCircleIcon className="text-blue-500 hover:text-blue-700" />
                </div>
              </div>

              {/* Delete block if multiple */}
              {educationInfos.length > 1 && (
                <button
                  onClick={() => handleDeleteEducationInfo(index)}
                  className="px-8 py-2 flex items-center justify-center gap-2 border-[#FA896B] border text-[#FA896B] rounded hover:text-[#FA896B] hover:border-[#FA896B] w-[200px]"
                >
                  Delete info
                  <TrashIcon className="w-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add education info */}
          <button
            type="button"
            onClick={handleAddEducationInfo}
            className="px-8 py-2 flex items-center gap-2 border-blue-500 border text-blue-500 rounded"
          >
            <PlusIcon /> Add
          </button>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-end mt-10 space-x-5">
          <Link
            to="/infos/edit-guardians-info"
            className="text-textSecondary bg-white border border-[#DFE5EF] hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all hover:duration-500"
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