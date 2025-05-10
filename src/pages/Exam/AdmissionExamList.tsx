import PlusIcon from '../../assets/icons/PlusIcon';
import LoadingIndicator from '../../components/Status/LoadingIndicator';
import TableLayout from '../../components/Table/TableLayout';
import { Link, useParams } from 'react-router-dom';

import AdmissionExamListItem from '../../components/Exam/ExamListItem';
import { useAdmissionExams } from '../../hooks/Exam/useAdmissionExams';


const AdmissionExamListPage = () => {
  const { admission_id } = useParams();

  const {
    data: admission,
    isSuccess,
    isLoading,
  } = useAdmissionExams(Number(admission_id));

  return (
    <div>
      <div className="flex justify-start mb-4">
        <Link  to={`/admissions/${admission_id}/exams/add`}
          className="bg-blue-500 w-[100px] text-sm text-white px-2 py-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
        >
          <PlusIcon className="mr-2" />
          <span>Add</span>
        </Link>
      </div>

      <TableLayout>
        <div className="py-4 grid grid-cols-12 bg-tableTop px-3 text-tableTopText">
          <div className="col-span-1">No</div>
          <div className="col-span-3">Major Name</div>
          <div className="col-span-2">Exam1</div>
          <div className="col-span-2">Exam2</div>
          <div className="col-span-2">Exam3</div>
         
          <div className="col-span-4"></div>
        </div>

        {isSuccess &&
                admission?.majors?.map((exam, index) => (
                  <AdmissionExamListItem
                    key={exam.id}
                    exam={exam}
                    index={index}
                  />
                ))}
              
      </TableLayout>

      {isLoading && <LoadingIndicator />}
    </div>
  );
};

export default AdmissionExamListPage;
