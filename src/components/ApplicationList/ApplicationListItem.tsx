import { FC, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleDelete = useCallback(() => {
    setOnSubmit(async () => {
      try {
        await mutate(application.id); //id need here
        setStatus('waiting');
        setOpen(false);
      } catch (err) {
        console.error(err);
        setStatus('waiting');
      }
    });
    setOpen(true);
  }, [application, setOpen, setOnSubmit, mutate, setStatus]);

  const handleRowClick = useCallback(() => {
    navigate(`/application_list/detail/${application.id}`); // Or whatever the correct detail page route is
  }, [application, navigate]);

  return (
    <div
      className="py-2 group grid cursor-pointer items-center border-t grid-cols-12 hover:bg-listItemHover px-3 text-tableTopText"
      onClick={handleRowClick}
    >
      <div>
        <h1>{index + 1}</h1>
      </div>

      <div className="col-span-3">
        <h1>{application.full_name}</h1>
      </div>

      <div className="col-span-3">
        <h1 className="line-clamp-2">{application.primary_major.major || '-'}</h1>
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
        <Link
          to={`/application_list/edit/${application.id}`}
          onClick={(e) => e.stopPropagation()}
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

export default ApplicationListItem;