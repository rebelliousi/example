import { FC, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useModalStore } from '../../store/modal';
import PencilIcon from '../../assets/icons/PencilIcon';
import TrashIcon from '../../assets/icons/TrashIcon';

import { useDeleteAdmissionExamById } from '../../hooks/Exam/useDeleteAdmissionExamById';
import { Major } from '../../hooks/Exam/useAdmissionExams';

interface AdmissionExamListItemProps {
  exam: Major;
  index: number;
}

const AdmissionExamListItem: FC<AdmissionExamListItemProps> = ({ exam, index }) => {
  console.log(exam)

  const { mutate } = useDeleteAdmissionExamById();
  const { setOpen, setStatus, setOnSubmit } = useModalStore();
  const { admission_id } = useParams<{ admission_id: string }>();

  const handleDelete = useCallback(() => {
    setOnSubmit(async () => {
      try {
        await mutate(exam.id);
        setStatus('waiting');
        setOpen(false);
      } catch (err) {
        console.error(err);
        setStatus('waiting');
      }
    });
    setOpen(true);
  }, [exam, setOpen, setOnSubmit, mutate, setStatus]);

  return (
    <div className="py-2 group grid cursor-pointer items-center border-t grid-cols-12 hover:bg-listItemHover px-3 text-tableTopText">
      <div>
        <h1>{index + 1}</h1>
      </div>

      <div className="col-span-2">
        <h1>{exam.major_name}</h1>
      </div>

      <div className="col-span-2">
        <h1 className="line-clamp-2">{exam.exams.subject}</h1>
      </div>

      <div className="col-span-2">
        <h1 className="line-clamp-2">{exam.exams.subject}</h1>
      </div>

      <div className="col-span-5 px-2 flex opacity-0 justify-end gap-2 group-hover:opacity-100">
        <button
         
          onClick={(e) => e.stopPropagation()}
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
    </div>
  );
};

export default AdmissionExamListItem;
