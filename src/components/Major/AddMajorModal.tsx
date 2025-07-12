import { useState } from 'react';
import { useAddMajor } from '../../hooks/Major/useAddMajor';
import { useMajor } from '../../hooks/Major/useMajors';
import { useAdmission } from '../../hooks/Admission/useAdmissions';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Select from '../InputSelect/Select';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddMajorModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [admission, setAdmission] = useState<number>(0);
  const [orderNumber, setOrderNumber] = useState<number>(0);
  const [quota, setQuota] = useState<number>(0);
  const [major, setMajor] = useState<number>(0);
  const [page, setPage] = useState(1);

  const { data: majors } = useMajor();
  const { data: admissions } = useAdmission(page);
  const { mutateAsync, isPending } = useAddMajor();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!major || major === 0) {
      toast.error('Please select a major');
      return;
    }

    if (!admission || admission === 0) {
      toast.error('Please select an admission');
      return;
    }

    try {
      await mutateAsync({
        admission,
        order_number: orderNumber,
        quota,
        major,
      });

      queryClient.invalidateQueries({ queryKey: ['major'] });

      toast.success('Major successfully added');
      onClose();
      setAdmission(0);
      setOrderNumber(0);
      setQuota(0);
      setMajor(0);
    } catch (error) {
      console.error('Error adding major:', error);
      toast.error('Failed to add major');
    }
  };

  if (!isOpen) return null;

  const handleAdmissionChange = (value: string | number) => {
    setAdmission(Number(value));
  };
  const handleMajorChange = (value: string | number) => {
    setMajor(Number(value));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-9 rounded-lg shadow-lg w-[430px]">
        <div className="mb-2">
          <label className="block text-sm py-2 font-medium text-formInputText">
            Major
          </label>

          <Select
            options={majors?.results || []}
            value={major}
            onChange={handleMajorChange}
            placeholder="Select a major"
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm py-2 font-medium text-formInputText">
            Admission
          </label>

          <Select
            options={
              admissions?.results
                .map((item) => ({
                  id: Number(item.id),
                  name: String(item.academic_year),
                }))
                .filter((opt) => !isNaN(opt.id)) || []
            }
            value={admission}
            onChange={handleAdmissionChange}
            placeholder="Select an admission"
          />
        </div>

   
        <div className="mb-2">
          <label className="block text-sm py-2 font-medium text-formInputText">
            Order Number
          </label>
          <input
            type="number"
            className="w-full p-2 border border-formInput rounded-md focus:outline-none "
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.valueAsNumber)}
          />
        </div>

  
        <div className="mb-4">
          <label className="block text-sm py-2 font-medium text-formInputText">
            Quota
          </label>
          <input
            type="number"
            className="w-full p-2 border border-formInput rounded-md focus:outline-none"
            value={quota}
            onChange={(e) => setQuota(e.target.valueAsNumber)}
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
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMajorModal;