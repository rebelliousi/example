import { Input, Space, Button, message, Spin, DatePicker } from "antd";
import { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Moment } from "moment";

import moment from "moment";

import toast from "react-hot-toast";

import { useSendFiles } from "../hooks/ApplicationList/useSendFiles";
import TrashIcon from "../assets/icons/TrashIcon";
import PlusIcon from "../assets/icons/PlusIcon";
import InfoCircleIcon from "../assets/icons/InfoCircleIcon";
import { useApplicationStore } from "../store/applicationStore";

interface EducationInformation {
  name: string;
  school_gpa: number | null;
  graduated_year: number;
  files: string[];
  filePaths: string[];
  isUploading: boolean;
}

type EducationInformationKey = keyof EducationInformation;

const EditEducationInfo = () => {
  const navigate = useNavigate();
  const { educationInfos, setEducationInfos } = useApplicationStore();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ---------- HYDRATE STORE FROM SESSIONSTORAGE ---------- */
  useEffect(() => {
    const cached = sessionStorage.getItem("zustandEducationInformation");
    if (cached) {
      try {
        const parsed: EducationInformation[] = JSON.parse(cached);
        if (parsed.length) setEducationInfos(parsed);
      } catch {
        /* ignore invalid json */
      }
    }
  }, [setEducationInfos]);

  /* ---------- KEEP REFS IN SYNC ---------- */
  useEffect(() => {
    fileInputRefs.current = Array(educationInfos.length).fill(null);
  }, [educationInfos.length]);

  const { mutate: uploadFile } = useSendFiles();

  /* ---------- INPUT HANDLERS ---------- */
  const handleInputChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    fieldName: EducationInformationKey
  ) => {
    const value = e.target.value;

    if (fieldName === "school_gpa") {
      const regex = /^[0-5]?(\.\d*)?$/;
      if (!regex.test(value)) return;

      const parsed = value === "" ? null : Number(value);
      if (parsed !== null && parsed > 5) return;

      setEducationInfos(prev => {
        const clone = [...prev];
        clone[index] = { ...clone[index], school_gpa: parsed };
        return clone;
      });
    } else {
      setEducationInfos(prev => {
        const clone = [...prev];
        clone[index] = { ...clone[index], [fieldName]: value };
        return clone;
      });
    }
  };

  const handleGraduatedYearChange = (index: number, date: Moment | null) =>
    setEducationInfos(prev => {
      const clone = [...prev];
      clone[index] = { ...clone[index], graduated_year: date ? date.year() : 0 };
      return clone;
    });

  const deleteFile = (index: number) =>
    setEducationInfos(prev => {
      const clone = [...prev];
      clone[index] = { ...clone[index], files: [], filePaths: [] };
      return clone;
    });

  /* ---------- FILE UPLOAD HANDLER ---------- */
  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    /* Kullanıcı dosya seçmeden pencereyi kapattıysa */
    if (!file) {
      message.info("Yeni dosya seçilmedi — mevcut dosya kullanılacak.");
      return;
    }

    /* Upload başlat */
    setEducationInfos(prev => {
      const clone = [...prev];
      clone[index] = { ...clone[index], isUploading: true };
      return clone;
    });

    const formData = new FormData();
    formData.append("path", file);

    uploadFile(formData, {
      onSuccess: data =>
        setEducationInfos(prev => {
          const clone = [...prev];
          clone[index] = {
            ...clone[index],
            files: [data.id],          // overwrite
            filePaths: [data.path],
            isUploading: false,
          };
          message.success("File uploaded successfully");
          return clone;
        }),
      onError: () =>
        setEducationInfos(prev => {
          const clone = [...prev];
          clone[index] = { ...clone[index], isUploading: false };
          message.error("File upload failed");
          return clone;
        }),
    });
  };

  const handlePlusClick = (index: number) => fileInputRefs.current[index]?.click();

  const handleAddEducationInfo = () =>
    setEducationInfos(prev => [
      ...prev,
      {
        name: "",
        school_gpa: null,
        graduated_year: 0,
        files: [],
        filePaths: [],
        isUploading: false,
      },
    ]);

  const handleDeleteEducationInfo = (index: number) =>
    setEducationInfos(prev => prev.filter((_, i) => i !== index));

  /* ---------- SUBMIT ---------- */
  const handleSubmit = () => {
    for (const info of educationInfos) {
      if (!info.name) return toast.error("School name is required");
      if (info.school_gpa === null) return toast.error("School GPA is required");
      if (!info.graduated_year) return toast.error("Graduation Year is required");
      if (!info.files.length) return toast.error("Certificate is required");
    }

    /* ➜ SessionStorage’e kaydet */
    sessionStorage.setItem(
      "zustandEducationInformation",
      JSON.stringify(educationInfos)
    );

    /* ➜ Konsola yazdır */
    console.log("Saved educationInfos:", educationInfos);
    console.log(
      "SessionStorage value:",
      sessionStorage.getItem("zustandEducationInformation")
    );

    navigate("/infos/edit-awards-info");
  };

  const setFileInputRef = (index: number, el: HTMLInputElement | null) => {
    fileInputRefs.current[index] = el;
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="pt-10 px-4 pb-10">
      <Space direction="vertical" size="middle" className="w-full">
        {educationInfos.map((educationInfo, index) => {
          const fileName =
            educationInfo.filePaths[0]?.split("/").pop() ?? "Attach document";

          return (
            <div key={index} className="mb-14">
              <h1 className="mb-4 text-headerBlue text-[14px] font-[500]">
                {index === 0
                  ? "School Graduation Information"
                  : "Other Graduation Information"}
              </h1>

              {/* School Name */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 text-[14px]">School Name</label>
                <Input
                  placeholder="Enter School Name"
                  className="rounded-md w-[400px] h-[40px] border-[#DFE5EF]"
                  value={educationInfo.name}
                  onChange={e => handleInputChange(index, e, "name")}
                />
              </div>

              {/* School GPA */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 text-[14px]">School GPA</label>
                <Input
                  type="number"
                  placeholder={
                    educationInfo.school_gpa === null ? "Enter School GPA" : ""
                  }
                  className="rounded-md w-[400px] h-[40px] border-[#DFE5EF]"
                  value={educationInfo.school_gpa ?? ""}
                  onChange={e => handleInputChange(index, e, "school_gpa")}
                  max={5}
                  step="0.1"
                />
              </div>

              {/* Graduated Year */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 text-[14px]">Graduated year</label>
                <DatePicker
                  picker="year"
                  className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md"
                  value={
                    educationInfo.graduated_year
                      ? moment(String(educationInfo.graduated_year), "YYYY")
                      : null
                  }
                  onChange={date => handleGraduatedYearChange(index, date)}
                  placeholder="Select Year"
                />
              </div>

              {/* Certificate of graduation */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                <label className="w-44 text-[14px]">Certificate of graduation</label>

                <div className="flex items-center space-x-2">
                  <Button
                    type="text"
                    className="cursor-pointer border-[#DFE5EF] rounded-md w-[400px] h-[40px] flex items-center justify-center"
                    onClick={() => fileInputRefs.current[index]?.click()}
                  >
                    {educationInfo.isUploading ? (
                      <Spin size="small" />
                    ) : (
                      <div className="flex items-center gap-1 truncate">
                        {fileName}
                        {educationInfo.filePaths.length ? (
                          <TrashIcon
                            className="w-5 cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              deleteFile(index);
                            }}
                          />
                        ) : (
                          <PlusIcon style={{ fontSize: "16px" }} />
                        )}
                      </div>
                    )}
                  </Button>

                  <input
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*,application/pdf"
                    onChange={e => handleFileChange(index, e)}
                    ref={el => setFileInputRef(index, el)}
                  />

                  <InfoCircleIcon className="text-blue-500" />
                </div>
              </div>

              {/* Delete extra education info */}
              {index > 0 && (
                <button
                  onClick={() => handleDeleteEducationInfo(index)}
                  className="px-8 py-2 flex items-center gap-2 border-[#FA896B] text-[#FA896B] rounded"
                >
                  Delete info <TrashIcon className="w-4" />
                </button>
              )}
            </div>
          );
        })}

        {/* + Add new education info */}
        <button
          type="button"
          onClick={handleAddEducationInfo}
          className="px-8 py-2 flex items-center gap-2 border-blue-500 text-blue-500 rounded"
        >
          <PlusIcon /> Add
        </button>

        {/* Navigation */}
        <div className="flex justify-end mt-12 space-x-5">
          <Link
            to="/infos/edit-guardians-info"
            className="text-textSecondary border border-[#DFE5EF] py-2 px-4 rounded hover:bg-primaryBlue hover:text-white"
          >
            Previous
          </Link>
          <button
            onClick={handleSubmit}
            className="bg-primaryBlue text-white py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
      </Space>
    </div>
  );
};

export default EditEducationInfo;
