import { Input, Space, Button, DatePicker, message, Spin, Select } from "antd";
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
    documentType: DocumentType | null;  // Add documentType
}

type EducationInformationKey = keyof EducationInformation;

export type DocumentType =
    | 'school_certificate'
    | 'diploma';

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
            documentType: null,  // Initialize documentType
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
            if (!regex.test(value)) {
                return;
            }

            const parsedValue = value === '' ? null : Number(value);

            if (parsedValue !== null && parsedValue > 5) {
                return;
            }

            const newEducationInfos = [...educationInfos];
            newEducationInfos[index] = {
                ...newEducationInfos[index],
                [fieldName]: parsedValue,
            };
            setEducationInfos(newEducationInfos);

        } else {
            const newEducationInfos = [...educationInfos];
            newEducationInfos[index] = {
                ...newEducationInfos[index],
                [fieldName]: value as any,
            };
            setEducationInfos(newEducationInfos);
        }

    };

    const handleNameChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        handleInputChange(index, e, "name");
    };

    const handleSchoolGpaChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        handleInputChange(index, e, "school_gpa");
    };

    const handleGraduatedYearChange = (index: number, date: Moment | null) => {
        const newEducationInfos = [...educationInfos];
        newEducationInfos[index] = {
            ...newEducationInfos[index],
            graduated_year: date ? date.year() : 0,
        };
        setEducationInfos(newEducationInfos);
    };

    const deleteFile = (index: number) => {
        setSelectedFiles((prevSelectedFiles) => {
            const newSelectedFiles = [...prevSelectedFiles];
            newSelectedFiles[index] = null;
            return newSelectedFiles;
        });

        setEducationInfos((prevEducationInfos) => {
            const newEducationInfos = [...prevEducationInfos];
            newEducationInfos[index] = {
                ...newEducationInfos[index],
                files: [],
                filePaths: [],
                isUploading: false,
                documentType: null
            };
            return newEducationInfos;
        });

        message.success('File deleted successfully');
    };

    const handleDocumentTypeChange = (index: number, value: DocumentType | null) => {
        setEducationInfos((prevEducationInfos) => {
            const newEducationInfos = [...prevEducationInfos];
            newEducationInfos[index] = {
                ...newEducationInfos[index],
                documentType: value,
            };
            return newEducationInfos;
        });
    };

    const handleFileChange = async (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0] || null;

        setSelectedFiles((prevSelectedFiles) => {
            const newSelectedFiles = [...prevSelectedFiles];
            newSelectedFiles[index] = file;
            return newSelectedFiles;
        });

        if (file) {
            setEducationInfos((prevEducationInfos) => {
                const newEducationInfos = [...prevEducationInfos];
                newEducationInfos[index] = {
                    ...newEducationInfos[index],
                    isUploading: true,
                };
                return newEducationInfos;
            });

            const formData = new FormData();
            formData.append('path', file);
            // formData.append('documentType', educationInfos[index].documentType || '');  // Add documentType to form data
            if(educationInfos[index].documentType){
                formData.append('documentType', educationInfos[index].documentType!)
            }

            uploadFile(formData, {
                onSuccess: (data: any) => {
                    setEducationInfos((prevEducationInfos) => {
                        const newEducationInfos = [...prevEducationInfos];
                        newEducationInfos[index] = {
                            ...newEducationInfos[index],
                            files: [...newEducationInfos[index].files, data.id],
                            filePaths: [...newEducationInfos[index].filePaths, data.path],
                            isUploading: false,
                        };
                        return newEducationInfos;
                    });
                    message.success('File uploaded successfully');
                },
                onError: (error: any) => {
                    console.error('File upload failed', error);
                    message.error('File upload failed');
                    setEducationInfos((prevEducationInfos) => {
                        const newEducationInfos = [...prevEducationInfos];
                        newEducationInfos[index] = {
                            ...newEducationInfos[index],
                            isUploading: false,
                        };
                        return newEducationInfos;
                    });
                },
            });
        }
    };

    const handlePlusClick = (index: number) => {
        if (fileInputRefs.current[index]) {
            fileInputRefs.current[index]!.click();
        }
    };

    const handleAddEducationInfo = () => {
        setEducationInfos((prevEducationInfos) => [
            ...prevEducationInfos,
            {
                name: '',
                school_gpa: null,
                graduated_year: 0,
                files: [],
                filePaths: [],
                isUploading: false,
                documentType: null, // Initialize documentType
            },
        ]);

        setSelectedFiles((prevSelectedFiles) => [...prevSelectedFiles, null]);
    };

    const handleDeleteEducationInfo = (index: number) => {
        setEducationInfos((prevEducationInfos) => {
            const newEducationInfos = [...prevEducationInfos];
            newEducationInfos.splice(index, 1);
            return newEducationInfos;
        });

        setSelectedFiles((prevSelectedFiles) => {
            const newSelectedFiles = [...prevSelectedFiles];
            newSelectedFiles.splice(index, 1);
            return newSelectedFiles;
        });

        fileInputRefs.current = fileInputRefs.current.filter((_, i) => i !== index);
    };

    const handleSubmit = () => {
        // Form validation
        for (let i = 0; i < educationInfos.length; i++) {
            const info = educationInfos[i];
            if (!info.name) {
                toast.error(`School name is required`);
                return;
            }
            if (info.school_gpa === null || info.school_gpa === undefined) {
                toast.error(`School GPA is required`);
                return;
            }
            if (!info.graduated_year) {
                toast.error(`Graduation Year is required`);
                return;
            }

            if (!info.files || info.files.length === 0) {
                toast.error(`Certificate of graduation is required`);
                return;
            }
            if (!info.documentType) {
                toast.error(`Document Type is required`);
                return;
            }
        }

        // Save to sessionStorage and navigate
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
                graduated_year: educationInfo.graduated_year ? parseInt(educationInfo.graduated_year, 10) : 0,
                school_gpa: educationInfo.school_gpa !== null ? parseFloat(educationInfo.school_gpa) : null,
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
                                {index === 0
                                    ? "School Graduation Information"
                                    : "Other Graduation Information"}
                            </h1>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                School Name
                            </label>
                            <Space>
                                <Input
                                    placeholder="Enter School Name"
                                    className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                                    value={educationInfo.name || ""}
                                    onChange={(e) => handleNameChange(index, e)}
                                    required
                                />
                            </Space>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                School GPA
                            </label>
                            <Space>
                                <Input
                                    type="number"
                                    placeholder={educationInfo.school_gpa === null ? "Enter School GPA" : ""}
                                    className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                                    value={educationInfo.school_gpa === null ? "" : educationInfo.school_gpa?.toString()}
                                    onChange={(e) => handleSchoolGpaChange(index, e)}
                                    max={5}
                                    step="0.1"
                                    required
                                />
                            </Space>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                Graduated year
                            </label>
                            <Space>
                                <DatePicker
                                    picker="year"
                                    className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md"
                                    value={educationInfo.graduated_year ? moment(educationInfo.graduated_year.toString(), 'YYYY') : null}
                                    onChange={(date) => handleGraduatedYearChange(index, date)}
                                    placeholder="Select Year"
                                    required
                                />
                            </Space>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                Certificate Type
                            </label>
                            <Space>
                                <Select
                                    placeholder="Select Document Type"
                                    className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md"
                                    value={educationInfo.documentType || undefined}
                                    onChange={(value) => handleDocumentTypeChange(index, value as DocumentType | null)}
                                
                                    options={[
                                        { value: 'school_certificate', label: 'School Certificate' },
                                        // { value: 'passport', label: 'Passport' },
                                        // { value: 'military_document', label: 'Military Document' },
                                        // { value: 'information', label: 'Information' },
                                        // { value: 'relationship_tree', label: 'Relationship Tree' },
                                        // { value: 'medical_record', label: 'Medical Record' },
                                        // { value: 'description', label: 'Description' },
                                        // { value: 'terjiimehal', label: 'Terjiimehal' },
                                        // { value: 'labor_book', label: 'Labor Book' },
                                        // { value: 'Dushundirish', label: 'Dushundirish' },
                                        // { value: 'nika_haty', label: 'Nika Haty' },
                                        // { value: 'death_certificate', label: 'Death Certificate' },
                                        { value: 'diploma', label: 'Diploma' },
                                    ]}
                                />
                            </Space>
                        </div>


                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                Certificate of graduation
                            </label>
                            <Space>
                                <div className="flex items-center justify-center space-x-2">
                                    <Button
                                        onClick={() => {
                                            if (selectedFiles[index]) {
                                                deleteFile(index);
                                            } else {
                                                handlePlusClick(index);
                                            }
                                        }}
                                        type="text"
                                        className="cursor-pointer border-[#DFE5EF] rounded-md text-[14px] w-[400px] h-[40px] flex items-center justify-center"
                                    >
                                        {educationInfo.isUploading ? (
                                            <Spin size="small" />
                                        ) : (
                                            <div className="flex items-center justify-center w-full gap-1">
                                                {selectedFiles[index]
                                                    ? selectedFiles[index]!.name
                                                    : "Attach document"}
                                                {selectedFiles[index] ? <TrashIcon className='w-5' /> : <PlusIcon style={{ fontSize: '16px' }} />}
                                            </div>
                                        )}
                                    </Button>

                                    <input
                                        type="file"
                                        style={{ display: "none" }}
                                        onChange={(e) => handleFileChange(index, e)}
                                        ref={(el) => {
                                            if (el) {
                                                setFileInputRef(index, el);
                                            }
                                        }}
                                        accept="image/*,application/pdf"
                                        required
                                    />

                                    <InfoCircleIcon className="text-blue-500 hover:text-blue-700" />
                                </div>
                            </Space>
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
                        className="text-textSecondary border  border-#DFE5EF hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all duration-500"
                    >
                        Previous
                    </Link>

                    <button

                        onClick={handleSubmit}
                        className="bg-primaryBlue hover:text-white  text-white  py-2 px-4 rounded"

                    >
                        Next
                    </button>
                </div>
            </Space>

        </div>
    );
};

export default EducationInfo;