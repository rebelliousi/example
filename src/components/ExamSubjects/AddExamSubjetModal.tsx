import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAddExamSubject } from '../../hooks/ExamSubjects/useAddExamSubjects';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddExamSubjectModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [subjectName, setSubjectName] = useState('');
  const { mutateAsync, isPending } = useAddExamSubject();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!subjectName.trim()) {
      toast.error('Subject name is required');
      return;
    }

    try {
      await mutateAsync({ name: subjectName });
      queryClient.invalidateQueries({ queryKey: ['exam_subjects'] });
      toast.success('Exam subject added successfully');
      setSubjectName('');
      onClose();
    } catch (error) {
      console.error('Error adding exam subject', error);
      toast.error('Failed to add exam subject');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[430px]">
        <div className="mb-4">
          <label
            htmlFor="subjectName"
            className="block text-sm py-1 font-medium text-gray-600"
          >
            Subject Name
          </label>
          <input
            id="subjectName"
            placeholder='Enter exam subject name'
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none text-gray-600"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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

export default AddExamSubjectModal;
