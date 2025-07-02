import React from 'react';
import moment from 'moment';
import { useArea } from '../../hooks/Area/useAreas'; // Eğer gerekli ise

interface Props {
    personalInfo: {
        username: string; // ADD THIS LINE
        first_name: string;
        last_name: string;
        father_name: string;
        area: number;
        gender: 'male' | 'female';
        nationality: string;
        date_of_birth: string;
        address: string;
        place_of_birth: string;
        home_phone: string;
        phone: string;
        email: string;
    }; // IApplicationWithFiles tipinden ilgili kısım
}

const PersonalInformation: React.FC<Props> = ({ personalInfo }) => {
    const { data: areas } = useArea(); // Eğer alana ihtiyaç varsa burada kullanın

    const formatDateForInput = (dateString: string): string => {
        if (!dateString) return '';
        return moment(dateString, 'DD.MM.YYYY').format('DD.MM.YYYY');
    };

    return (
        <div className="mb-16">
            <h3 className="text-md text-[#4570EA] font-semibold mb-2">
                Personal Information
            </h3>
            <div className="flex flex-col">
                {/* Kişisel bilgi alanları */}
                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">First Name:</label>
                    <div className="p-4 w-[400px]">
                        {personalInfo.first_name}
                    </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Last Name:</label>
                    <div className="p-4 w-[400px]">
                        {personalInfo.last_name}
                    </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Father's Name:</label>
                    <div className="p-4 w-[400px]">
                        {personalInfo.father_name}
                    </div>
                </div>
                    <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Gender:</label>
                    <div className="p-4 w-[400px] ">
                        {personalInfo.gender === "male" ? "Male" : "Female"}
                    </div>
                </div>

                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Nationality:</label>
                    <div className="p-4 w-[400px]">
                        {personalInfo.nationality}
                    </div>
                </div>

                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Date of Birth:</label>
                    <div className="p-4 w-[400px]">
                        {formatDateForInput(personalInfo.date_of_birth)}
                    </div>
                </div>


                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Area:</label>
                    <div className="p-4  w-[400px] h-20">
                        {areas?.results.find(area => area.id === personalInfo.area)?.name}
                    </div>
                </div>


                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Address:</label>
                    <div className="p-4 w-[400px]">
                        {personalInfo.address}
                    </div>
                </div>
                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Place of Birth:</label>
                    <div className="p-4 w-[400px]">
                        {personalInfo.place_of_birth}
                    </div>
                </div>
                 </div>

                 <div className='mt-16'>
                    
                 <h3 className="text-md text-[#4570EA] font-semibold mb-2">
                Contact Information
            </h3>

                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Home Phone:</label>
                    <div className="p-4 w-[400px]">
                        {personalInfo.home_phone}
                    </div>
                </div>

            
                
                

                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Phone:</label>
                    <div className="p-4 w-[400px]">
                        {personalInfo.phone}
                    </div>
                </div>

                <div className="flex items-center space-x-5 mb-2">
                    <label className="p-3 font-medium w-48">Email:</label>
                    <div className="p-4 w-[400px]">
                        {personalInfo.email}
                    </div>
                </div>
                 </div>


           
        </div>
    );
};

export default PersonalInformation;