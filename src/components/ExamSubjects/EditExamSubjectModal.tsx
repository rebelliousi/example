import { useState } from 'react';
import { ExamSubjectData, useEditExamSubjectById } from '../../hooks/ExamSubjects/useEditExamSubject';


interface EditExamSubjectModalProps {
  examSubject: { id: string; name: string };
  onClose: () => void;
}

const EditExamSubjectModal: React.FC<EditExamSubjectModalProps> = ({
  examSubject,
  onClose,
}) => {
  const { mutate: editExamSubject, isPending } = useEditExamSubjectById();
  const [name, setName] = useState(examSubject.name);

  const handleUpdate = () => {
    const updatedData: ExamSubjectData = { name };

    editExamSubject(
      { id: examSubject.id, data: updatedData },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          console.error('Edit failed:', error);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-9 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Edit Exam Subject</h2>

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm py-1 font-medium text-formInputText">
            Subject Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-formInput rounded-md focus:outline-none"
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

export default EditExamSubjectModal;
