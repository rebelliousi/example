import { Input, Space, Button, DatePicker, message, Spin } from "antd";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Moment } from "moment";
import PlusIcon from "../../assets/icons/PlusIcon";
import InfoCircleIcon from "../../assets/icons/InfoCircleIcon";
import TrashIcon from "../../assets/icons/TrashIcon";
import moment from 'moment';
import toast from 'react-hot-toast';
import { useSendFiles } from "../../hooks/ApplicationList/useSendFiles";

interface EducationInformation {
    name: string;
    school_gpa: number | null;
    graduated_year: number;
    files: string[];
    filePaths: string[];
    isUploading: boolean;
}

type EducationInformationKey = keyof EducationInformation;

const EducationInfo = () => {
    const navigate = useNavigate();

    const [educationInfos, setEducationInfos] = useState<EducationInformation[]>([
        {
            name: '',
            school_gpa: null,
            graduated_year: 0,
            files: [],
            filePaths: [],
            isUploading: false,
        },
    ]);

    const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>([]);
    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        fileInputRefs.current = Array(educationInfos.length).fill(null);
    }, [educationInfos.length]);

    const { mutate: uploadFile } = useSendFiles();

    const handleInputChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        fieldName: EducationInformationKey
    ) => {
        let value = e.target.value;

        if (fieldName === 'school_gpa') {
            const regex = /^[0-5]?(\.\d*)?$/;
            if (!regex.test(value)) return;

            const parsedValue = value === '' ? null : Number(value);
            if (parsedValue !== null && parsedValue > 5) return;

            setEducationInfos(prev => {
                const newInfos = [...prev];
                newInfos[index] = {
                    ...newInfos[index],
                    [fieldName]: parsedValue
                };
                return newInfos;
            });
        } else {
            setEducationInfos(prev => {
                const newInfos = [...prev];
                newInfos[index] = {
                    ...newInfos[index],
                    [fieldName]: value
                };
                return newInfos;
            });
        }
    };

    const handleNameChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(index, e, "name");
    };

    const handleSchoolGpaChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        handleInputChange(index, e, "school_gpa");
    };

    const handleGraduatedYearChange = (index: number, date: Moment | null) => {
        setEducationInfos(prev => {
            const newInfos = [...prev];
            newInfos[index] = {
                ...newInfos[index],
                graduated_year: date ? date.year() : 0
            };
            return newInfos;
        });
    };

    const deleteFile = (index: number) => {
        setSelectedFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = null;
            return newFiles;
        });

        setEducationInfos(prev => {
            const newInfos = [...prev];
            newInfos[index] = {
                ...newInfos[index],
                files: [],
                filePaths: [],
                isUploading: false
            };
            return newInfos;
        });

        message.success('File deleted successfully');
    };

    const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        
        setSelectedFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = file;
            return newFiles;
        });

        if (file) {
            setEducationInfos(prev => {
                const newInfos = [...prev];
                newInfos[index] = {
                    ...newInfos[index],
                    isUploading: true
                };
                return newInfos;
            });

            const formData = new FormData();
            formData.append('path', file);

            uploadFile(formData, {
                onSuccess: (data: any) => {
                    setEducationInfos(prev => {
                        const newInfos = [...prev];
                        newInfos[index] = {
                            ...newInfos[index],
                            files: [...newInfos[index].files, data.id],
                            filePaths: [...newInfos[index].filePaths, data.path],
                            isUploading: false
                        };
                        return newInfos;
                    });
                    message.success('File uploaded successfully');
                },
                onError: (error: any) => {
                    console.error('File upload failed', error);
                    message.error('File upload failed');
                    setEducationInfos(prev => {
                        const newInfos = [...prev];
                        newInfos[index] = {
                            ...newInfos[index],
                            isUploading: false
                        };
                        return newInfos;
                    });
                }
            });
        }
    };

    const handlePlusClick = (index: number) => {
        fileInputRefs.current[index]?.click();
    };

    const handleAddEducationInfo = () => {
        setEducationInfos(prev => [
            ...prev,
            {
                name: '',
                school_gpa: null,
                graduated_year: 0,
                files: [],
                filePaths: [],
                isUploading: false
            }
        ]);
        setSelectedFiles(prev => [...prev, null]);
    };

    const handleDeleteEducationInfo = (index: number) => {
        setEducationInfos(prev => {
            const newInfos = [...prev];
            newInfos.splice(index, 1);
            return newInfos;
        });
        setSelectedFiles(prev => {
            const newFiles = [...prev];
            newFiles.splice(index, 1);
            return newFiles;
        });
        fileInputRefs.current = fileInputRefs.current.filter((_, i) => i !== index);
    };

    const handleSubmit = () => {
        for (let i = 0; i < educationInfos.length; i++) {
            const info = educationInfos[i];
            if (!info.name) {
                toast.error(`School name is required`);
                return;
            }
            if (info.school_gpa === null) {
                toast.error(`School GPA is required`);
                return;
            }
            if (!info.graduated_year) {
                toast.error(`Graduation Year is required`);
                return;
            }
            if (info.files.length === 0) {
                toast.error(`Certificate of graduation is required`);
                return;
            }
        }

        sessionStorage.setItem('educationInformation', JSON.stringify(educationInfos));
        navigate("/infos/awards-info");
    };

    const setFileInputRef = (index: number, el: HTMLInputElement | null) => {
        fileInputRefs.current[index] = el;
    };

    useEffect(() => {
        const storedEducationInfos = sessionStorage.getItem('educationInformation');
        if (storedEducationInfos) {
            const parsedData = JSON.parse(storedEducationInfos);
            const educationInfosWithYear = parsedData.map((educationInfo: any) => ({
                ...educationInfo,
                graduated_year: educationInfo.graduated_year || 0,
                school_gpa: educationInfo.school_gpa !== null ? educationInfo.school_gpa : null,
                isUploading: false,
            }));
            setEducationInfos(educationInfosWithYear);
        }
    }, []);

    return (
        <div className="pt-10 px-4 pb-10">
            <Space direction="vertical" size="middle" className="w-full">
                {educationInfos.map((educationInfo, index) => (
                    <div key={index} className="mb-14">
                        <div className="mb-4">
                            <h1 className="text-headerBlue text-[14px] font-[500]">
                                {index === 0 ? "School Graduation Information" : "Other Graduation Information"}
                            </h1>
                        </div>

                        {/* School Name Input */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                School Name
                            </label>
                            <Input
                                placeholder="Enter School Name"
                                className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                                value={educationInfo.name}
                                onChange={(e) => handleNameChange(index, e)}
                                required
                            />
                        </div>

                        {/* School GPA Input */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                School GPA
                            </label>
                            <Input
                                type="number"
                                placeholder={educationInfo.school_gpa === null ? "Enter School GPA" : ""}
                                className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                                value={educationInfo.school_gpa === null ? "" : educationInfo.school_gpa.toString()}
                                onChange={(e) => handleSchoolGpaChange(index, e)}
                                max={5}
                                step="0.1"
                                required
                            />
                        </div>

                        {/* Graduated Year Input */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                Graduated year
                            </label>
                            <DatePicker
                                picker="year"
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md"
                                value={educationInfo.graduated_year ? moment(educationInfo.graduated_year.toString(), 'YYYY') : null}
                                onChange={(date) => handleGraduatedYearChange(index, date)}
                                placeholder="Select Year"
                                required
                            />
                        </div>

                        {/* File Upload */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                Certificate of graduation
                            </label>
                            <div className="flex items-center justify-center space-x-2">
                                <Button
                                    onClick={() => selectedFiles[index] ? deleteFile(index) : handlePlusClick(index)}
                                    type="text"
                                    className="cursor-pointer border-[#DFE5EF] rounded-md text-[14px] w-[400px] h-[40px] flex items-center justify-center"
                                >
                                    {educationInfo.isUploading ? (
                                        <Spin size="small" />
                                    ) : (
                                        <div className="flex items-center justify-center w-full gap-1">
                                            {selectedFiles[index]?.name || "Attach document"}
                                            {selectedFiles[index] ? <TrashIcon className='w-5' /> : <PlusIcon style={{ fontSize: '16px' }} />}
                                        </div>
                                    )}
                                </Button>
                                <input
                                    type="file"
                                    style={{ display: "none" }}
                                    onChange={(e) => handleFileChange(index, e)}
                                    ref={(el) => setFileInputRef(index, el)}
                                    accept="image/*,application/pdf"
                                    required
                                />
                                <InfoCircleIcon className="text-blue-500 hover:text-blue-700" />
                            </div>
                        </div>

                        {index > 0 && (
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

                <button
                    type="button"
                    onClick={handleAddEducationInfo}
                    className="px-8 py-2 flex items-center gap-2 border-blue-500 border text-blue-500 rounded"
                >
                    <PlusIcon /> Add
                </button>

                <div className="flex justify-end mt-12 space-x-5">
                    <Link
                        to="/infos/guardians-info"
                        className="text-textSecondary border border-#DFE5EF hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all duration-500"
                    >
                        Previous
                    </Link>
                    <button
                        onClick={handleSubmit}
                        className="bg-primaryBlue hover:text-white text-white py-2 px-4 rounded"
                    >
                        Next
                    </button>
                </div>
            </Space>
        </div>
    );
};

export default EducationInfo;