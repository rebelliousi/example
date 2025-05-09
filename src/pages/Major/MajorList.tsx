import PlusIcon from '../../assets/icons/PlusIcon';
import MajorListItem from '../../components/Major/MajorListItem';
import LoadingIndicator from '../../components/Status/LoadingIndicator';
import TableLayout from '../../components/Table/TableLayout';
import { useAdmissionById } from '../../hooks/Admission/useAdmissonById';
import { useParams } from 'react-router-dom';
import AddMajorModal from '../../components/Major/AddMajorModal';
import { useState } from 'react';

const MajorListPage = () => {
  const { admission_id } = useParams<{ admission_id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: admission, isSuccess, isLoading } = useAdmissionById(admission_id);

  return (
    <div>
      <div className="flex justify-start mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 w-[100px] text-sm text-white px-2 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
        >
          <PlusIcon className="mr-2" />
          Add
        </button>
      </div>

      <TableLayout>
        <div className="py-4 grid grid-cols-12 bg-tableTop px-3 text-tableTopText">
          <div className="">No</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Quote</div>
          <div className="col-span-2">Code</div>
          <div className="col-span-1"></div>
        </div>

        {isSuccess &&
          admission?.majors?.map((major, index) => (
            <MajorListItem
              key={major.id}
              major={major}
              index={index}
              admissionId={admission.id}
            />
          ))}
      </TableLayout>

      {isLoading && <LoadingIndicator />}
      <AddMajorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default MajorListPage;
