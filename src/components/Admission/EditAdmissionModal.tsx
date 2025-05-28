import { useState, useEffect } from 'react';
import { useEditAdmissionById } from '../../hooks/Admission/useEditAdmission';
import { useAcademicYear } from '../../hooks/AcademicYear/useAcademicYears.ts';
import { IAdmission } from '../../models/models';
import Select from '../InputSelect/Select.tsx';
import { toast } from 'react-hot-toast'; 

interface EditAdmissionModalProps {
  admission: IAdmission;
  onClose: () => void;
}

const parseToYyyyMmDd = (dateString?: string | null): string => {
  if (!dateString) return '';

 
  if (dateString.includes('-')) {
    const parts = dateString.split('T')[0].split('-'); 
    if (parts.length === 3 && parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {

      if (/^\d{4}-\d{2}-\d{2}$/.test(parts.join('-'))) {
          return parts.join('-');
      }
    }
  }


  if (dateString.includes('.')) {
    const parts = dateString.split('.');
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; 
    }
  }
  

  try {
    const dateObj = new Date(dateString);
    if (!isNaN(dateObj.getTime())) { 
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
   
  }

  console.warn(`Unparseable date string for input: ${dateString}. Returning empty.`);
  return ''; 
};



const formatYyyyMmDdToDdMmYyyyForApi = (dateYyyyMmDd: string): string => {
  if (!dateYyyyMmDd || !dateYyyyMmDd.includes('-')) return ''; 
  const parts = dateYyyyMmDd.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`; 
  }
  return ''; 
};


const EditAdmissionModal: React.FC<EditAdmissionModalProps> = ({
  admission,
  onClose,
}) => {
  const { mutate: UpdateAdmission, isPending } = useEditAdmissionById();
  const { data: academicYears = [] } = useAcademicYear();


  const [startDate, setStartDate] = useState<string>(() => parseToYyyyMmDd(admission.start_date));
  const [endDate, setEndDate] = useState<string>(() => parseToYyyyMmDd(admission.end_date));
  const [academicYear, setAcademicYear] = useState<number | null>(admission.academic_year ?? null);

 
  useEffect(() => {
    setStartDate(parseToYyyyMmDd(admission.start_date));
    setEndDate(parseToYyyyMmDd(admission.end_date));
    setAcademicYear(admission.academic_year ?? null);
  }, [admission]);

  const handleUpdate = () => {
    if (academicYear === null) {
      toast.error('Please select an academic year');
      return;
    }
    if (!startDate || !endDate) {
        toast.error('Please select start and end dates');
        return;
    }

   
    const admissionData: Partial<IAdmission> = {
      start_date: formatYyyyMmDdToDdMmYyyyForApi(startDate), 
      end_date: formatYyyyMmDdToDdMmYyyyForApi(endDate),  
      academic_year: academicYear, 
    };

    UpdateAdmission(
      {
        id: String(admission.id),
        data: admissionData as IAdmission,
      },
      {
        onSuccess: () => {
          toast.success('Admission successfully updated');
          onClose();
        },
        onError: (error: any) => { 
          console.error("Update admission error:", error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update admission';
          toast.error(errorMessage);
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
            onChange={(value) => setAcademicYear(value as number | null)}
            placeholder="Select academic year"
            className='text-gray-500'
          />
        </div>
        <div className="mb-4">
          <label htmlFor="startDate" className="block text-sm py-1 font-medium text-formInputText">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            className="w-full p-2 border border-formInput rounded-md focus:outline-none text-gray-500"
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
            className="w-full p-2 border border-formInput rounded-md focus:outline-none text-gray-500"
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
            disabled={isPending || !startDate || !endDate || academicYear === null}
            className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isPending ? 'Updating...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAdmissionModal;