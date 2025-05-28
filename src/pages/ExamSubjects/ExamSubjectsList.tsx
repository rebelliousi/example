import PlusIcon from '../../assets/icons/PlusIcon';
import Container from '../../components/Container/Container';
import LoadingIndicator from '../../components/Status/LoadingIndicator';
import TableLayout from '../../components/Table/TableLayout';
import { Pagination } from '@mui/material';
import { useState } from 'react';
import { useExamSubjects } from '../../hooks/ExamSubjects/useExamSubjects';
import ExamSUbjectsListItem from '../../components/ExamSubjects/ExamSubjectsListItem';
import AddExamSubjectModal from '../../components/ExamSubjects/AddExamSubjetModal';


const ExamSubjectsPage = () => {
  const [page, setPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const openAddModal = () => setIsModalOpen(true);
  const closeAddModal = () => setIsModalOpen(false); 


  const { data: examSubjects, isSuccess, isLoading } = useExamSubjects(page);  

  const totalPages = examSubjects ? Math.ceil(examSubjects.count / 20) : 0;


  return (
    <div>
      <Container>
        <div className="max-2xl:px-5 pb-10 text-primaryText">
          <div className="h-20 flex items-center justify-between">
            <div>
              <h1 className="text-lg">Exam Subjects</h1>
            </div>
            <div className="text-sm flex gap-2">
              <button
              
                className="flex items-center gap-2 border px-3 py-2 rounded bg-blue-500 text-white"
                onClick={openAddModal} >
                
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
                  <h1>Name</h1>
                </div>
              
                <div className="col-span-4">  </div>
              </div>

              {isSuccess &&
                examSubjects?.results?.map((examSubject, index) => (
                  <ExamSUbjectsListItem 
                    key={examSubject.id}
                    examSubjects={examSubject}
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

        <AddExamSubjectModal isOpen={isModalOpen} onClose={closeAddModal}  />
      </Container>
    </div>
  );
};

export default ExamSubjectsPage;