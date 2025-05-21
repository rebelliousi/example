import { FC, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useModalStore } from '../../store/modal';

import PencilIcon from '../../assets/icons/PencilIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
import { IApplication } from '../../hooks/ApplicationList/useApplicationLists';
import { useDeleteApplicationById } from '../../hooks/ApplicationList/useDeleteApplicationList';

interface ApplicationListItemProps {
  application: IApplication;
  index: number;
}

const ApplicationListItem: FC<ApplicationListItemProps> = ({ application, index }) => {

  const { mutate } = useDeleteApplicationById();
  const { setOpen, setStatus, setOnSubmit } = useModalStore();
  const { admission_id } = useParams<{ admission_id: string }>();

  const handleDelete = useCallback(() => {
    setOnSubmit(async () => {
      try {
        await mutate(application.admission); //id need here
        setStatus('waiting');
        setOpen(false);
      } catch (err) {
        console.error(err);
        setStatus('waiting');
      }
    });
    setOpen(true);
  }, [application, setOpen, setOnSubmit, mutate, setStatus]);

  return (
    <div className="py-2 group grid cursor-pointer items-center border-t grid-cols-12 hover:bg-listItemHover px-3 text-tableTopText">
      <div>
        <h1>{index + 0}</h1>
      </div>

      <div className="col-span-3">
        <h1>{application.full_name}</h1>
      </div>

      <div className="col-span-3">
        <h1 className="line-clamp-2">{application.admission_major?.[0]?.major|| '-'}</h1>
      </div>

      <div className="col-span-1">
        <h1 className="line-clamp-2">{application.user.area}</h1>
      </div>
      <div className="col-span-1">
        <h1 className="line-clamp-2">{application.admission_year}</h1>
      </div>
      <div className="col-span-1">
        <h1 className="line-clamp-2">{application.status}</h1>
      </div>

      <div className="col-span-2 px-2 flex opacity-0 justify-end gap-2 group-hover:opacity-100">
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

export default ApplicationListItem;