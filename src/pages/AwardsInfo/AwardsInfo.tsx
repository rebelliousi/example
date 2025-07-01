import { Input, Space, Button, message, Select, Spin } from "antd";
import InfoCircleIcon from "../../assets/icons/InfoCircleIcon";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PlusIcon from "../../assets/icons/PlusIcon";
import TrashIcon from "../../assets/icons/TrashIcon";

import toast from "react-hot-toast";
import { useSendFiles } from "../../hooks/ApplicationList/useSendFiles";

const OlympicType = {
    AREA: 'area',
    REGION: 'region',
    STATE: 'state',
    INTERNATIONAL: 'international',
    OTHER: 'other',
} as const;

type OlympicTypeValue = typeof OlympicType[keyof typeof OlympicType];

const CertificateType = {
    PARTICIPATION: 'participation',
    ACHIEVEMENT: 'achievement',
    WINNER: 'winner',
    OTHER: 'other',
} as const;

type CertificateTypeType = typeof CertificateType[keyof typeof CertificateType];

interface AwardInfo {
    type: OlympicTypeValue | null;
    description: string | null;
    files: any[];
    filePaths: string[];
    selectedFile: File | null;
    isUploading: boolean;
}

const AwardsInfo = () => {
    const navigate = useNavigate();

    const [awardInfos, setAwardInfos] = useState<AwardInfo[]>([{
        type: null,
        description: '',
        files: [],
        filePaths: [],
        selectedFile: null,
        isUploading: false
    }]);

    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        fileInputRefs.current = fileInputRefs.current.slice(0, awardInfos.length);
    }, [awardInfos.length]);

    const { mutate: uploadFile } = useSendFiles();

    const handleAwardTypeChange = (index: number, value: OlympicTypeValue | null) => {
        const updatedAwardInfos = [...awardInfos];
        updatedAwardInfos[index].type = value;
        setAwardInfos(updatedAwardInfos);
    };

    const handleAwardInfoChange = (
        index: number,
        fieldName: keyof AwardInfo,
        value: string | OlympicTypeValue | null
    ) => {
        const updatedAwardInfos = [...awardInfos];
        updatedAwardInfos[index][fieldName] = value as never;
        setAwardInfos(updatedAwardInfos);
    };

    const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const certificateType = CertificateType.PARTICIPATION; // Varsayılan belge türü

        if (file) {
            // Yükleme başladığında durumu ayarla
            const updatedAwardInfos = [...awardInfos];
            updatedAwardInfos[index].isUploading = true;
            setAwardInfos(updatedAwardInfos);

            const formData = new FormData();
            formData.append('path', file);
            formData.append('certificateType', certificateType);

            uploadFile(formData, {
                onSuccess: (data: any) => {
                    const updatedAwardInfos = [...awardInfos];
                    updatedAwardInfos[index].files.push(data.id);
                    updatedAwardInfos[index].filePaths.push(data.path);
                    updatedAwardInfos[index].selectedFile = file;
                    updatedAwardInfos[index].isUploading = false; // Yükleme bitti
                    setAwardInfos(updatedAwardInfos);

                    toast.success('File uploaded successfully');
                },
                onError: (error: any) => {
                    console.error('File upload failed', error);
                    toast.error('File upload failed');

                    // Hata durumunda da yükleme durumunu sıfırla
                    const updatedAwardInfos = [...awardInfos];
                    updatedAwardInfos[index].isUploading = false;
                    setAwardInfos(updatedAwardInfos);
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
        setAwardInfos([
            ...awardInfos,
            {
                type: null,
                description: '',
                files: [],
                filePaths: [],
                selectedFile: null,
                isUploading: false
            },
        ]);
    };

    const handleDeleteAwardInfo = (index: number) => {
        const updatedAwardInfos = [...awardInfos];
        updatedAwardInfos.splice(index, 1);
        setAwardInfos(updatedAwardInfos);
    };

    const deleteFile = (index: number) => {
        const updatedAwardInfos = [...awardInfos];
        updatedAwardInfos[index].files = [];
        updatedAwardInfos[index].filePaths = [];
        updatedAwardInfos[index].selectedFile = null;
        updatedAwardInfos[index].isUploading = false;
        setAwardInfos(updatedAwardInfos);
    };

    const handleSubmit = () => {
        for (let i = 0; i < awardInfos.length; i++) {
            const info = awardInfos[i];

            if (!info.type) {
                toast.error(`Please select an award type .`);
                return;
            }

            if (!info.description) {
                toast.error(`Please enter a description .`);
                return;
            }

            if (info.files.length === 0) {
                toast.error(`Please upload a certificate.`);
                return;
            }
        }

        sessionStorage.setItem('awardInformation', JSON.stringify(awardInfos));
        navigate("/infos/other-doc-info");
    };

    useEffect(() => {
        const storedAwardInfos = sessionStorage.getItem("awardInformation");
        if (storedAwardInfos) {
            try {
                const parsedData = JSON.parse(storedAwardInfos);

                // Tip güvenliğini sağla
                const typedData: AwardInfo[] = parsedData.map((item: any) => ({
                    type: item.type as OlympicTypeValue | null,
                    description: item.description || '',
                    files: item.files || [],
                    filePaths: item.filePaths ? (item.filePaths as string[]) : [],
                    selectedFile: null,
                    isUploading: false
                }));

                setAwardInfos(typedData);
            } catch (error) {
                console.error("Error parsing stored award information:", error);
                setAwardInfos([
                    {
                        type: null,
                        description: '',
                        files: [],
                        filePaths: [],
                        selectedFile: null,
                        isUploading: false
                    },
                ]);
            }
        }
    }, []);


    const setFileInputRef = (index: number, element: HTMLInputElement | null) => {
        if (fileInputRefs.current) {
            fileInputRefs.current[index] = element;
        }
    };

    return (
        <div className="pt-10 px-4 pb-10">
            <Space direction="vertical" size="middle" className="w-full">
                <div className="mb-14">
                    <div className="mb-4">
                        <h1 className="text-headerBlue text-[14px] font-[500]">
                            Awards
                        </h1>
                    </div>

                    {awardInfos.map((awardInfo, index) => (
                        <div key={index} className=" rounded mb-4">
                            <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                                <label className="w-44 font-[400] text-[14px] self-center">Award type</label>
                                <Space>
                                    <Select
                                        placeholder="Select Award Type"
                                        className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                                        value={awardInfo.type || undefined}
                                        onChange={(value) => handleAwardTypeChange(index, value as OlympicTypeValue)}

                                    >
                                        {Object.entries(OlympicType).map(([key, value]) => (
                                            <Select.Option key={key} value={value as OlympicTypeValue}>
                                                {key}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Space>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                                <label className="w-44 font-[400] text-[14px] self-center">Description</label>
                                <Space>
                                    <Input
                                        placeholder="Enter Description"
                                        className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                                        value={awardInfo.description || ""}
                                        onChange={(e) => handleAwardInfoChange(index, "description", e.target.value)}
                                        required // Added required attribute
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
                                                if (awardInfo.selectedFile) {
                                                    deleteFile(index);
                                                } else {
                                                    handlePlusClick(index);
                                                }
                                            }}
                                            type="text"
                                            className="cursor-pointer border-[#DFE5EF] rounded-md text-[14px] w-[400px] h-[40px] flex items-center justify-center"
                                        >
                                            {awardInfo.isUploading ? (
                                                <Spin size="small" />
                                            ) : (
                                                <div className="flex items-center justify-center w-full gap-1">
                                                    {awardInfo.selectedFile
                                                        ? awardInfo.selectedFile.name
                                                        : "Attach document"}
                                                    {awardInfo.selectedFile ? <TrashIcon /> : <PlusIcon style={{ fontSize: '16px' }} />}
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
                                </Space>
                            </div>

                            {awardInfos.length > 1 && (
                                <button
                                    onClick={() => handleDeleteAwardInfo(index)}
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
                </div>


                <div className="flex justify-end mt-10 space-x-5">
                    <Link to='/infos/education-info'
                        className="text-textSecondary bg-white border  border-#DFE5EF hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all hover:duration-500"


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

export default AwardsInfo;