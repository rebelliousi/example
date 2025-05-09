import { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Sayfa yönlendirme için
import { useDeleteAdmissionById } from '../../hooks/Admission/useDeleteAdmissionById';
import { IAdmission } from '../../models/models';
import { useModalStore } from '../../store/modal';
import PencilIcon from '../../assets/icons/PencilIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
import EditAdmissionModal from './EditAdmissionModal';

interface AdmissionListItemProps {
  admission: IAdmission;
  index: number;
}

const AdmissionListItem: FC<AdmissionListItemProps> = ({
  admission,
  index,
}) => {
  const { mutate } = useDeleteAdmissionById();
  const { setOpen, setStatus, setOnSubmit } = useModalStore();

  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = useCallback(() => {
    setOnSubmit(async () => {
      setStatus('pending');
      try {
        await mutate(Number(admission.id));
        setStatus('waiting');
        setOpen(false);
      } catch (err) {
        console.log(err);
        setStatus('waiting');
      }
    });
    setOpen(true);
  }, [admission, setOpen, setOnSubmit, mutate, setStatus]);

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  return (
    <>
      <div
        className="py-2 group grid  cursor-pointer items-center border-t grid-cols-12 hover:bg-listItemHover px-3 text-tableTopText"
        onClick={() => navigate(`/admissions/${admission.id}/majors`)}
      >
        <div>
          <h1>{index + 1}</h1>
        </div>

        <div className="col-span-3 ">
          <h1>{admission.academic_year}</h1>
        </div>

        <div className="col-span-2">
          <h1 className="line-clamp-1">{admission.start_date}</h1>
        </div>
        <div className="col-span-2">
          <h1 className="line-clamp-1">{admission.end_date}</h1>
        </div>

        <div className="col-span-4 px-2 flex opacity-0 justify-end gap-2 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(); // Bu şekilde, her iki işlemi tek bir onClick içerisinde yapıyoruz
            }}
            className="hover:bg-actionButtonHover rounded-full"
          >
            <PencilIcon size={16} />
          </button>

          <button
            onClick={(e)=>{
                e.stopPropagation();
                handleDelete()
            }}
            className="hover:bg-actionButtonHover rounded-full"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>

      {isEditModalOpen && (
        <EditAdmissionModal
          admission={admission}
          onClose={handleCloseEditModal}
        />
      )}
    </>
  );
};

export default AdmissionListItem;
