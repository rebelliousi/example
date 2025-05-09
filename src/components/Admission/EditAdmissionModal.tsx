import { useState } from 'react';
import { useEditAdmissionById } from '../../hooks/Admission/useEditAdmission';
import { useAcademicYear } from '../../hooks/AcademicYear/useAcademicYears.ts';
import { IAdmission } from '../../models/models';
import Select from '../InputSelect/Select.tsx'; // Assuming you have a custom Select component

interface EditAdmissionModalProps {
  admission: IAdmission;
  onClose: () => void;
}

const EditAdmissionModal: React.FC<EditAdmissionModalProps> = ({
  admission,
  onClose,
}) => {
  const { mutate: UpdateAdmission, isPending } = useEditAdmissionById();
  const { data: academicYears = []} = useAcademicYear(); // Providing a fallback value of [] to avoid undefined

  const [startDate, setStartDate] = useState(admission.start_date);
  const [endDate, setEndDate] = useState(admission.end_date);
  const [academicYear, setAcademicYear] = useState<number | null>(admission.academic_year ?? null); // Set initial value to admission.academic_year

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleUpdate = () => {
    const admissionData: Partial<IAdmission> = {
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      academic_year: academicYear ?? 0, // Ensure fallback for null
    };

    UpdateAdmission(
      {
        id: String(admission.id),
        data: admissionData as IAdmission,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          console.error(error);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-9 rounded-lg shadow-lg w-[430px]">
        <div className="mb-3">
          <label htmlFor="academicYear" className="block text-sm py-1 font-medium text-formInputText">
            Academic Year
          </label>
          <Select
            options={academicYears.map((year) => ({
              id: year.id!,
              name: `${year.date_start}-${year.date_end} ${year.is_active ? '(Active)' : ''}`,
            }))}
            value={academicYear ?? undefined}
            onChange={setAcademicYear}
            placeholder="Select academic year"
            className='text-'
          />
        </div>
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-sm py-1 font-medium text-formInputText">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            className="w-full p-2 border border-formInput rounded-md focus:outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="endDate" className="block text-sm py-1 font-medium text-formInputText">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            className="w-full p-2 border border-formInput rounded-md focus:outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 justify-center gap-4">
          <button
            onClick={onClose}
            className="text-gray-500 border rounded-lg p-2 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isPending}
            className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
          >
            {isPending ? 'Updating...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAdmissionModal;
