import { Input, Space, Select, Radio, DatePicker } from "antd";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { RadioChangeEvent } from "antd";
import type { Moment } from "moment";
import moment from "moment";

import toast from 'react-hot-toast';
import { useArea } from "../hooks/Area/useAreas";
import { useApplicationStore } from "../store/applicationStore";

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

const EditGeneralInformationForm = () => {
    const { data: areaData, isLoading: isAreaLoading } = useArea();
    const areaOptions = areaData?.results || [];
    const navigate = useNavigate();

    // Zustand'dan gerekli state ve fonksiyonları al
    const { applicationData, generalInformation, setGeneralInformation } = useApplicationStore();

    // === KONSOL ÇIKTISI EKLENDİ: applicationData yüklendiğinde ve generalInformation güncellendiğinde ===
    useEffect(() => {
        if (applicationData?.user) {
            const {
                first_name, last_name, father_name, area, gender,
                nationality, date_of_birth, address, place_of_birth,
                home_phone, phone, email,
            } = applicationData.user;

            const initialData = {
                first_name: first_name || "",
                last_name: last_name || "",
                father_name: father_name || "",
                area: area || null,
                gender: gender || null,
                nationality: nationality || "",
                date_of_birth: date_of_birth || "",
                address: address || "",
                place_of_birth: place_of_birth || "",
                home_phone: home_phone || "",
                phone: phone || "",
                email: email || "",
            };
            setGeneralInformation(initialData);
            console.log("🟢 [EditGeneralInformationForm] Store: Initialized with applicationData:", initialData);
        }
    }, [applicationData, setGeneralInformation]);

    // === KONSOL ÇIKTISI EKLENDİ: generalInformation state'i her değiştiğinde ===
    useEffect(() => {
        // Bu useEffect, generalInformation state'i her güncellendiğinde çalışır.
        // Bu, inputlara yazdıkça veya seçim yaptıkça anında güncellemeleri görmenizi sağlar.
        console.log("✨ [EditGeneralInformationForm] Store: generalInformation updated:", generalInformation);
    }, [generalInformation]); // generalInformation değiştiğinde bu useEffect tetiklenir

    // Event handler'lar
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        fieldName: GeneralInformationKey
    ) => {
        const newValue = e.target.value;
        setGeneralInformation({
            ...generalInformation,
            [fieldName]: newValue,
        });
        console.log(`📝 [EditGeneralInformationForm] Input changed - ${fieldName}:`, newValue);
    };

    const handleGenderChange = (e: RadioChangeEvent) => {
        const newGender = e.target.value as "male" | "female";
        setGeneralInformation({
            ...generalInformation,
            gender: newGender,
        });
        console.log("📝 [EditGeneralInformationForm] Gender changed:", newGender);
    };

    const handleAreaChange = (value: number | null) => {
        setGeneralInformation({
            ...generalInformation,
            area: value,
        });
        console.log("📝 [EditGeneralInformationForm] Area changed:", value);
    };

    const handleDateChange = (date: Moment | null) => {
        const newDate = date ? date.format("DD.MM.YYYY") : "";
        setGeneralInformation({
            ...generalInformation,
            date_of_birth: newDate,
        });
        console.log("📝 [EditGeneralInformationForm] Date of Birth changed:", newDate);
    };

    const handleSubmit = () => {
        // Validation
        if (!generalInformation?.first_name) { toast.error('First Name is required.'); return; }
        if (!generalInformation?.last_name) { toast.error('Last Name is required.'); return; }
        if (!generalInformation?.father_name) { toast.error('Father\'s Name is required.'); return; }
        if (generalInformation?.gender === null) { toast.error('Gender is required.'); return; }
        if (!generalInformation?.nationality) { toast.error('Nationality is required.'); return; }
        if (!generalInformation?.date_of_birth) { toast.error('Date of Birth is required.'); return; }
        if (generalInformation?.area === null) { toast.error('Area is required.'); return; }
        if (!generalInformation?.address) { toast.error('Address is required.'); return; }
        if (!generalInformation?.place_of_birth) { toast.error('Place of Birth is required.'); return; }

        const cellPhoneRegex = /^\+993\d{8}$/;
        if (!generalInformation?.phone) { toast.error('Cellphone Number is required.'); return; }
        else if (!cellPhoneRegex.test(generalInformation?.phone)) { toast.error('Cellphone Number must start with +993 and contain exactly 8 digits.'); return; }

        if (!generalInformation?.home_phone) { toast.error('Home Phone Number is required.'); return; }
        else if (generalInformation?.home_phone.length < 5 || generalInformation?.home_phone.length > 6) { toast.error('Home Phone Number must be between 5 and 6 digits.'); return; }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!generalInformation?.email) { toast.error('Email is required.'); return; }
        else if (!emailRegex.test(generalInformation?.email)) { toast.error('Please enter a valid email address.'); return; }

        // === KONSOL ÇIKTISI EKLENDİ: Submit anında store'a gönderilen son veri ===
        // Bu setGeneralInformation çağrısı aslında gereksiz çünkü handleInputChange vb. zaten store'u güncelledi.
        // Ancak kodunuzda olduğu için bıraktım ve öncesine log ekledim.
        console.log("➡️ [EditGeneralInformationForm] Store: Submitting final generalInformation:", generalInformation);
        setGeneralInformation(generalInformation); 

        navigate("/infos/edit-guardians-info");
    };

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
                                className="rounded-md w-[400px]  border-[#DFE5EF] text-[14px]"
                                value={generalInformation?.first_name}
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
                                className="rounded-md w-[400px]  border-[#DFE5EF] text-[14px]"
                                value={generalInformation?.last_name}
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
                                className="w-[400px]  border-[#DFE5EF] rounded-md text-[14px]"
                                value={generalInformation?.father_name}
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
                                value={generalInformation?.gender}

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
                                className="w-[400px]  border-[#DFE5EF] rounded-md text-[14px]"
                                value={generalInformation?.nationality}
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
                                className="w-[400px]  border-[#DFE5EF] rounded-md"
                                value={
                                    generalInformation?.date_of_birth && moment(generalInformation?.date_of_birth, "DD.MM.YYYY", true).isValid()
                                        ? moment(generalInformation?.date_of_birth, "DD.MM.YYYY")
                                        : null
                                }
                                onChange={handleDateChange}
                                format="DD.MM.YYYY"
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
                                className="w-[400px]  border-[#DFE5EF] rounded-md"
                                value={generalInformation?.area || undefined}
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
                                className="w-[400px]  border-[#DFE5EF] rounded-md text-[14px]"
                                value={generalInformation?.address}
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
                                className="w-[400px]  border-[#DFE5EF] rounded-md text-[14px]"
                                value={generalInformation?.place_of_birth}
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
                                className="w-[400px]  border-[#DFE5EF] rounded-md text-[14px]"
                                value={generalInformation?.home_phone}
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
                                className="w-[400px]  border-[#DFE5EF] rounded-md text-[14px]"
                                value={generalInformation?.phone}
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
                                className="w-[400px] border-[#DFE5EF] rounded-md text-[14px]"
                                value={generalInformation?.email}
                                onChange={(e) => handleInputChange(e, "email")}
                                required
                            />
                        </Space>
                    </div>
                </div>

                <div className="flex justify-end mt-12 space-x-5">
                    <Link
                        to="/infos/edit-degree-information"
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

export default EditGeneralInformationForm;