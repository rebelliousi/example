import { FC, useCallback, useState } from 'react';
import {  useParams } from 'react-router-dom';
import { useModalStore } from '../../store/modal';

import PencilIcon from '../../assets/icons/PencilIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
import { IExamSubjects } from '../../models/models';
import { useDeleteExamSubjectsById } from '../../hooks/ExamSubjects/useDeleteExamSubjectsById';
import EditExamSubjectModal from './EditExamSubjectModal';

interface ExamSubjectsListItemProps {
  examSubjects: IExamSubjects;
  index: number;
}

const ExamSUbjectsListItem: FC<ExamSubjectsListItemProps> = ({ examSubjects, index }) => {

  const { mutate } = useDeleteExamSubjectsById();
  const { setOpen, setStatus, setOnSubmit } = useModalStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  const handleDelete = useCallback(() => {
    setOnSubmit(async () => {
      try {
        await mutate(examSubjects.id);
        setStatus('waiting');
        setOpen(false);
      } catch (err) {
        console.error(err);
        setStatus('waiting');
      }
    });
    setOpen(true);
  }, [examSubjects, setOpen, setOnSubmit, mutate, setStatus]);

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  return (
    <div className="py-2 group grid cursor-pointer items-center border-t grid-cols-12 hover:bg-listItemHover px-3 text-tableTopText">
      <div className='col-span-1'>
        <h1>{index + 1}</h1>
      </div>

      <div className="col-span-2">
        <h1>{examSubjects.name}</h1>
      </div>

     
      <div className="col-span-9 px-2 flex opacity-0 justify-end gap-2 group-hover:opacity-100">
        <button
       
       onClick={(e) => {
        e.stopPropagation();
        handleEdit(); 
      }}
        >
          <PencilIcon size={16} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="hover:bg-actionButtonHover rounded-full"
        >
          <TrashIcon size={16} />
        </button>
      </div>

      {isEditModalOpen && (
  <EditExamSubjectModal
    examSubject={{
      id: String(examSubjects.id),
      name: examSubjects.name,
    }}
    onClose={handleCloseEditModal}
  />
)}

    </div>
  );
};

export default ExamSUbjectsListItem;
