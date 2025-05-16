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
  }, [exam.id, setOpen, setOnSubmit, mutate, setStatus]);

  // Veriyi incelemek için console.log
  console.log("Exam:", exam);

  const examCount = 3; // Göstermek istediğimiz sınav sayısı
  return (
    <div className="py-2 group grid cursor-pointer items-center border-t grid-cols-12 hover:bg-listItemHover px-3 text-tableTopText">
      <div className="col-span-1">
        <h1>{index + 1}</h1>
      </div>

      <div className="col-span-3">
        <h1>{exam.major_name}</h1>
      </div>

      {/* Sınavları ve dersleri dinamik olarak görüntüle */}
      {Array.from({ length: examCount }, (_, i) => {
        const examData = exam.exams && exam.exams[i]?.exam_dates && exam.exams[i]?.exam_dates[0];
        return (
          <div key={i} className="col-span-2">
            <h1 className="line-clamp-2">
              {examData ? examData.subject : '-'}
            </h1>
          </div>
        );
      })}

      <div className="col-span-2 px-2 flex opacity-0 justify-end gap-2 group-hover:opacity-100">
        <Link
          to={`/admissions/${admission_id}/exams/${exam.id}/edit`}
          onClick={(e) => e.stopPropagation()}
          className="hover:bg-actionButtonHover rounded-full"
        >
          <PencilIcon size={16} />
        </Link>

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