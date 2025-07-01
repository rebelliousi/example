import { FC, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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
  const { setApplicationData } = useApplicationStore(); // Zustand'dan sadece set fonksiyonunu al
  const { data: detailedApplicationData, refetch } = useApplicationById(String(application.id)); // useApplicationById hook'unu kullan

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

  const handleEdit = useCallback(() => {
    // Düzenleme sayfasına göndermeden önce useApplicationById ile verileri çek ve Zustand'a gönder
    refetch().then(() => { // refetch ile verileri güncel olarak çek
      if (detailedApplicationData) {
        setApplicationData(detailedApplicationData); // useApplicationById'den gelen verileri Zustand'a gönder
        navigate('/infos/edit-degree-information'); // Düzenleme sayfasına yönlendir
      } else {
        console.error("Başvuru verileri yüklenirken bir hata oluştu.");
        // Hata durumunda kullanıcıya bir mesaj gösterebilirsiniz.
      }
    });
  }, [application.id, navigate, setApplicationData, detailedApplicationData, refetch]);

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
          to={'#'} // Geçici olarak # yapıldı, onClick ile yönlendirme yapılacak
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(); // Yeni fonksiyonu çağır
          }}
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