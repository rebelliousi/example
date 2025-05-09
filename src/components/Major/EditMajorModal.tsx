import { useState } from 'react';
import { useEditMajorById } from '../../hooks/Major/useEditMajor';
import { useMajor } from '../../hooks/Major/useMajors';
import { useAdmissionById } from '../../hooks/Admission/useAdmissonById';
import { IAdmissionMajor } from '../../models/models';
import Select from '../InputSelect/Select';


interface EditMajorModalProps {
  major: IAdmissionMajor;
  admissionId: number;
  onClose: () => void;
}

const EditMajorModal: React.FC<EditMajorModalProps> = ({
  major,
  admissionId,
  onClose,
}) => {
  const { mutate: editMajor, isPending } = useEditMajorById();
  const { data: majors, isLoading: isMajorLoading } = useMajor();
  const { data: admissionData, isLoading: isAdmissionLoading } =
    useAdmissionById(String(admissionId));

  const [orderNumber, setOrderNumber] = useState<number>(major.order_number);
  const [quota, setQuota] = useState<number>(major.quota);
  const [selectedMajor, setSelectedMajor] = useState<number>(major.major);
  const [selectedAdmission, setSelectedAdmission] = useState<number>(
    admissionId
  );

  const handleUpdate = () => {
    const majorData = {
      admission: selectedAdmission,
      order_number: orderNumber,
      quota: quota,
      major: selectedMajor,
    };

    editMajor(
      {
        id: String(major.id),
        data: majorData,
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
      <div className="bg-white p-8 rounded-lg shadow-lg w-[430px]">
        {/* Order Number */}
        <div className="mb-2">
          <label
            htmlFor="orderNumber"
            className="block text-sm py-2 font-medium text-formInputText"
          >
            Order Number
          </label>
          <input
            id="orderNumber"
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.valueAsNumber)}
          />
        </div>

        {/* Quota */}
        <div className="mb-2">
          <label
            htmlFor="quota"
            className="block text-sm py-2 font-medium  text-formInputText"
          >
            Quota
          </label>
          <input
            id="quota"
            type="number"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none"
            value={quota}
            onChange={(e) => setQuota(e.target.valueAsNumber)}
          />
        </div>

        {/* Major Select */}
        <div className="mb-2">
          <label
            htmlFor="major"
            className="block text-sm py-2 font-medium text-formInputText"
          >
            Major
          </label>
          {isMajorLoading ? (
            <p>Loading majors...</p>
          ) : (
            <Select
              options={majors?.results.map((majorOption) => ({
                id: majorOption.id,
                name: majorOption.name,
              })) || []}
              value={selectedMajor}
              onChange={setSelectedMajor}
              placeholder="Select a major"
            />
          )}
        </div>

        {/* Admission Select */}
        <div className="mb-4">
          <label
            htmlFor="admission"
            className="block text-sm py-2 font-medium text-formInputText"
          >
            Admission
          </label>
          {isAdmissionLoading ? (
            <p>Loading...</p>
          ) : (
            <Select
              options={
                admissionData
                  ? [
                      {
                        id: admissionData.id,
                        name: admissionData.academic_year,
                      },
                    ]
                  : []
              }
              value={selectedAdmission}
              onChange={setSelectedAdmission}
              placeholder="Select an admission"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onClose}
            className="text-gray-500 border rounded-lg p-2 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {isPending ? 'Updating...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMajorModal;
