import { useEffect, useState } from 'react';
import Container from '../../components/Container/Container';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { LinkButton } from '../../components/Buttons/LinkButton';
import { DatePicker, Select } from 'antd';
import TableLayout from '../../components/Table/TableLayout';
import './AddAdmissionExamPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmissionSubjects } from '../../hooks/AdmissionSubject/useAdmissionSubject';
import {
  ExamDate,
  AdmissionData,
  useEditAdmissionExamById,
} from '../../hooks/Exam/useEditAdmissionExam';
import { useMajorById } from '../../hooks/Major/useMajorById';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor'; // Import useAdmissionMajor
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

type Region = 'ashgabat' | 'ahal' | 'balkan' | 'dashoguz' | 'lebap' | 'mary';

interface ExamDateFormState {
  region: Region;
  dates: (Dayjs | null)[];
}

const formatDate = (date: Dayjs | null): string => {
  if (!date) return '';
  return date.format('DD.MM.YYYY');
};

const EditAdmissionExamPage = () => {
  const { admission_id, major_id } = useParams<{
    admission_id: string;
    major_id: string;
  }>();
  const navigate = useNavigate();

  const { data: examData } = useMajorById(major_id); // Fetch exam data using major_id
  const { data: majorData } = useAdmissionMajor(1); // Fetch admission major data

  const {
    data: subjectsData,
    isLoading: isLoadingSubjects,
    error: errorSubjects,
  } = useAdmissionSubjects(1); // TODO: Fix hardcoded page number

  const {
    mutateAsync,
    isPending: isEditingExams,
    error: editExamError,
  } = useEditAdmissionExamById();

  const queryClient = useQueryClient();

  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [examDatesFormState, setExamDatesFormState] = useState<
    ExamDateFormState[]
  >([]);
  const [numSubjectColumns, setNumSubjectColumns] = useState<number>(0);
  const [selectedSubjectIdsPerColumn, setSelectedSubjectIdsPerColumn] =
    useState<number[]>([]);

  const regions: { name: string; value: Region }[] = [
    { name: 'Ashgabat', value: 'ashgabat' },
    { name: 'Ahal', value: 'ahal' },
    { name: 'Balkan', value: 'balkan' },
    { name: 'Dashoguz', value: 'dashoguz' },
    { name: 'Lebap', value: 'lebap' },
    { name: 'Lebap', value: 'lebap' },
    { name: 'Mary', value: 'mary' },
  ];

  // Initialize state from examData
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

      examData.exams.forEach((exam) => {
        exam.exam_dates.forEach((examDate) => {
          const subjectIndex = uniqueSubjects.indexOf(exam.subject[0].id);
          const regionIndex = initialExamDatesFormState.findIndex(
            (r) => r.region === examDate.region
          );

          if (regionIndex !== -1 && subjectIndex !== -1) {
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
    if (errorSubjects)
      toast.error(`Error loading subjects: ${errorSubjects.message}`);
  }, [errorSubjects]);

  useEffect(() => {
    if (editExamError) {
      console.error('Mutation Error:', editExamError);
      toast.error(
        `Error editing exam: ${
          (editExamError as any)?.response?.data?.detail ||
          (editExamError as any)?.message ||
          'An unexpected error occurred.'
        }`
      );
    }
  }, [editExamError]);

  const handleSave = async () => {
    if (!admission_id) {
      toast.error('Admission ID is missing.');
      return;
    }
    if (!major_id) {
      toast.error('Major ID is missing.');
      return;
    }
    if (selectedMajorId === null || selectedMajorId === 0) {
      toast.error('Please select a major.');
      return;
    }

    if (regions.length === 0) {
      toast.error('Region data not available.');
      return;
    }

    if (!subjectsData?.results || subjectsData.results.length === 0) {
      toast.error('Subject data not available.');
      return;
    }

    const payloadsToSend: AdmissionData[] = [];

    for (let i = 0; i < numSubjectColumns; i++) {
        const subjectId = selectedSubjectIdsPerColumn[i];

        if (!subjectId || subjectId === 0) {
            continue; // Skip if no subject is selected
        }

        const examDates: ExamDate[] = [];

        examDatesFormState.forEach((regionFormState) => {
            const date = regionFormState.dates[i];
            const formattedDate = formatDate(date);

            if (formattedDate) {
                examDates.push({
                    region: regionFormState.region,
                    date_of_exam: formattedDate,
                });
            }
        });

        if (examDates.length > 0) {
          payloadsToSend.push({
            admission_major: selectedMajorId,
            subject: [subjectId], // Wrap subjectId in an array
            exam_dates: examDates,
          });
        }
    }


    if (payloadsToSend.length === 0) {
      toast.error(
        'Please select at least one subject and dates for that subject in each selected region.'
      );
      return;
    }

    try {
      if (!major_id) {
        toast.error('Major ID is missing for mutation.');
        return;
      }

      await mutateAsync({ id: major_id, data: payloadsToSend[0] }); // Use mutateAsync from useEditAdmissionExamById
      toast.success('Exam details edited successfully!');
      queryClient.invalidateQueries({ queryKey: ['admission_exams'] });
      navigate(`/admissions/${admission_id}/exams`);
    } catch (error: any) {
      console.error('Error editing exam details:', error);
      toast.error(
        `Error editing exam details: ${
          error?.response?.data?.detail ||
          error?.message ||
          'An unexpected error occurred.'
        }`
      );
    }
  };

  const handleDateChange = (
    region: Region,
    subjectColumnIndex: number,
    date: Dayjs | null
  ) => {
    setExamDatesFormState((prevExamDates) =>
      prevExamDates.map((item) => {
        if (item.region === region) {
          const newDates = [...item.dates];
          newDates[subjectColumnIndex] = date;
          return { ...item, dates: newDates };
        }
        return item;
      })
    );
  };

  const handleSubjectSelectChange = (
    subjectColumnIndex: number,
    subjectId: number | string
  ) => {
    setSelectedSubjectIdsPerColumn((prev) => {
      const newSelectedSubjects = [...prev];
      newSelectedSubjects[subjectColumnIndex] = Number(subjectId);
      return newSelectedSubjects;
    });
  };

  const subjectOptions =
    subjectsData?.results?.map((subject) => ({
      value: subject.id,
      label: subject.name,
    })) || [];

  subjectOptions.unshift({ value: 0, label: 'Select Subject' });

  // Get the major name from admission major data
  const majorName = majorData?.results?.find((major) => major.id === Number(major_id))?.major || 'Select Major';
  return (
    <div>
      <Container>
        <div className="px-5 py-10">
          <h1 className="text-lg mb-5">Edit Admission Exam</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-formInputText">
              Major
            </label>
            <div
              className="w-96 h-auto rounded  text-gray-600 bg-white p-2 border border-gray-300"
              style={{ border: '1px solid #ccc' }}
            >
              {majorName}
            </div>
          </div>

          <TableLayout className="overflow-x-auto border-none">
            <table className="min-w-[850px] table-auto border-collapse border">
              <thead>
                <tr className="bg-tableTop text-tableTopText">
                  <th className="border px-4 py-2">Region</th>
                  {Array.from({ length: numSubjectColumns }).map((_, index) => {
                    const subject = subjectsData?.results?.find(
                      (sub) => sub.id === selectedSubjectIdsPerColumn[index]
                    );
                    const subjectName = subject ? subject.name : 'Select Subject';
                    return (
                      <th
                        key={`subject-header-${index}`}
                        className="border px-3 py-2 text-center"
                        style={{ textAlign: 'center', minWidth: '150px' }}
                      >
                        <Select
                          className="w-full rounded focus:outline-none text-gray-600 border-none bg-transparent custom-select"
                          onChange={(value) =>
                            handleSubjectSelectChange(index, value)
                          }
                          defaultValue={selectedSubjectIdsPerColumn[index]}
                          style={{ width: '100%', textAlign: 'center' }}
                          options={subjectOptions}
                        />
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
                        (_, subjectColumnIndex) => (
                          <td
                            key={`${regionData.value}-${subjectColumnIndex}`}
                            className="border px-4 py-2"
                            style={{ textAlign: 'center' }}
                          >
                            <DatePicker
                              onChange={(date) =>
                                handleDateChange(
                                  regionData.value,
                                  subjectColumnIndex,
                                  date
                                )
                              }
                              defaultValue={
                                regionFormState?.dates[subjectColumnIndex] ||
                                null
                              }
                              format="DD.MM.YYYY"
                              style={{
                                width: '100%',
                                border: 'none',
                                padding: '0',
                              }}
                              className="custom-datepicker"
                              placeholder="Select Date"
                            />
                          </td>
                        )
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableLayout>

          <div className="mt-6 flex justify-end gap-4">
            <LinkButton
              to={`/admissions/${admission_id}/exams`}
              type="button"
              variant="cancel"
            >
              Cancel
            </LinkButton>
            <button
              onClick={handleSave}
              disabled={
                isEditingExams ||
                isLoadingSubjects ||
                selectedMajorId === null ||
                selectedMajorId === 0
              }
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditingExams ? 'Editing...' : 'Edit'}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default EditAdmissionExamPage;