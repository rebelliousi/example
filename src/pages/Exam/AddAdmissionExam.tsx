import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  useAddAdmissionExam,
} from '../../hooks/Exam/useAddAdmissionExam';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { format } from 'date-fns';

type Region = 'ashgabat' | 'ahal' | 'balkan' | 'dashoguz' | 'lebap' | 'mary';

interface ExamDateFormState {
  region: Region;
  dates: (Dayjs | null)[];
}

interface RegionOption {
  name: string;
  value: Region;
}

const RegionRow = React.memo(({
  regionData,
  rowIndex,
  numSubjectColumns,
  regionFormState,
  handleDateChange
}: {
  regionData: RegionOption;
  rowIndex: number;
  numSubjectColumns: number;
  regionFormState?: ExamDateFormState;
  handleDateChange: (region: Region, subjectColumnIndex: number, date: Dayjs | null) => void;
}) => {
  return (
    <tr className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}>
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
              onChange={(date) => handleDateChange(regionData.value, subjectColumnIndex, date)}
              value={regionFormState?.dates[subjectColumnIndex] || null}
              format="DD.MM.YYYY"
              style={{ width: '100%', border: 'none', padding: '0' }}
              className="custom-datepicker"
              placeholder="Select Date"
            />
          </td>
        )
      )}
    </tr>
  );
});

const SubjectHeader = React.memo(({
  index,
  selectedSubjectIds,
  subjectOptions,
  handleSubjectSelectChange
}: {
  index: number;
  selectedSubjectIds: number[];
  subjectOptions: { value: number, label: string }[];
  handleSubjectSelectChange: (index: number, value: number | string) => void;
}) => {
  return (
    <th
      className="border px-3 py-2 text-center"
      style={{ textAlign: 'center', minWidth: '150px' }}
    >
      <Select
        className="w-full rounded focus:outline-none text-gray-600 border-none bg-transparent custom-select"
        onChange={(value) => handleSubjectSelectChange(index, value)}
        value={selectedSubjectIds[index]}
        style={{ width: '100%', textAlign: 'center' }}
        options={subjectOptions}
      />
    </th>
  );
});

const AddAdmissionExamPage = () => {
  const { admission_id } = useParams<{ admission_id: string }>();
  const navigate = useNavigate();

  const { data: majorData, isLoading: isLoadingMajor, error: errorMajor } = useAdmissionMajor(1);
  const { data: subjectsData, isLoading: isLoadingSubjects, error: errorSubjects } = useAdmissionSubjects(1);
  const { mutateAsync, isPending: isAddingExams, error: addExamError } = useAddAdmissionExam();

  const queryClient = useQueryClient();

  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [numSubjectColumns, setNumSubjectColumns] = useState<number>(3);
  const [selectedSubjectIdsPerColumn, setSelectedSubjectIdsPerColumn] = useState<number[]>(Array(3).fill(0));

  const regions: RegionOption[] = useMemo(() => [
    { name: 'Ashgabat', value: 'ashgabat' },
    { name: 'Ahal', value: 'ahal' },
    { name: 'Balkan', value: 'balkan' },
    { name: 'Dashoguz', value: 'dashoguz' },
    { name: 'Lebap', value: 'lebap' },
    { name: 'Mary', value: 'mary' },
  ], []);

  const [examDatesFormState, setExamDatesFormState] = useState<ExamDateFormState[]>(() =>
    regions.map(region => ({
      region: region.value,
      dates: Array(numSubjectColumns).fill(null) as (Dayjs | null)[],
    }))
  );

  useEffect(() => {
    setExamDatesFormState(prev =>
      prev.map(item => ({
        ...item,
        dates: Array(numSubjectColumns).fill(null).map((_, i) =>
          i < item.dates.length ? item.dates[i] : null
        ) as (Dayjs | null)[]
      }))
    );

    setSelectedSubjectIdsPerColumn(prev => {
      const newArray = [...prev];
      if (newArray.length < numSubjectColumns) {
        while (newArray.length < numSubjectColumns) {
          newArray.push(0);
        }
      } else if (newArray.length > numSubjectColumns) {
        newArray.length = numSubjectColumns;
      }
      return newArray;
    });
  }, [numSubjectColumns]);

  const subjectOptions = useMemo(() => {
    const options = subjectsData?.results?.map(subject => ({
      value: subject.id,
      label: subject.name,
    })) || [];
    options.unshift({ value: 0, label: 'Select Subject' });
    return options;
  }, [subjectsData]);

  useEffect(() => {
    if (errorMajor) toast.error(`Error loading majors: ${errorMajor.message}`);
    if (errorSubjects) toast.error(`Error loading subjects: ${errorSubjects.message}`);
    if (addExamError) {
      console.error('Mutation Error:', addExamError);
      toast.error(
        `Error adding exam: ${
          (addExamError as any)?.response?.data?.detail ||
          (addExamError as any)?.message ||
          'An unexpected error occurred.'
        }`
      );
    }
  }, [errorMajor, errorSubjects, addExamError]);

  const handleSave = useCallback(async () => {
    if (!admission_id) {
      toast.error('Admission ID is missing.');
      return;
    }
    if (selectedMajorId === null || selectedMajorId === 0) {
      toast.error('Please select a major.');
      return;
    }

    const payloadsToSend: AdmissionData[] = [];

    for (let i = 0; i < numSubjectColumns; i++) {
      const subjectId = selectedSubjectIdsPerColumn[i];
      if (!subjectId || subjectId === 0) continue;

      const examDates: ExamDate[] = [];
      examDatesFormState.forEach((regionFormState) => {
        const date = regionFormState.dates[i];
        if (date) {
          examDates.push({
            region: regionFormState.region,
            date_of_exam: format(date.toDate(), 'yyyy-MM-dd'),
          });
        }
      });

      if (examDates.length > 0) {
        payloadsToSend.push({
          admission_major: selectedMajorId,
          subject: [subjectId],
          exam_dates: examDates,
        });
      }
    }

    if (payloadsToSend.length === 0) {
      toast.error('Please select at least one subject and dates for that subject in each selected region.');
      return;
    }

    // Add this line to log the data before sending
    console.log("Payloads being sent to the backend:", JSON.stringify(payloadsToSend, null, 2));

    try {
      await mutateAsync(payloadsToSend);
      toast.success('Exam details added successfully!');
      queryClient.invalidateQueries({ queryKey: ['admission_exams'] });
      navigate(`/admissions/${admission_id}/exams`);
    } catch (error: any) {
      console.error('Error adding exam details:', error);
      toast.error(
        `Error adding exam details: ${
          error?.response?.data?.detail ||
          error?.message ||
          'An unexpected error occurred.'
        }`
      );
    }
  }, [admission_id, selectedMajorId, numSubjectColumns, selectedSubjectIdsPerColumn, examDatesFormState, mutateAsync, queryClient, navigate]);

  const handleMajorChange = useCallback((value: number | string) => {
    setSelectedMajorId(Number(value));
  }, []);

  const handleDateChange = useCallback((
    region: Region,
    subjectColumnIndex: number,
    date: Dayjs | null
  ) => {
    setExamDatesFormState(prev =>
      prev.map(item =>
        item.region === region
          ? {
            ...item,
            dates: item.dates.map((d, i) =>
              i === subjectColumnIndex ? date : d
            )
          }
          : item
      )
    );
  }, []);

  const handleSubjectSelectChange = useCallback((
    subjectColumnIndex: number,
    subjectId: number | string
  ) => {
    setSelectedSubjectIdsPerColumn(prev =>
      prev.map((id, i) =>
        i === subjectColumnIndex ? Number(subjectId) : id
      )
    );
  }, []);

  return (
    <div>
      <Container>
        <div className="px-5 py-10">
          <h1 className="text-lg mb-5">Add Admission Exam</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-formInputText">
              Major
            </label>
            <Select
              value={selectedMajorId === null ? 0 : selectedMajorId}
              onChange={handleMajorChange}
              className="w-96 h-auto rounded focus:outline-none text-gray-600 bg-white"
              loading={isLoadingMajor}
            >
              <Select.Option value={0}>Select a major</Select.Option>
              {majorData?.results?.map(m => (
                <Select.Option key={m.id} value={m.id}>
                  {m.major}
                </Select.Option>
              ))}
            </Select>
          </div>

          <TableLayout className="overflow-x-auto border-none">
            <table className="min-w-[850px] table-auto border-collapse border">
              <thead>
                <tr className="bg-tableTop text-tableTopText">
                  <th className="border px-4 py-2">Region</th>
                  {Array.from({ length: numSubjectColumns }).map((_, index) => (
                    <SubjectHeader
                      key={`subject-header-${index}`}
                      index={index}
                      selectedSubjectIds={selectedSubjectIdsPerColumn}
                      subjectOptions={subjectOptions}
                      handleSubjectSelectChange={handleSubjectSelectChange}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {regions.map((regionData, rowIndex) => {
                  const regionFormState = examDatesFormState.find(item => item.region === regionData.value);
                  return (
                    <RegionRow
                      key={regionData.value}
                      regionData={regionData}
                      rowIndex={rowIndex}
                      numSubjectColumns={numSubjectColumns}
                      regionFormState={regionFormState}
                      handleDateChange={handleDateChange}
                    />
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
                isAddingExams ||
                isLoadingMajor ||
                isLoadingSubjects ||
                selectedMajorId === null ||
                selectedMajorId === 0
              }
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingExams ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default React.memo(AddAdmissionExamPage);