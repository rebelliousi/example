import { useState } from 'react';
import { useAddAdmission } from '../../hooks/Admission/useAddAdmission';
import { useAcademicYear } from '../../hooks/AcademicYear/useAcademicYears.ts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast'; // Import toast
import Select from '../InputSelect/Select.tsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAdmissionModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [academicYear, setAcademicYear] = useState<number | null>(null);

  const { data: academicYears} = useAcademicYear();
  const { mutateAsync, isPending } = useAddAdmission();
  const queryClient = useQueryClient();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  const handleSave = async () => {
    if (academicYear === null) {
      toast.error('Please select an academic year'); // Display error toast
      return;
    }

    try {
      await mutateAsync({
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        academic_year: String(academicYear),
      });

      queryClient.invalidateQueries({ queryKey: ['admission'] });

      toast.success('Admission successfully added'); // Display success toast
      onClose();
      setStartDate('');
      setEndDate('');
      setAcademicYear(null);
    } catch (error) {
      console.error('Error adding admission ', error);
      toast.error('Failed to add admission'); // Display error toast
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-9 rounded-lg shadow-lg w-[430px]">
        <div className="mb-3">
          <label
            htmlFor="academicYear"
            className="block text-sm py-1 font-medium text-formInputText"
          >
            Academic Year
          </label>
          <Select
            options={
              academicYears
                ?.filter((year) => year.id !== undefined)
                .map((year) => ({
                  id: year.id!,
                  name: `${year.date_start}-${year.date_end} ${year.is_active ? '(Active)' : ''}`,
                })) || []
            }
            value={academicYear ?? undefined}
            onChange={setAcademicYear}
            placeholder="Select academic year"
            className="text-gray-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="startDate"
            className="block text-sm py-1 font-medium text-gray-500"
          >
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none text-gray-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="endDate"
            className="block text-sm py-1 font-medium text-gray-500"
          >
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none text-gray-500"
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
            onClick={handleSave}
            disabled={isPending}
            className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAdmissionModal;