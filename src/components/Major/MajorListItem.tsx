import { FC, useCallback, useState } from 'react';
import { useDeleteMajorById } from '../../hooks/Major/useDeleteMajorById';
import { IAdmissionMajor } from '../../models/models';
import { useModalStore } from '../../store/modal';
import PencilIcon from '../../assets/icons/PencilIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
import EditMajorModal from './EditMajorModal';

interface MajorListItemProps {
  major: IAdmissionMajor;
  index: number;
  admissionId: number;
}

const MajorListItem: FC<MajorListItemProps> = ({
  major,
  index,
  admissionId,
}) => {
  const { mutate } = useDeleteMajorById();
  const { setOpen, setStatus, setOnSubmit } = useModalStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDelete = useCallback(() => {
    setOnSubmit(async () => {
      try {
        await mutate(Number(major.id));
        setStatus('waiting');
        setOpen(false);
      } catch (err) {
        console.log(err);
        setStatus('waiting');
      }
    });
    setOpen(true);
  }, [major, setOpen, setOnSubmit, mutate, setStatus]);

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  return (
    <>
      <div className="py-2 group grid cursor-pointer items-center border-t grid-cols-12 hover:bg-listItemHover px-3 text-tableTopText">
        <div>
          <h1>{index + 1}</h1>
        </div>

        <div className="col-span-3">
          <h1>{major.major_name}</h1>
        </div>

        <div className="col-span-2">
          <h1 className="line-clamp-1">{major.order_number}</h1>
        </div>

        <div className="col-span-2">
          <h1 className="line-clamp-1">{major.quota}</h1>
        </div>

        <div className="col-span-4 px-2 flex opacity-0 justify-end gap-2 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="hover:bg-actionButtonHover rounded-full"
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

      {isEditModalOpen && (
        <EditMajorModal
          major={major}
          admissionId={admissionId}
          onClose={handleCloseEditModal}
        />
      )}
    </>
  );
};

export default MajorListItem;
