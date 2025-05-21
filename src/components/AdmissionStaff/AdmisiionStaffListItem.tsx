import { FC, useCallback } from 'react';

import { useModalStore } from '../../store/modal';
import PencilIcon from '../../assets/icons/PencilIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
 import { useParams } from 'react-router-dom';
import { useDeleteAdmissionStaffById } from '../../hooks/AdmissionStaff/useDeleteAdmissionStaffById';
import { IAdmissionStaff } from '../../hooks/AdmissionStaff/useAdmissionStaffs';
import { Link } from 'react-router-dom';


interface AdmissionStaffListItemProps {
  staff: IAdmissionStaff;
  index: number;
 
}

const AdmissionStaffListItem: FC<AdmissionStaffListItemProps> = ({ staff, index}) => {
  const { mutate } = useDeleteAdmissionStaffById();
  const { setOpen, setStatus, setOnSubmit } = useModalStore();

  const {admission_id}=useParams()
 


  const handleDelete = useCallback(() => {
    setOnSubmit(async () => {
      try {
        await mutate(Number(staff.id));
        setStatus('waiting');
        setOpen(false);
      } catch (err) {
        console.log(err);
        setStatus('waiting');
      }
    });
    setOpen(true);
  }, [staff, setOpen, setOnSubmit, mutate, setStatus]);

  

  return (
    <>
      <div
        className="py-2 group grid cursor-pointer items-center border-t grid-cols-12  px-3 text-tableTopText"
        
      >
        <div>
          <h1>{index + 1}</h1>
        </div>

        <div className="col-span-2">
          <h1>{staff.staff_name}</h1>
        </div>

        <div className="col-span-2">
          <h1 className="line-clamp-2">{staff.role}</h1>
        </div>


        <div className="col-span-2">
          <h1 className="line-clamp-2">{staff.place.area_name}</h1>
        </div>

        <div className="col-span-2">
          <h1 className="line-clamp-2">{staff.place.address}</h1>
        </div>

        <div className="col-span-3 px-2 flex opacity-0 justify-end gap-2 group-hover:opacity-100">
          <Link   to={`/admissions/${admission_id}/staff/${staff.id}/edit`}
           
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

    </>
  );
};

export default AdmissionStaffListItem;
