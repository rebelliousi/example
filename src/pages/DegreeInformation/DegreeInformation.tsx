import { Select, Space, message } from "antd";
import InfoCircleIcon from '../../../src/assets/icons/InfoCircleIcon'

import { useState, useEffect } from "react";


import { useNavigate } from 'react-router-dom';

import toast from 'react-hot-toast';
import { useAdmissionMajor } from "../../hooks/Major/useAdmissionMajor";
import { LinkButton } from "../../components/Buttons/LinkButton";

const { Option } = Select;

const DegreeType = {
    BACHELOR: "BACHELOR",
    MASTER: "MASTER",
} as const;

type DegreeTypeValue = "BACHELOR" | "MASTER";

interface DegreeInformation {
    degree: DegreeTypeValue;
    primary_major: number;
    admission_major: number[];
}

const DegreeInformationForm = () => {
    const degreeOptions = [
        { label: "Bachelor's Degree", value: DegreeType.BACHELOR },
        { label: "Master's Degree", value: DegreeType.MASTER },
    ];

    const { data: majorData, isLoading: isMajorLoading } = useAdmissionMajor(1);
    const majorOptions = majorData?.results || [];

    const [degreeType, setDegreeType] = useState<DegreeTypeValue | undefined>(undefined);
    const [primaryMajor, setPrimaryMajor] = useState<number | undefined>(undefined);
    const [additionalMajors, setAdditionalMajors] = useState<number[]>([]);

    const [degreeTypeTouched, setDegreeTypeTouched] = useState(false);
    const [primaryMajorTouched, setPrimaryMajorTouched] = useState(false);

    const navigate = useNavigate();

    const handlePrimaryMajorChange = (value: number) => {
        setPrimaryMajor(value);
        setPrimaryMajorTouched(true);
    };

    const handleAdditionalMajorChange = (index: number, value: number | null) => {
        const newMajors = [...additionalMajors];
        if (value !== null) {
            newMajors[index] = value;
        } else {
            newMajors.splice(index, 1);
        }
        setAdditionalMajors(newMajors);
    };

    const handleSubmit = () => {
        setDegreeTypeTouched(true);
        setPrimaryMajorTouched(true);

        if (!degreeType) {
            toast.error("Please select Degree Type.");
            return;
        }

        if (!primaryMajor) {
            toast.error("Please select Primary Major.");
            return;
        }

        const degreeInformation: DegreeInformation = {
            degree: degreeType,
            primary_major: primaryMajor,
            admission_major: additionalMajors,
        };

        sessionStorage.setItem('degreeInformation', JSON.stringify(degreeInformation));

      


        navigate('/infos/general-information');
    };

    const [showAdditionalMajors, setShowAdditionalMajors] = useState(false);

    useEffect(() => {
        setShowAdditionalMajors(degreeType === DegreeType.BACHELOR);
    }, [degreeType]);

    useEffect(() => {
        const storedDegreeInformation = sessionStorage.getItem('degreeInformation');
        if (storedDegreeInformation) {
            const parsedData = JSON.parse(storedDegreeInformation);
            setDegreeType(parsedData.degree);
            setPrimaryMajor(parsedData.primary_major);
            setAdditionalMajors(((parsedData.admission_major || []) as any[]).filter((major) => typeof major === 'number'));
        }
    }, []);

    const isDegreeTypeInvalid = degreeTypeTouched && !degreeType;
    const isPrimaryMajorInvalid = primaryMajorTouched && !primaryMajor;

    return (
        <div className="pt-10 px-4">
            <div className="mb-4">
                <h1 className="text-headerBlue text-[14px] font-[500]">
                    Degree Information
                </h1>
            </div>

            <Space direction="vertical" size="middle" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="w-32 font-[400] text-[14px]">Degree Type</label>
                    <Space>
                        <Select
                            placeholder="Select Degree Type"
                            className={`w-[400px] h-[40px] rounded-lg ${isDegreeTypeInvalid ? 'border-red-500' : 'border-[#DFE5EF]'}`}
                            value={degreeType}
                            onChange={(value) => { setDegreeType(value as DegreeTypeValue); setDegreeTypeTouched(true); }}
                            onBlur={() => setDegreeTypeTouched(true)}
                        >
                            {degreeOptions.map((degree) => (
                                <Option key={degree.value} value={degree.value}>
                                    {degree.label}
                                </Option>
                            ))}
                        </Select>
                        <InfoCircleIcon className="text-blue-500 hover:text-blue-700" />
                    </Space>
                    {/* Remove inline error messages */}
                    {/* {isDegreeTypeInvalid && <div className="text-red-500 text-sm">Degree Type is required</div>} */}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="w-32 font-[400] text-[14px]">Primary Major</label>
                    <Space>
                        <Select
                            placeholder="Select Primary Major"
                            className={`rounded-lg w-[400px] h-[40px] ${isPrimaryMajorInvalid ? 'border-red-500' : 'border-[#DFE5EF]'}`}
                            value={primaryMajor}
                            onChange={handlePrimaryMajorChange}
                            onBlur={() => setPrimaryMajorTouched(true)}
                            loading={isMajorLoading}
                            disabled={isMajorLoading}
                        >
                            {majorOptions.map((major) => (
                                <Option key={major.id} value={major.id}>
                                    {major.major}
                                </Option>
                            ))}
                        </Select>
                        <InfoCircleIcon className="text-blue-500 hover:text-blue-700" />
                    </Space>
                    {/* Remove inline error messages */}
                    {/* {isPrimaryMajorInvalid && <div className="text-red-500 text-sm">Primary Major is required</div>} */}
                </div>

                {showAdditionalMajors &&
                    [0, 1, 2].map((index) => (
                        <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center gap-4"
                        >
                            <label className="w-32 font-[400] text-[14px]">
                                Major {index + 2}
                            </label>
                            <Space>
                                <Select
                                    placeholder={`Select Major ${index + 2}`}
                                    className="rounded-lg w-[400px] h-[40px] border-[#DFE5EF]"
                                    value={additionalMajors[index]}
                                    onChange={(value) =>
                                        handleAdditionalMajorChange(index, value)
                                    }
                                    loading={isMajorLoading}
                                    disabled={isMajorLoading}
                                    allowClear
                                >
                                    {majorOptions.map((major) => (
                                        <Option key={major.id} value={major.id}>
                                            {major.major}
                                        </Option>
                                    ))}
                                </Select>
                                {index === 0 && (
                                    <InfoCircleIcon className="text-blue-500 hover:text-blue-700" />
                                )}
                            </Space>
                        </div>
                    ))}

                <div className="flex justify-end mt-10 space-x-5">
                    <LinkButton to="/instruction_page"
                        className="text-textSecondary bg-white border  border-#DFE5EF hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all hover:duration-500"
                    >
                        Previous
                    </LinkButton>

                    <button
                        className="bg-primaryBlue hover:text-white  text-white  py-2 px-4 rounded"
                        onClick={handleSubmit}
                    >
                        Next
                    </button>
                </div>
            </Space>
        </div>
    );
};

export default DegreeInformationForm;