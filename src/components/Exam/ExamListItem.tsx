import { FC, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useModalStore } from '../../store/modal';
import PencilIcon from '../../assets/icons/PencilIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
import { useDeleteAdmissionExamById } from '../../hooks/Exam/useDeleteAdmissionExamById';
import { Major } from '../../hooks/Exam/useAdmissionExams';

interface AdmissionExamListItemProps {
    major: Major;
    index: number;
}

const AdmissionExamListItem: FC<AdmissionExamListItemProps> = ({ major, index }) => {
    const { mutate } = useDeleteAdmissionExamById();
    const { setOpen, setStatus, setOnSubmit } = useModalStore();
    const { admission_id } = useParams<{ admission_id: string }>();
    const navigate = useNavigate();

    const handleDelete = useCallback(() => {
        setOnSubmit(async () => {
            try {
                await mutate(major.id);
                setStatus('waiting');
                setOpen(false);
            } catch (err) {
                console.error(err);
                setStatus('waiting');
            }
        });
        setOpen(true);
    }, [major.id, setOpen, setOnSubmit, mutate, setStatus]);

    const examCount = 3;

    const handleRowClick = () => {
        if (major.exams?.length > 0) {
            navigate(`/admissions/${admission_id}/exams/major/${major.id}`);
        }
    };

    // Tüm subject isimlerini al (hataları önle)
    const allSubjects = major.exams
        ?.flatMap((exam) => exam.subject ?? [])
        .map((subject) => subject.name);

    return (
        <div
            onClick={handleRowClick}
            className="py-2 group grid cursor-pointer items-center border-t grid-cols-12 hover:bg-listItemHover px-3 text-tableTopText"
        >
            <div className="col-span-1">
                <h1>{index + 1}</h1>
            </div>

            <div className="col-span-3">
                <h1>{major.major_name}</h1>
            </div>

            {Array.from({ length: examCount }, (_, i) => (
                <div key={i} className="col-span-2">
                    <h1 className="line-clamp-2">
                        {allSubjects && allSubjects[i] ? allSubjects[i] : '-'}
                    </h1>
                </div>
            ))}

            <div className="col-span-2 px-2 flex opacity-0 justify-end gap-2 group-hover:opacity-100">
                <Link
                    to={`/admissions/${admission_id}/exams/major/${major.id}/edit`} // Modified path
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