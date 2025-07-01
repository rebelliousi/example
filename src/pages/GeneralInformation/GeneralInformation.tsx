import { Input, Space, Select, Radio, DatePicker } from "antd";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useArea } from "../../hooks/Area/useAreas";
import type { RadioChangeEvent } from "antd";
import type { Moment } from "moment";
import moment from "moment";

import toast from 'react-hot-toast'; // Import react-hot-toast

const { Option } = Select;

interface ApplicationUserForm {
    first_name: string;
    last_name: string;
    father_name: string;
    area: number | null;
    gender: 'male' | 'female' | null;
    nationality: string;
    date_of_birth: string;
    address: string;
    place_of_birth: string;
    home_phone: string;
    phone: string;
    email: string;
}

type GeneralInformationKey = keyof ApplicationUserForm;

const GeneralInformationForm = () => {
    const { data: areaData, isLoading: isAreaLoading } = useArea();
    const areaOptions = areaData?.results || [];
    const navigate = useNavigate();

    const [formData, setFormData] = useState<ApplicationUserForm>({
        first_name: "",
        last_name: "",
        father_name: "",
        area: null,
        gender: null,
        nationality: "",
        date_of_birth: "",
        address: "",
        place_of_birth: "",
        home_phone: "",
        phone: "",
        email: "",
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        fieldName: Exclude<GeneralInformationKey, "date_of_birth" | "gender">
    ) => {
        setFormData({ ...formData, [fieldName]: e.target.value });
    };

    const handleGenderChange = (e: RadioChangeEvent) => {
        setFormData({ ...formData, gender: e.target.value as "male" | "female" });
    };

    const handleAreaChange = (value: number | null) => {
        setFormData({ ...formData, area: value });
    };

    const handleDateChange = (date: Moment | null) => {
        setFormData({
            ...formData,
            date_of_birth: date ? date.format("YYYY-MM-DD") : "",
        });
    };

    const handleSubmit = () => {
        // Validation
        if (!formData.first_name) {
            toast.error('First Name is required.');
            return;
        }
        if (!formData.last_name) {
            toast.error('Last Name is required.');
            return;
        }
        if (!formData.father_name) {
            toast.error('Father\'s Name is required.');
            return;
        }
        if (formData.gender === null) {
            toast.error('Gender is required.');
            return;
        }
        if (!formData.nationality) {
            toast.error('Nationality is required.');
            return;
        }
        if (!formData.date_of_birth) {
            toast.error('Date of Birth is required.');
            return;
        }
        if (formData.area === null) {
            toast.error('Area is required.');
            return;
        }
        if (!formData.address) {
            toast.error('Address is required.');
            return;
        }
        if (!formData.place_of_birth) {
            toast.error('Place of Birth is required.');
            return;
        }

        // Phone Number Validation
        const cellPhoneRegex = /^\+993\d{8}$/;
        if (!formData.phone) {
            toast.error('Cellphone Number is required.');
            return;
        } else if (!cellPhoneRegex.test(formData.phone)) {
            toast.error('Cellphone Number must start with +993 and contain exactly 8 digits.');
            return;
        }

        // Home Phone Validation
        if (!formData.home_phone) {
            toast.error('Home Phone Number is required.');
            return;
        } else if (formData.home_phone.length < 5 || formData.home_phone.length > 6) {
            toast.error('Home Phone Number must be between 5 and 6 digits.');
            return;
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            toast.error('Email is required.');
            return;
        } else if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        let formattedDate = "";
        if (formData.date_of_birth) {
            const dateMoment = moment(formData.date_of_birth, "YYYY-MM-DD", true);
            formattedDate = dateMoment.isValid() ? dateMoment.format("YYYY-MM-DD") : "";
        }

        // Create a new object for the data to be stored in sessionStorage
        const formDataToSend = {
            ...formData,
            date_of_birth: formattedDate,
        };

        sessionStorage.setItem(
            "generalInformation",
            JSON.stringify(formDataToSend)
        );
        sessionStorage.setItem("gender", formData.gender || "");
        navigate("/infos/guardians-info");
    };

    useEffect(() => {
        const storedGeneralInformation = sessionStorage.getItem("generalInformation");
        if (storedGeneralInformation) {
            try {
                const parsedData: ApplicationUserForm = JSON.parse(
                    storedGeneralInformation
                );

                if (parsedData.date_of_birth) {
                    const dateMoment = moment(parsedData.date_of_birth, "YYYY-MM-DD", true);
                    parsedData.date_of_birth = dateMoment.isValid()
                        ? dateMoment.format("YYYY-MM-DD")
                        : "";
                }

                setFormData(parsedData);
            } catch (error) {
                console.error("Error parsing stored data:", error);
            }
        }
    }, []);

    return (
        <div className="pt-10 px-4 pb-10">
            <Space direction="vertical" size="middle" className="w-full">
                {/* General Information */}
                <div className="mb-14">
                    <div className="mb-4">
                        <h1 className="text-headerBlue text-[14px] font-[500]">
                            General Information
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            First name
                        </label>
                        <Space>
                            <Input
                                placeholder="Enter First Name"
                                className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                                value={formData.first_name}
                                onChange={(e) => handleInputChange(e, "first_name")}
                                required
                            />
                        </Space>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Last name
                        </label>
                        <Space>
                            <Input
                                placeholder="Enter Last Name"
                                className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                                value={formData.last_name}
                                onChange={(e) => handleInputChange(e, "last_name")}
                                required
                            />
                        </Space>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Father's name
                        </label>
                        <Space>
                            <Input
                                placeholder="Enter Father's Name"
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                                value={formData.father_name}
                                onChange={(e) => handleInputChange(e, "father_name")}
                                required
                            />
                        </Space>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Gender
                        </label>
                        <Space>
                            <Radio.Group
                                onChange={handleGenderChange}
                                value={formData.gender}

                            >
                                <Radio value="male">Male</Radio>
                                <Radio value="female">Female</Radio>
                            </Radio.Group>
                        </Space>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Nationality
                        </label>
                        <Space>
                            <Input
                                placeholder="Enter Nationality"
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                                value={formData.nationality}
                                onChange={(e) => handleInputChange(e, "nationality")}
                                required
                            />
                        </Space>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Date of birth
                        </label>
                        <Space>
                            <DatePicker
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md"
                                value={
                                    formData.date_of_birth && moment(formData.date_of_birth, "YYYY-MM-DD", true).isValid()
                                        ? moment(formData.date_of_birth, "YYYY-MM-DD")
                                        : null
                                }
                                onChange={handleDateChange}
                                format="YYYY-MM-DD"
                                required
                            />
                        </Space>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Area
                        </label>
                        <Space>
                            <Select
                                placeholder="Select Area"
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md"
                                value={formData.area || undefined}
                                onChange={handleAreaChange}
                                loading={isAreaLoading}
                                allowClear

                            >
                                {areaOptions.map((area) => (
                                    <Option key={area.id} value={area.id}>
                                        {area.name}
                                    </Option>
                                ))}
                            </Select>
                        </Space>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Address
                        </label>
                        <Space>
                            <Input
                                placeholder="Enter Address"
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                                value={formData.address}
                                onChange={(e) => handleInputChange(e, "address")}
                                required
                            />
                        </Space>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Place of birth
                        </label>
                        <Space>
                            <Input
                                placeholder="Enter Place of Birth"
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                                value={formData.place_of_birth}
                                onChange={(e) => handleInputChange(e, "place_of_birth")}
                                required
                            />
                        </Space>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mb-14">
                    <div className="mb-4">
                        <h1 className="text-headerBlue text-[14px] font-[500]">
                            Contact Information
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Home phone number
                        </label>
                        <Space>
                            <Input
                                placeholder="Enter Home Phone Number"
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                                value={formData.home_phone}
                                onChange={(e) => handleInputChange(e, "home_phone")}

                            />
                        </Space>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Cellphone number
                        </label>
                        <Space>
                            <Input
                                placeholder="Enter Cell Phone Number"
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                                value={formData.phone}
                                onChange={(e) => handleInputChange(e, "phone")}

                            />
                        </Space>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            E-mail
                        </label>
                        <Space>
                            <Input
                                placeholder="Enter Email"
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                                value={formData.email}
                                onChange={(e) => handleInputChange(e, "email")}
                                required
                            />
                        </Space>
                    </div>
                </div>

                <div className="flex justify-end mt-12 space-x-5">
                    <Link
                        to="/infos/degree-information"
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

export default GeneralInformationForm;