import { FC, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useModalStore } from '../../store/modal';
import PencilIcon from '../../assets/icons/PencilIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
import { IApplication } from '../../hooks/ApplicationList/useApplicationLists';
import { useDeleteApplicationById } from '../../hooks/ApplicationList/useDeleteApplicationList';
import { useApplicationById } from '../../hooks/ApplicationList/useApplicationListById';
import { useApplicationStore } from '../../store/applicationStore';

interface ApplicationListItemProps {
  application: IApplication;
  index: number;
}

const ApplicationListItem: FC<ApplicationListItemProps> = ({ application, index }) => {
  const { mutate } = useDeleteApplicationById();
  const { setOpen, setStatus, setOnSubmit } = useModalStore();
  const navigate = useNavigate();
  const { setApplicationData } = useApplicationStore();
  const { data: detailedApplicationData, refetch } = useApplicationById(String(application.id));


  const handleDelete = useCallback(() => {
    setOnSubmit(async () => {
      try {
        await mutate(application.id);
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
    navigate(`/application_list/detail/${application.id}`);
  }, [application, navigate]);

  const handleEdit = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      console.log("Fetching application data for:", application.id);
      const { data: fetchedData } = await refetch();
      console.log("Fetched data:", fetchedData);

      if (fetchedData) {
        console.log("Setting application data to store");
        setApplicationData(fetchedData);
        navigate('/infos/edit-degree-information');
      } else {
        console.error("Application data not found after refetch");
      }
    } catch (error) {
      console.error("Error fetching or setting application data:", error);
    }
  }, [application.id, navigate, setApplicationData, refetch]);

  return (
    <div
      className="py-2 group grid cursor-pointer items-center border-t grid-cols-12 hover:bg-listItemHover px-3 text-tableTopText"
      onClick={handleRowClick}
    >
      <div>
        <h1>{index + 0}</h1>
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
          to={'#'}
          onClick={handleEdit}
          className="hover:bg-actionButtonHover rounded-full p-1"
        >
          <PencilIcon size={16} />
        </Link>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="hover:bg-actionButtonHover rounded-full p-1"
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export default ApplicationListItem;