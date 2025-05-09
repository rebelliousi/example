import { FC, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useModalStore } from '../../store/modal';
import { useDeleteAdmissionPlaceById } from '../../hooks/AdmissionPlace/useDeleteAdmissionPlacebyId';
import PencilIcon from '../../assets/icons/PencilIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
import { IPlace } from '../../hooks/AdmissionPlace/useAdmissionPlaces';

interface AdmissionPlaceListItemProps {
  place: IPlace;
  index: number;
}

const AdmissionPlaceListItem: FC<AdmissionPlaceListItemProps> = ({ place, index }) => {

  const { mutate } = useDeleteAdmissionPlaceById();
  const { setOpen, setStatus, setOnSubmit } = useModalStore();
  const { admission_id } = useParams<{ admission_id: string }>();

  const handleDelete = useCallback(() => {
    setOnSubmit(async () => {
      try {
        await mutate(place.id);
        setStatus('waiting');
        setOpen(false);
      } catch (err) {
        console.error(err);
        setStatus('waiting');
      }
    });
    setOpen(true);
  }, [place, setOpen, setOnSubmit, mutate, setStatus]);

  return (
    <div className="py-2 group grid cursor-pointer items-center border-t grid-cols-12 hover:bg-listItemHover px-3 text-tableTopText">
      <div>
        <h1>{index + 1}</h1>
      </div>

      <div className="col-span-2">
        <h1>{place.region_name}</h1>
      </div>

      <div className="col-span-2">
        <h1 className="line-clamp-2">{place.area_name}</h1>
      </div>

      <div className="col-span-2">
        <h1 className="line-clamp-2">{place.address}</h1>
      </div>

      <div className="col-span-5 px-2 flex opacity-0 justify-end gap-2 group-hover:opacity-100">
        <Link
          to={`/admissions/${admission_id}/place/${place.id}/edit`}
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

export default AdmissionPlaceListItem;
