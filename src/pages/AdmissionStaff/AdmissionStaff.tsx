import PlusIcon from '../../assets/icons/PlusIcon';
import LoadingIndicator from '../../components/Status/LoadingIndicator';
import TableLayout from '../../components/Table/TableLayout';

import { Link, useParams } from 'react-router-dom';
import { useAdmissionStaffs } from '../../hooks/AdmissionStaff/useAdmissionStaffs';
import AdmissionStaffListItem from '../../components/AdmissionStaff/AdmisiionStaffListItem';

const AdmissionStaffList = () => {
  const { admission_id } = useParams<{ admission_id: string }>();
 

  const admissionIdNumber = Number(admission_id);
  const { data, isSuccess, isLoading } = useAdmissionStaffs(admissionIdNumber);

  return (
    <div>
      <div className="flex justify-start mb-4">
        <Link to={`/admissions/${admission_id}/staff/add`}
          className="bg-blue-500 w-[100px] text-sm text-white px-2 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
        >
          <PlusIcon className="mr-2" />
          <span>Add</span>
        </Link>
      </div>

      <TableLayout>
        <div className="py-4 grid grid-cols-12 bg-tableTop px-3 text-tableTopText">
          <div className="col-span-1">No</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Region</div>
          <div className="col-span-2">Area</div>
          <div className="col-span-2">Address</div>
          <div className="col-span-1"></div>
        </div>

        {isSuccess &&
          data.admission_staffs.map((staff, index) => (
            <AdmissionStaffListItem
              key={staff.id}
              staff={staff}
              index={index + 1} // sıra numarası
            />
          ))}
      </TableLayout>

      {isLoading && <LoadingIndicator />}

     
    </div>
  );
};

export default AdmissionStaffList;
