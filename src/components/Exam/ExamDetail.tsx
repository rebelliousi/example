import { useEffect, useState } from 'react';
import Container from '../../components/Container/Container';
import { toast } from 'react-hot-toast';

import TableLayout from '../../components/Table/TableLayout';
import './ExamDetail.css';
import { useParams } from 'react-router-dom';
import { useAdmissionSubjects } from '../../hooks/AdmissionSubject/useAdmissionSubject';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useMajorById } from '../../hooks/Major/useMajorById';

type Region = 'ashgabat' | 'ahal' | 'balkan' | 'dashoguz' | 'lebap' | 'mary';

interface ExamDateFormState {
  region: Region;
  dates: (Dayjs | null)[];
}

const ExamDetailPage = () => {
  const { major_id } = useParams<{
    major_id: string;
  }>();

  const {
    data: majorData,
    error: errorMajor,
  } = useAdmissionMajor(1);

  const { data: examData } = useMajorById(major_id);

  const {
    data: subjectsData,
    error: errorSubjects,
  } = useAdmissionSubjects(1);

  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [examDatesFormState, setExamDatesFormState] = useState<
    ExamDateFormState[]
  >([]);
  const [numSubjectColumns, setNumSubjectColumns] = useState<number>(1);
  const [selectedSubjectIdsPerColumn, setSelectedSubjectIdsPerColumn] =
    useState<number[]>([]);

  const regions: { name: string; value: Region }[] = [
    { name: 'Ashgabat', value: 'ashgabat' },
    { name: 'Ahal', value: 'ahal' },
    { name: 'Balkan', value: 'balkan' },
    { name: 'Dashoguz', value: 'dashoguz' },
    { name: 'Lebap', value: 'lebap' },
    { name: 'Mary', value: 'mary' },
  ];

  useEffect(() => {
    if (major_id && examData?.exams) {
      const uniqueSubjects = Array.from(
        new Set(examData.exams.map((exam) => exam.subject[0].id))
      );
      setNumSubjectColumns(uniqueSubjects.length);

      setSelectedSubjectIdsPerColumn(uniqueSubjects);

      const initialExamDatesFormState = regions.map((region) => ({
        region: region.value as Region,
        dates: Array(uniqueSubjects.length).fill(null) as (Dayjs | null)[],
      }));

      examData.exams.forEach((exam, subjectIndex) => {
        exam.exam_dates.forEach((examDate) => {
          const regionIndex = initialExamDatesFormState.findIndex(
            (r) => r.region === examDate.region
          );
          if (regionIndex !== -1) {
            initialExamDatesFormState[regionIndex].dates[subjectIndex] = dayjs(
              examDate.date_of_exam,
              'DD.MM.YYYY'
            );
          }
        });
      });
      setExamDatesFormState(initialExamDatesFormState);
      setSelectedMajorId(Number(major_id));
    }
  }, [major_id, examData, regions]);

  useEffect(() => {
    if (errorMajor) toast.error(`Error loading majors: ${errorMajor.message}`);
    if (errorSubjects)
      toast.error(`Error loading subjects: ${errorSubjects.message}`);
  }, [errorMajor, errorSubjects]);

  const formatDate = (date?: Dayjs | null): string => {
    return date ? date.format('DD.MM.YYYY') : '-';
  };

  return (
    <div>
      <Container>
        <div className="px-5 py-10">
          <h1 className="text-lg mb-5">Exam Detail</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-formInputText">
              Major
            </label>
            <div
              className="w-96 h-auto rounded  text-gray-600 bg-white p-2 border border-gray-300" // Added border here
              style={{ border: '1px solid #ccc' }}
            >
              {majorData?.results.find((m) => m.id === selectedMajorId)?.major ||
                'Select Major'}
            </div>
          </div>

          <TableLayout className="overflow-x-auto border-none">
            <table className="min-w-[850px] table-auto border-collapse border">
              <thead>
                <tr className="bg-tableTop text-tableTopText">
                  <th className="border px-4 py-2">Region</th>
                  {Array.from({ length: numSubjectColumns }).map((_, index) => {
                    const subject = examData?.exams.find(
                      (exam) =>
                        exam.subject[0].id ===
                        selectedSubjectIdsPerColumn[index]
                    )?.subject[0];
                    const subjectName = subject ? subject.name : 'Select Subject';
                    return (
                      <th
                        key={`subject-header-${index}`}
                        className="border px-3 py-2 text-center"
                        style={{ textAlign: 'center', minWidth: '150px' }}
                      >
                        {subjectName}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {regions.map((regionData, rowIndex) => {
                  const regionFormState = examDatesFormState.find(
                    (item) => item.region === regionData.value
                  );

                  return (
                    <tr
                      key={regionData.value}
                      className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}
                    >
                      <td className="border text-center px-4 py-2">
                        {regionData.name}
                      </td>
                      {Array.from({ length: numSubjectColumns }).map(
                        (subject, subjectColumnIndex) => {
                          const date =
                            regionFormState?.dates[subjectColumnIndex];
                          return (
                            <td
                              key={`${regionData.value}-${subjectColumnIndex}`}
                              className="border px-4 py-2 text-center"
                            >
                              {formatDate(date)}
                            </td>
                          );
                        }
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableLayout>
        </div>
      </Container>
    </div>
  );
};

export default ExamDetailPage;