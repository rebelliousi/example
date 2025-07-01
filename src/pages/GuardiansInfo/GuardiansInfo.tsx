import React, { useState, useRef, useEffect } from 'react';
import { Select, DatePicker, Input, Space, Button, Spin } from 'antd';
import 'antd';
import moment from 'moment';
import type { Moment } from "moment";
import TrashIcon from '../../assets/icons/TrashIcon';
import PlusIcon from '../../assets/icons/PlusIcon';
import InfoCircleIcon from '../../assets/icons/InfoCircleIcon';

import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useSendFiles } from '../../hooks/ApplicationList/useSendFiles';

export type DocumentType =
  | 'school_certificate'
  | 'passport'
  | 'military_document'
  | 'information'
  | 'relationship_tree'
  | 'medical_record'
  | 'description'
  | 'terjiimehal'
  | 'labor_book'
  | 'Dushundirish'
  | 'nika_haty'
  | 'death_certificate'
  | 'diploma'
  | 'relations';

interface GuardianWithFiles {
    relation: string;
    first_name: string;
    last_name: string;
    father_name: string;
    date_of_birth: string;
    place_of_birth: string;
    phone: string;
    address: string;
    work_place: string;
    documents: { type: DocumentType; file: string; path: string }[];
    filePaths: string[];
    isDeceased?: boolean | null;
}

interface GuardianFormProps {
    initialGuardians?: GuardianWithFiles[];
    onGuardiansSubmit: (guardians: GuardianWithFiles[]) => void;
}

const GuardianForm: React.FC<GuardianFormProps> = ({
    initialGuardians = [
        {
            relation: 'father',
            first_name: '',
            last_name: '',
            father_name: '',
            date_of_birth: '',
            place_of_birth: '',
            phone: '',
            address: '',
            work_place: '',
            documents: [],
            filePaths: [],
            isDeceased: null,
        },
        {
            relation: 'mother',
            first_name: '',
            last_name: '',
            father_name: '',
            date_of_birth: '',
            place_of_birth: '',
            phone: '',
            address: '',
            work_place: '',
            documents: [],
            filePaths: [],
            isDeceased: null,
        },
    ],
    onGuardiansSubmit,
}) => {
    const [guardians, setGuardians] = useState<GuardianWithFiles[]>(initialGuardians);

    //  Separate state to track uploading state *per guardian*
    const [uploadingStates, setUploadingStates] = useState<boolean[]>([false, false]);  // Initialize for father and mother

    const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const deathCertificateInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const {
        mutate: uploadFile,
        isPending: isFileUploadLoadingGlobal,
    } = useSendFiles();

    const navigate = useNavigate();

    useEffect(() => {
        fileInputRefs.current = fileInputRefs.current.slice(0, guardians.length);
        deathCertificateInputRefs.current = deathCertificateInputRefs.current.slice(0, guardians.length);

        // Make sure uploadingStates array is the same length as guardians
        setUploadingStates(prev => {
            const newStates = [...prev];
            while (newStates.length < guardians.length) {
                newStates.push(false); // or true, depending on your initialization needs
            }
            return newStates;
        });
    }, [guardians.length]);

    const handleGuardianChange = (index: number, name: string, value: any) => {
        setGuardians((prev) => {
            const newGuardians = [...prev];
            newGuardians[index] = {
                ...newGuardians[index],
                [name]: value,
            };
            return newGuardians;
        });
    };

    const handleFileUpload = async (index: number, file: File | null, documentType: DocumentType, isDeathCertificate: boolean = false) => {
        if (!file) {
            toast.error('Please select a file.');
            return;
        }

        // Set the uploading state *for this guardian only*
        setUploadingStates(prev => {
            const newStates = [...prev];
            newStates[index] = true;  // Set uploading state for this index
            return newStates;
        });

        const formData = new FormData();
        formData.append('path', file);

        uploadFile(formData, {
            onSuccess: (data: any) => {
                setGuardians((prev) => {
                    const newGuardians = [...prev];
                    newGuardians[index] = {
                        ...newGuardians[index],
                        documents: [...newGuardians[index].documents, {  // Append to existing documents
                            type: documentType,
                            file: data.id,
                            path: data.path
                        }],
                        filePaths: [...newGuardians[index].filePaths, data.path] // Append to existing filePaths
                    };

                    return newGuardians;
                });
                toast.success('File uploaded successfully');
            },
            onError: (error: any) => {
                console.error('File upload failed', error);
                toast.error('File upload failed');
            },
            onSettled: () => { // Always reset uploading state after success or error
                setUploadingStates(prev => {
                    const newStates = [...prev];
                    newStates[index] = false; // Reset uploading state for this index
                    return newStates;
                });
            }
        });
    };

    const handleFileChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            handleFileUpload(index, file, 'passport');
        }
    };

    const handleDeathCertificateChange = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            handleFileUpload(index, file, 'death_certificate', true);
        }
    };

    const handlePlusClick = (index: number) => {
        if (fileInputRefs.current[index]) {
            fileInputRefs.current[index]!.click();
        }
    };

    const handleDeathCertificatePlusClick = (index: number) => {
        if (deathCertificateInputRefs.current[index]) {
            deathCertificateInputRefs.current[index]!.click();
        }
    };

    const formatDateForApi = (date: Moment | null): string => {
        if (!date) return '';
        return date.format('YYYY-MM-DD');
    };

    const formatDateForInput = (dateString: string): Moment | null => {
        if (!dateString) return null;
        return moment(dateString, 'YYYY-MM-DD');
    };

    const addGuardian = () => {
        setGuardians((prev) => ([
            ...prev,
            {
                relation: '',
                first_name: '',
                last_name: '',
                father_name: '',
                date_of_birth: '',
                place_of_birth: '',
                phone: '',
                address: '',
                work_place: '',
                documents: [],
                filePaths: [],
                isDeceased: null,
            },
        ]));

        //Also update uploading states
        setUploadingStates(prev => [...prev, false]);
    };

    const removeItem = (index: number) => {
        setGuardians((prev) => {
            const newItems = [...prev];
            newItems.splice(index, 1);
            return newItems;
        });

        // Also update uploadingStates
        setUploadingStates(prev => {
            const newStates = [...prev];
            newStates.splice(index, 1);
            return newStates;
        });
    };

    const handleSubmit = () => {
        // Phone Number Validation
        const phoneRegex = /^\+993\d{8}$/;

        //Determine if guardians are required.
        const bothParentsDeceased = guardians[0].isDeceased === true && guardians[1].isDeceased === true;
        const atLeastOneParentDeceased = guardians[0].isDeceased === true || guardians[1].isDeceased === true;


        // Form doğrulama işlemleri
        for (let i = 0; i < guardians.length; i++) {
            const guardian = guardians[i];

            if (!guardian.first_name || !guardian.last_name || !guardian.father_name || !guardian.date_of_birth || !guardian.place_of_birth) {
                toast.error(`Please fill in all required fields .`);
                return;
            }

            // Sadece hayatta olan gardiyanlar için adres, iletişim ve pasaport bilgisi zorunlu
            if ((guardian.isDeceased === null || guardian.isDeceased === false) && (!guardian.address || !guardian.phone || !guardian.work_place || guardian.documents.length === 0)) {
                toast.error(`Please fill in  required address, contact and passport information .`);
                return;
            }

            // Ölen gardiyanlar için ölüm belgesi zorunlu
            if (guardian.isDeceased === true && guardian.documents.length === 0) {
                toast.error(`Please fill in  required death certificate information .`);
                return;
            }

            // Telefon numarası doğrulaması
            if ((guardian.isDeceased === null || guardian.isDeceased === false) && !guardian.phone) {
                toast.error(`Phone Number is required for Guardian ${i + 1}.`);
                return;
            } else if ((guardian.isDeceased === null || guardian.isDeceased === false) && !phoneRegex.test(guardian.phone)) {
                toast.error(`Phone Number must start with +993 and contain 8 digits .`);
                return;
            }
        }

        // Check if additional guardians exist if both parents are deceased
        if (bothParentsDeceased && guardians.length <= 2) {
            toast.error("Since both parents are deceased, you must add at least one additional guardian.");
            return;
        }
        try {
            // Check if sessionStorage is available
            if (typeof sessionStorage !== 'undefined') {
                const dataToStore = JSON.stringify(guardians);
                const dataSize = dataToStore.length; // Rough estimate in bytes

                console.log("Estimated data size:", dataSize, "bytes");

                sessionStorage.setItem('guardians', dataToStore);
                onGuardiansSubmit(guardians);
            } else {
                throw new Error('Session storage is not available.');
            }
        } catch (error: any) {
            console.error("Error", error);
        }

        navigate("/infos/education-info");
    };

    const setFileInputRef = (index: number, element: HTMLInputElement | null) => {
        if (fileInputRefs.current) {
            fileInputRefs.current[index] = element;
        }
    };

    const setDeathCertificateInputRef = (index: number, element: HTMLInputElement | null) => {
        if (deathCertificateInputRefs.current) {
            deathCertificateInputRefs.current[index] = element;
        }
    };

    const handleDeceasedChange = (index: number, value: boolean | null) => {
        setGuardians(prev => {
            const newGuardians = [...prev];
            newGuardians[index] = {
                ...newGuardians[index],
                isDeceased: value,
            };
            return newGuardians;
        });
    };

    const deleteFile = (index: number, isDeathCertificate: boolean = false) => {
        setGuardians(prev => {
            const newGuardians = [...prev];
            const guardianToUpdate = { ...newGuardians[index] };

            const documentTypeToDelete:DocumentType = isDeathCertificate ? 'death_certificate' : 'passport';

            guardianToUpdate.documents = guardianToUpdate.documents.filter(doc => doc.type !== documentTypeToDelete);
            guardianToUpdate.filePaths = guardianToUpdate.filePaths.filter((path, i) => guardianToUpdate.documents[i].type !== documentTypeToDelete);

            newGuardians[index] = guardianToUpdate;
            return newGuardians;
        });
        toast.success('File deleted successfully');
    };

    const renderGuardianForm = (guardian: GuardianWithFiles, index: number, isOtherGuardian: boolean = false) => {
        const handleDateChange = (date: Moment | null) => {
            handleGuardianChange(index, 'date_of_birth', date ? formatDateForApi(date) : '');
        };

        const isPassportUploading = uploadingStates[index] === true; // Get uploading state for this guardian

        return (
            <div className="col-span-6">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-headerBlue text-[14px] font-[500]">
                        {guardian.relation === 'father' ? "Father's General Information" :
                            guardian.relation === 'mother' ? "Mother's General Information" :
                                `Guardian ${index + 1} General Information`}
                    </h1>

                </div>

                {/* Conditionally render the Relation field based on the guardian's relation */}
                {guardian.relation !== 'father' && guardian.relation !== 'mother' && (
                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-[155px] font-[400] text-[14px] self-center">
                            Relation:
                        </label>
                        <div className=" flex w-[400px]">
                            <Select
                                placeholder="Choose one relation"
                                value={guardian.relation || undefined}
                                onChange={(value) => handleGuardianChange(index, 'relation', value)}
                                style={{ width: '100%', height: '40px' }}

                            >
                                <Select.Option key={'grandparent'} value={'grandparent'}>
                                    grandparent
                                </Select.Option>
                                <Select.Option key={'sibling'} value={'sibling'}>
                                    sibling
                                </Select.Option>
                                <Select.Option key={'uncle'} value={'uncle'}>
                                    uncle
                                </Select.Option>
                                <Select.Option key={'aunt'} value={'aunt'}>
                                    aunt
                                </Select.Option>
                            </Select>
                        </div>
                    </div>
                )}
                {/* ... Rest of the form fields (first name, last name, etc.) ... */}
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                    <label className="w-44 font-[400] text-[14px] self-center">
                        First name
                    </label>
                    <Space>
                        <Input
                            placeholder="Enter First Name"
                            className="rounded-md w-[400px] h-[40px] border-[#DFE5EF] text-[14px]"
                            value={guardian.first_name}
                            onChange={(e) => handleGuardianChange(index, 'first_name', e.target.value)}
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
                            value={guardian.last_name}
                            onChange={(e) => handleGuardianChange(index, 'last_name', e.target.value)}
                            required
                        />
                    </Space>
                </div>

                {/* Father's Name Input */}
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                    <label className="w-44 font-[400] text-[14px] self-center">
                        Father's name
                    </label>
                    <Space>
                        <Input
                            placeholder="Enter Father's Name"
                            className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                            value={guardian.father_name}
                            onChange={(e) => handleGuardianChange(index, 'father_name', e.target.value)}
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
                            value={guardian.date_of_birth ? formatDateForInput(guardian.date_of_birth) : null}
                            onChange={handleDateChange}
                            format="YYYY-MM-DD"
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
                            value={guardian.place_of_birth}
                            onChange={(e) => handleGuardianChange(index, 'place_of_birth', e.target.value)}
                            required
                        />
                    </Space>
                </div>
                {/*Conditionally render "Dead" select based on "isOtherGuardian" */}
                {!isOtherGuardian && (
                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                        <label className="w-44 font-[400] text-[14px] self-center">
                            Dead?
                        </label>
                        <Space>
                            <Select
                                placeholder="Select"
                                className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md"
                                value={guardian.isDeceased === null ? undefined : guardian.isDeceased}
                                onChange={(value) => handleDeceasedChange(index, value)}
                                allowClear

                            >
                                <Select.Option value={true}>Yes</Select.Option>
                                <Select.Option value={false}>No</Select.Option>
                            </Select>
                        </Space>
                    </div>
                )}
                {/* Render address and contact information only if NOT other guardian and not deceased OR if it IS an other guardian*/}
                {(!isOtherGuardian && guardian.isDeceased === false) || isOtherGuardian ? (
                    <>
                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                Address
                            </label>
                            <Space>
                                <Input
                                    placeholder="Enter Address"
                                    className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                                    value={guardian.address}
                                    onChange={(e) => handleGuardianChange(index, 'address', e.target.value)}
                                    required
                                />
                            </Space>
                        </div>

                        <div className="mb-4 mt-20">
                            <h1 className="text-headerBlue text-[14px] font-[500]">
                                Contact Information
                            </h1>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                Phone number
                            </label>
                            <Space>
                                <Input
                                    placeholder="Enter Phone Number"
                                    className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                                    value={guardian.phone}
                                    onChange={(e) => handleGuardianChange(index, 'phone', e.target.value)}

                                />
                            </Space>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                Work place
                            </label>
                            <Space>
                                <Input
                                    placeholder="Enter work place"
                                    className="w-[400px] h-[40px] border-[#DFE5EF] rounded-md text-[14px]"
                                    value={guardian.work_place}
                                    onChange={(e) => handleGuardianChange(index, 'work_place', e.target.value)}
                                    required
                                />
                            </Space>
                        </div>
                        {/* Passport Upload */}
                        <div className="flex sm:flex-row items-start gap-4 mb-4">
                            <label className="w-44 font-[400] text-[14px] self-center">
                                Passport
                            </label>
                            <div className="flex w-[400px] items-center justify-between">
                                <Space>
                                    <div className="flex items-center justify-between w-[400px]">
                                        <Button
                                            onClick={() => {
                                                handlePlusClick(index);
                                            }}
                                            type="text"
                                            className="cursor-pointer border-[#DFE5EF] rounded-md text-[14px] w-full h-[40px] flex items-center justify-center"

                                        >
                                            {isPassportUploading ? (
                                                <Spin size="small" />
                                            ) : (
                                                <>
                                                    {guardian.documents.some(doc => doc.type === 'passport') ? ( // Check if passport already uploaded
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>Passport uploaded</span>
                                                            <TrashIcon className='w-5' onClick={() => deleteFile(index)} />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full gap-1">
                                                            <span>Attach Passport copy</span>
                                                            <PlusIcon style={{ fontSize: '16px' }} />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </Button>
                                        <input
                                            type="file"
                                            style={{ display: "none" }}
                                            onChange={(e) => handleFileChange(index, e)}
                                            ref={(el) => {
                                                setFileInputRef(index, el);
                                            }}
                                            required
                                        />
                                    </div>


                                </Space>
                                {isOtherGuardian && (
                                    <div className="flex items-center ml-4">
                                        <InfoCircleIcon className="text-blue-500 hover:text-blue-700 mr-5" />

                                        <button

                                            onClick={() => removeItem(index)}
                                            className="px-8 py-2 flex items-center justify-center gap-2 border-[#FA896B] border text-[#FA896B] rounded hover:text-[#FA896B] hover:border-[#FA896B] w-[200px]"
                                        >
                                            Delete guardian
                                            <TrashIcon className="w-4" />
                                        </button>

                                    </div>
                                )}

                            </div>
                        </div>
                    </>
                ) : (
                    guardian.isDeceased === true && (
                        <>

                            {/* Death Certificate Upload */}
                            <div className="flex  sm:flex-row items-start gap-4 mb-4">
                                <label className="w-44 font-[400] text-[14px] self-center">
                                    Death Certificate
                                </label>
                                <div className=" flex w-[400px]">
                                    <Space>
                                        <div className="flex items-center justify-between  w-[400px]">
                                            <Button
                                                onClick={() => {
                                                    handleDeathCertificatePlusClick(index);
                                                }}
                                                type="text"
                                                className="cursor-pointer border-[#DFE5EF] rounded-md text-[14px] w-full h-[40px] flex items-center justify-center"

                                            >
                                                {isPassportUploading ? (
                                                    <Spin size="small" />
                                                ) : (
                                                    <>
                                                        {guardian.documents.some(doc => doc.type === 'death_certificate') ? (  // Check if death certificate already uploaded
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>Death certificate uploaded</span>
                                                                <TrashIcon style={{ fontSize: '16px', marginLeft: '5px' }} onClick={() => deleteFile(index, true)}/>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center w-full gap-1">
                                                                <span>Attach Death Certificate copy</span>
                                                                <PlusIcon style={{ fontSize: '16px' }} />
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </Button>
                                            <input
                                                type="file"
                                                style={{ display: "none" }}
                                                onChange={(e) => handleDeathCertificateChange(index, e)}
                                                ref={(el) => {
                                                    setDeathCertificateInputRef(index, el);
                                                }}
                                                required
                                            />
                                        </div>
                                    </Space>
                                    <div className="flex items-center ml-4">
                                        <InfoCircleIcon className="text-blue-500 hover:text-blue-700 mr-5" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                )}
            </div>
        );
    };

    useEffect(() => {
        // Load data from sessionStorage on component mount
        if (typeof sessionStorage !== 'undefined') {
            const storedGuardians = sessionStorage.getItem('guardians');
            if (storedGuardians) {
                try {
                    const parsedGuardians = JSON.parse(storedGuardians) as GuardianWithFiles[];
                    setGuardians(parsedGuardians.map(guardian => ({
                        ...guardian,
                    })));

                } catch (error) {
                    console.error("Error parsing guardians from sessionStorage:", error);
                }
            }
        }

        // Initial değerleri ayarla
        setGuardians((prevGuardians) => {
            return prevGuardians.map((guardian) => ({
                ...guardian,
                date_of_birth: guardian.date_of_birth ? formatDateForInput(guardian.date_of_birth)?.format('YYYY-MM-DD') || '' : '',
            }));
        });
    }, []);

    return (
        <div className="pt-10 px-4 pb-10">
            <Toaster />
            <Space direction="vertical" size="middle" className="w-full">
                <div className="grid grid-cols-12 gap-28 mb-14">
                    {/* Render Father's Form */}
                    {renderGuardianForm(guardians[0], 0)}

                    {/* Render Mother's Form */}
                    {renderGuardianForm(guardians[1], 1)}
                </div>

                {/* Render Additional Guardians */}
                {guardians.slice(2).map((guardian, index) => (
                    <div key={index + 2} className="grid grid-cols-12 gap-28 mb-14">
                        {renderGuardianForm(guardian, index + 2, true)}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addGuardian}
                    className="px-8 py-2 flex items-center gap-2 border-blue-500 border text-blue-500 rounded"
                >
                    <PlusIcon /> Add guardian
                </button>
            </Space>
            <div className="flex justify-end mt-12 space-x-5">
                <Link
                    to="/infos/general-information"
                    className="text-textSecondary bg-white border  border-#DFE5EF hover:bg-primaryBlue hover:text-white py-2 px-4 rounded hover:transition-all hover:duration-500"
                >
                    Previous
                </Link>

                <button

                    onClick={handleSubmit}
                    className="bg-primaryBlue hover:text-white  text-white  py-2 px-4 rounded"
                    disabled={isFileUploadLoadingGlobal}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default GuardianForm;