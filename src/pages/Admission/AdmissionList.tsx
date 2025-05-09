import PlusIcon from '../../assets/icons/PlusIcon';
import Container from '../../components/Container/Container';
import LoadingIndicator from '../../components/Status/LoadingIndicator';
import TableLayout from '../../components/Table/TableLayout';
import { useAdmission } from '../../hooks/Admission/useAdmissions';
import { Pagination } from '@mui/material';
import { useState } from 'react';
import AddAdmissionModal from '../../components/Admission/AddAdmissionModal';
import AdmissionListItem from '../../components/Admission/AdmissionListItem';


const AdmissionListPage = () => {   
  const [page, setPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 

  const { data: admission, isSuccess, isLoading } = useAdmission(page);

 

  const totalPages = admission ? Math.ceil(admission.count / 20) : 0;

  const openAddModal = () => setIsModalOpen(true);
  const closeAddModal = () => setIsModalOpen(false); 

  return (
    <div>
      <Container>
        <div className="max-2xl:px-5 pb-10 text-primaryText">
          <div className="h-20 flex items-center justify-between">
            <div>
              <h1 className="text-lg">Admissions</h1>
            </div>
            <div className="text-sm flex gap-2">
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 border px-3 py-2 rounded bg-blue-500 text-white"
              >
                <PlusIcon />
                <h1>Add</h1>
              </button>
            </div>
          </div>
          <div>
            <TableLayout>
              <div className="py-4 grid grid-cols-12 bg-tableTop px-3 text-tableTopText">
                <div className="">
                  <h1>No</h1>
                </div>
                <div className="col-span-3">
                  <h1>Academic Year</h1>
                </div>
                <div className="col-span-2">
                  <h1>Start Date</h1>
                </div>
                <div className="col-span-2">
                  <h1>End Date</h1>
                </div>
                <div className="col-span-1"></div>
              </div>

              {isSuccess &&
                admission?.results?.map((admissionItem, index) => (
                  <AdmissionListItem
                    key={admissionItem.id}
                    admission={admissionItem}
                    index={index}
                  />
                ))}
              
            </TableLayout>

            {isLoading && <LoadingIndicator />}

            {isSuccess && totalPages > 1 && (
              <div className="flex justify-center my-6">
                <Pagination
                  count={totalPages} 
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  variant="outlined"
                  shape="rounded"
                />
              </div>
            )}
          </div>
        </div>

      
        <AddAdmissionModal isOpen={isModalOpen} onClose={closeAddModal}  />
      
      </Container>
    </div>
  );
};

export default AdmissionListPage;
