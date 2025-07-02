import React from 'react';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';

// Define the type for degree
type Degree = "BACHELOR" | "MASTER" | undefined;

interface Props {
    primaryMajorId: number;
    admissionMajorIds: number[];
    degree: Degree;
}

const MajorSelection: React.FC<Props> = ({ primaryMajorId, admissionMajorIds, degree }) => {
    const { data: majors } = useAdmissionMajor(1); // Tüm bölümleri getir

    const getMajorName = (majorId: number): string => {
        const major = majors?.results.find(m => m.id === majorId);
        return major ? major.major : 'Unknown';
    };

    return (
        <div className="w-full mb-16">
            <h3 className="text-md text-[#4570EA] font-semibold">
                Degree Information
            </h3>
            <div className="flex flex-col">
                <div className="flex items-center space-x-5 mb-2"> {/* Added mb-2 */}
                    <label className="p-2 font-medium w-48">Degree:</label>
                    <div className="p-4 w-[400px]">
                        {degree ? degree : 'N/A'}
                    </div>
                </div>

                <div className="flex items-center space-x-5 mb-2"> {/* Added mb-2 */}
                    <label className="p-2 font-medium w-48">Primary Major:</label>
                    <div className="p-4 w-[400px]">
                        {getMajorName(primaryMajorId)}
                    </div>
                </div>

                {admissionMajorIds.length > 0 ? (
                    admissionMajorIds.map((majorId: number, index: number) => (
                        <div key={majorId} className="flex items-center space-x-5 mb-2"> {/* Added flex, space-x-5, and mb-2 */}
                            <label className="p-2 font-medium w-48">Major {index + 1}:</label>
                            <div className="p-4 w-[400px]">
                                {getMajorName(majorId)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 w-[400px] text-gray-500 italic"> {/* Added styling for message */}
                        No admission majors selected.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MajorSelection;