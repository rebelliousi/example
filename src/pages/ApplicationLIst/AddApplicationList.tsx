import React, { useState } from 'react';
import { IApplication, useAddApplication } from '../../hooks/ApplicationList/useAddApplicationList';
import Container from '../../components/Container/Container'; // Container component'ini içe aktar
import Select from '../../components/InputSelect/Select'; // Select component'ini içe aktar
import { LinkButton } from '../../components/Buttons/LinkButton'; // LinkButton component'ini içe aktar
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AddApplicationPage: React.FC = () => {
    const [applicationData, setApplicationData] = useState<IApplication>({
        degree: '',
        first_name: '',
        last_name: '',
        gender: '',
        nationality: '',
        date_of_birth: '',
        area: 0,
        address: '',
        place_of_birth: '',
        home_phone: '',
        cell_phone: '',
        email: '',
        serial_number: '',
        document_number: '',
        given_date: '',
        given_by: '',
        passport: '',
        school_name: '',
        school_graduated_year: 0,
        school_gpa: 0,
        region_of_school: 0,
        district_of_school: '',
        certificate_of_school: '',
        award: '',
        award_description: '',
        award_certificate: '',
        military_service: '',
        military_service_note: '',
        assign_job_by_sign: false,
        orphan: false,
        number: 0,
        guardians: [],
        rejection_reason: '',
        date_approved: '',
        status: '',
    });

    const { mutateAsync: addApplication, isPending } = useAddApplication();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type} = e.target;

        setApplicationData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          await addApplication(applicationData);
          toast.success('Application successfully added!');
          navigate('/'); // veya uygun bir sayfaya yönlendir
        } catch (error) {
          toast.error('Failed to add application.');
        }
    };

    return (
      <Container>
        <div className="px-5 py-10">
          {/* Başlık ve Butonlar */}
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-lg">Add Application</h1>
            <div className="space-x-4">
              <LinkButton to="/" variant="cancel">
                Cancel
              </LinkButton>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                {isPending ? "Submitting..." : "Add"}
              </button>
            </div>
          </div>

          {/* Degree Information */}
          <section className="mb-6">
            <h2 className="text-md font-semibold mb-3">Degree Information</h2>
            <div className="flex flex-col gap-4">
              <div className="">
                <label htmlFor="degree" className="block text-sm font-medium text-gray-700">
                  Degree Types:
                </label>
                <Select
                  id="degree"
                  name="degree"
                  value={applicationData.degree}
                  onChange={(value) => handleChange({ target: { name: 'degree', value } } as any)}
                  options={[
                    { id: "bachelor", name: "Bachelor" },
                    { id: "master", name: "Master" },
                  ]}
                  placeholder="Select Degree Type"
                  className="w-full"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="primary_major" className="block text-sm font-medium text-gray-700">
                  Primary Major:
                </label>
                <Select
                  id="primary_major"
                  name="primary_major"
                  value={applicationData.address}
                  onChange={(value) => handleChange({ target: { name: 'primary_major', value } } as any)}
                  options={[
                    { id: "computer_science", name: "Computer Science" },
                    { id: "engineering", name: "Engineering" },
                  ]}
                  placeholder="Select Primary Major"
                  className="w-full"
                />
              </div>
              {/* Major 2, 3, 4 */}
              {[2, 3, 4].map((num) => (
                <div className="col-span-1" key={num}>
                  <label htmlFor={`major${num}`} className="block text-sm font-medium text-gray-700">
                    Major {num}:
                  </label>
                  <Select
                    id={`major${num}`}
                    name={`major${num}`}
                    value={applicationData[`major${num}`]} // TypeScript hatası olabilir
                    onChange={(value) => handleChange({ target: { name: `major${num}`, value } } as any)}
                    options={[
                      { id: "computer_science", name: "Computer Science" },
                      { id: "engineering", name: "Engineering" },
                    ]}
                    placeholder="Select Major"
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </section>

           {/* Personal Information */}
           <section className="mb-6">
            <h2 className="text-md font-semibold mb-3">Personal Information</h2>
            <div className="flex flex-col gap-4">
              <div className="col-span-1">
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name:
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={applicationData.first_name}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name:
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={applicationData.last_name}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="fathers_name" className="block text-sm font-medium text-gray-700">
                  Father's Name:
                </label>
                <input
                  type="text"
                  id="fathers_name"
                  name="fathers_name"
                  value={applicationData.father_name}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>

               <div className="col-span-1">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender:
                </label>
                <Select
                  id="gender"
                  name="gender"
                  value={applicationData.gender}
                  onChange={(value) => handleChange({ target: { name: 'gender', value } } as any)}
                  options={[
                    { id: "male", name: "Male" },
                    { id: "female", name: "Female" },
                    { id: "other", name: "Other" },
                  ]}
                  placeholder="Select Gender"
                  className="w-full"
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                  Nationality:
                </label>
                <input
                  type="text"
                  id="nationality"
                  name="nationality"
                  value={applicationData.nationality}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                  Date of Birth:
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={applicationData.date_of_birth}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>

               <div className="col-span-1">
                <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                  Area:
                </label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={applicationData.area}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>

                <div className="col-span-1">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address:
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={applicationData.address}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>

                <div className="col-span-1">
                <label htmlFor="place_of_birth" className="block text-sm font-medium text-gray-700">
                  Place of Birth:
                </label>
                <input
                  type="text"
                  id="place_of_birth"
                  name="place_of_birth"
                  value={applicationData.place_of_birth}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>

            </div>
          </section>

           {/* Contact Information */}
           <section className="mb-6">
            <h2 className="text-md font-semibold mb-3">Contact Information</h2>
            <div className="flex flex-col gap-4">
              <div className="col-span-1">
                <label htmlFor="home_phone" className="block text-sm font-medium text-gray-700">
                  Home Phone Number:
                </label>
                <input
                  type="text"
                  id="home_phone"
                  name="home_phone"
                  value={applicationData.home_phone}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="cell_phone" className="block text-sm font-medium text-gray-700">
                  Cellphone Number:
                </label>
                <input
                  type="text"
                  id="cell_phone"
                  name="cell_phone"
                  value={applicationData.cell_phone}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-mail:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={applicationData.email}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
            </div>
          </section>

          {/* Passport Information */}
          <section className="mb-6">
            <h2 className="text-md font-semibold mb-3">Passport Information</h2>
            <div className="flex flex-col gap-4">
              <div className="col-span-1">
                <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">
                  Serial Number:
                </label>
                <input
                  type="text"
                  id="serial_number"
                  name="serial_number"
                  value={applicationData.serial_number}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="document_number" className="block text-sm font-medium text-gray-700">
                  Document Number:
                </label>
                <input
                  type="text"
                  id="document_number"
                  name="document_number"
                  value={applicationData.document_number}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="given_date" className="block text-sm font-medium text-gray-700">
                  Date Given:
                </label>
                <input
                  type="date"
                  id="given_date"
                  name="given_date"
                  value={applicationData.given_date}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="given_by" className="block text-sm font-medium text-gray-700">
                  Given By:
                </label>
                <input
                  type="text"
                  id="given_by"
                  name="given_by"
                  value={applicationData.given_by}
                  onChange={handleChange}
                  className="mt-1 p-2 w-full border rounded-md"
                />
              </div>
              <div className="col-span-1">
                <label htmlFor="passport" className="block text-sm font-medium text-gray-700">
                  Passport (File):
                </label>
                <input
                  type="file"
                  id="passport"
                  name="passport"
                  onChange={handleChange}
                  className="mt-1 p-2 w-full"
                />
              </div>
            </div>
          </section>

             {/* Father's Information */}
             <section className="mb-6">
                <h2 className="text-md font-semibold mb-3">Father's Information</h2>
                <div className="flex flex-col gap-4">
                    <div className="col-span-1">
                        <label htmlFor="father_first_name" className="block text-sm font-medium text-gray-700">
                            First Name:
                        </label>
                        <input
                            type="text"
                            id="father_first_name"
                            name="father_first_name"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="father_last_name" className="block text-sm font-medium text-gray-700">
                            Last Name:
                        </label>
                        <input
                            type="text"
                            id="father_last_name"
                            name="father_last_name"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="father_fathers_name" className="block text-sm font-medium text-gray-700">
                            Father's Father Name:
                        </label>
                        <input
                            type="text"
                            id="father_fathers_name"
                            name="father_fathers_name"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="father_date_of_birth" className="block text-sm font-medium text-gray-700">
                            Date of Birth:
                        </label>
                        <input
                            type="date"
                            id="father_date_of_birth"
                            name="father_date_of_birth"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="father_area" className="block text-sm font-medium text-gray-700">
                            Area:
                        </label>
                        <input
                            type="number"
                            id="father_area"
                            name="father_area"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="father_address" className="block text-sm font-medium text-gray-700">
                            Address:
                        </label>
                        <textarea
                            id="father_address"
                            name="father_address"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="father_phone_number" className="block text-sm font-medium text-gray-700">
                            Phone Number:
                        </label>
                        <input
                            type="text"
                            id="father_phone_number"
                            name="father_phone_number"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="father_work_place" className="block text-sm font-medium text-gray-700">
                            Work Place:
                        </label>
                        <input
                            type="text"
                            id="father_work_place"
                            name="father_work_place"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="father_passport" className="block text-sm font-medium text-gray-700">
                            Passport (File):
                        </label>
                        <input
                            type="file"
                            id="father_passport"
                            name="father_passport"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Mother's Information */}
            <section className="mb-6">
                <h2 className="text-md font-semibold mb-3">Mother's Information</h2>
                <div className="flex flex-col gap-4">
                    <div className="col-span-1">
                        <label htmlFor="mother_first_name" className="block text-sm font-medium text-gray-700">
                            First Name:
                        </label>
                        <input
                            type="text"
                            id="mother_first_name"
                            name="mother_first_name"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="mother_last_name" className="block text-sm font-medium text-gray-700">
                            Last Name:
                        </label>
                        <input
                            type="text"
                            id="mother_last_name"
                            name="mother_last_name"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="mother_fathers_name" className="block text-sm font-medium text-gray-700">
                            Mother's Father Name:
                        </label>
                        <input
                            type="text"
                            id="mother_fathers_name"
                            name="mother_fathers_name"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="mother_date_of_birth" className="block text-sm font-medium text-gray-700">
                            Date of Birth:
                        </label>
                        <input
                            type="date"
                            id="mother_date_of_birth"
                            name="mother_date_of_birth"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="mother_area" className="block text-sm font-medium text-gray-700">
                            Area:
                        </label>
                        <input
                            type="number"
                            id="mother_area"
                            name="mother_area"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="mother_address" className="block text-sm font-medium text-gray-700">
                            Address:
                        </label>
                        <textarea
                            id="mother_address"
                            name="mother_address"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="mother_phone_number" className="block text-sm font-medium text-gray-700">
                            Phone Number:
                        </label>
                        <input
                            type="text"
                            id="mother_phone_number"
                            name="mother_phone_number"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="mother_work_place" className="block text-sm font-medium text-gray-700">
                            Work Place:
                        </label>
                        <input
                            type="text"
                            id="mother_work_place"
                            name="mother_work_place"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="mother_passport" className="block text-sm font-medium text-gray-700">
                            Passport (File):
                        </label>
                        <input
                            type="file"
                            id="mother_passport"
                            name="mother_passport"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                </div>
            </section>

            {/* School Graduation Information */}
            <section className="mb-6">
                <h2 className="text-md font-semibold mb-3">School Graduation Information</h2>
                <div className="flex flex-col gap-4">
                    <div className="col-span-1">
                        <label htmlFor="graduated_school" className="block text-sm font-medium text-gray-700">
                            Graduated School:
                        </label>
                        <input
                            type="text"
                            id="graduated_school"
                            name="graduated_school"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="graduated_year" className="block text-sm font-medium text-gray-700">
                            Graduated Year:
                        </label>
                        <input
                            type="number"
                            id="graduated_year"
                            name="graduated_year"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                            Region:
                        </label>
                        <input
                            type="text"
                            id="region"
                            name="region"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                            District:
                        </label>
                        <input
                            type="text"
                            id="district"
                            name="district"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="certificate_of_graduation" className="block text-sm font-medium text-gray-700">
                            Certificate of Graduation (File):
                        </label>
                        <input
                            type="file"
                            id="certificate_of_graduation"
                            name="certificate_of_graduation"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Other Education Information */}
            <section className="mb-6">
                <h2 className="text-md font-semibold mb-3">Other Education Information</h2>
                <div className="flex flex-col gap-4">
                    <div className="col-span-1">
                        <label htmlFor="other_education_type" className="block text-sm font-medium text-gray-700">
                            Type:
                        </label>
                        <input
                            type="text"
                            id="other_education_type"
                            name="other_education_type"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="other_education_country" className="block text-sm font-medium text-gray-700">
                            Country:
                        </label>
                        <input
                            type="text"
                            id="other_education_country"
                            name="other_education_country"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="graduated_university" className="block text-sm font-medium text-gray-700">
                            Graduated University:
                        </label>
                        <input
                            type="text"
                            id="graduated_university"
                            name="graduated_university"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="other_graduated_year" className="block text-sm font-medium text-gray-700">
                            Graduated Year:
                        </label>
                        <input
                            type="number"
                            id="other_graduated_year"
                            name="other_graduated_year"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="other_certificate" className="block text-sm font-medium text-gray-700">
                            Certificate of Graduation (File):
                        </label>
                        <input
                            type="file"
                            id="other_certificate"
                            name="other_certificate"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Awards */}
            <section className="mb-6">
                <h2 className="text-md font-semibold mb-3">Awards</h2>
                <div className="flex flex-col gap-4">
                    <div className="col-span-1">
                        <label htmlFor="award_type" className="block text-sm font-medium text-gray-700">
                            Award Type:
                        </label>
                        <input
                            type="text"
                            id="award_type"
                            name="award_type"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="award_description" className="block text-sm font-medium text-gray-700">
                            Description:
                        </label>
                        <textarea
                            id="award_description"
                            name="award_description"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full border rounded-md"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="award_certificate" className="block text-sm font-medium text-gray-700">
                            Certificate (File):
                        </label>
                        <input
                            type="file"
                            id="award_certificate"
                            name="award_certificate"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                </div>
            </section>

            {/* Other Documents */}
            <section className="mb-6">
                <h2 className="text-md font-semibold mb-3">Other Documents</h2>
                <div className="flex flex-col gap-4">
                    <div className="col-span-1">
                        <label htmlFor="military_service" className="block text-sm font-medium text-gray-700">
                            Military Service (File):
                        </label>
                        <input
                            type="file"
                            id="military_service"
                            name="military_service"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="health_document" className="block text-sm font-medium text-gray-700">
                            Health Document (File):
                        </label>
                        <input
                            type="file"
                            id="health_document"
                            name="health_document"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="family_document" className="block text-sm font-medium text-gray-700">
                            Family Document (File):
                        </label>
                        <input
                            type="file"
                            id="family_document"
                            name="family_document"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="information" className="block text-sm font-medium text-gray-700">
                            Information (File):
                        </label>
                        <input
                            type="file"
                            id="information"
                            name="information"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="another_info" className="block text-sm font-medium text-gray-700">
                            Another Info (File):
                        </label>
                        <input
                            type="file"
                            id="another_info"
                            name="another_info"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                    <div className="col-span-1">
                        <label htmlFor="image_3x4" className="block text-sm font-medium text-gray-700">
                            3x4 Image (File):
                        </label>
                        <input
                            type="file"
                            id="image_3x4"
                            name="image_3x4"
                            onChange={handleChange}
                            className="mt-1 p-2 w-full"
                        />
                    </div>
                </div>
            </section>
        </div>
      </Container>
    );
};

export default AddApplicationPage;