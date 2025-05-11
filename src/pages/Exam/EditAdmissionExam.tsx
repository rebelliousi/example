import { useEffect, useState } from 'react';
import { useRegions } from '../../hooks/Regions/useRegions';
import Container from '../../components/Container/Container';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { LinkButton } from '../../components/Buttons/LinkButton';
import { DatePicker, Select } from "antd";
import TableLayout from '../../components/Table/TableLayout';
import './AddAdmissionExamPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmissionSubjects } from '../../hooks/AdmissionSubject/useAdmissionSubject';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';
import dayjs, { Dayjs } from 'dayjs';
import { useAdmissionExamById } from '../../hooks/Exam/useAdmissionExamById';
import { ExamDate, useEditAdmissionExamById } from '../../hooks/Exam/useEditAdmissionExam';

interface ExamDateFormState {
  regionId: number;
  dates: (Dayjs | null)[];
}

const formatDate = (date: Dayjs | null): string => {
  if (!date) return "";
  return date.format('DD.MM.YYYY');
};

const EditAdmissionExamPage = () => {
  const { admission_id, exam_id } = useParams<{ admission_id: string; exam_id: string }>();
  console.log(exam_id)

  const navigate = useNavigate();

  // Fetch existing exam data
  const { data: existingExam, isLoading: isLoadingExisting, error: errorExisting } = useAdmissionExamById(exam_id);

  const { data: majorData, isLoading: isLoadingMajor, error: errorMajor } = useAdmissionMajor(1);
  const { data: subjectsData, isLoading: isLoadingSubjects, error: errorSubjects } = useAdmissionSubjects(1);
  const { data: regionsData, isLoading: isLoadingRegions, error: errorRegions } = useRegions();

  const { mutateAsync, isPending: isUpdating } = useEditAdmissionExamById();
  const queryClient = useQueryClient();

  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [examDatesFormState, setExamDatesFormState] = useState<ExamDateFormState[]>([]);
  const [numSubjectColumns, setNumSubjectColumns] = useState<number>(3);
  const [selectedSubjectIdsPerColumn, setSelectedSubjectIdsPerColumn] = useState<number[]>(Array(3).fill(0));

  useEffect(() => {
    if (existingExam && majorData && subjectsData && regionsData) {
      setSelectedMajorId(existingExam.admission_major);

      const examDatesBySubject: Record<number, ExamDate[]> = {};
      existingExam.exam_dates.forEach(ed => {
        if (!examDatesBySubject[ed.date_of_exam]) {
          examDatesBySubject[ed.date_of_exam

          ] = [];
        }
        examDatesBySubject[ed.id].push(ed);
      });

      const uniqueSubjects = Object.keys(examDatesBySubject).map(Number);
      setNumSubjectColumns(uniqueSubjects.length);
      setSelectedSubjectIdsPerColumn(uniqueSubjects);

      const newFormState = regionsData.results.map(region => {
        const dates = uniqueSubjects.map(subjectId => {
          const examDateForRegion = examDatesBySubject[subjectId]?.find(ed => ed.region === region.id);
          return examDateForRegion ? dayjs(examDateForRegion.date_of_exam, 'DD.MM.YYYY') : null;
        });

        return {
          regionId: region.id,
          dates: dates
        };
      });

      setExamDatesFormState(newFormState);
    }
  }, [existingExam, majorData, subjectsData, regionsData]);

  useEffect(() => {
    if (regionsData?.results && !isLoadingExisting && !existingExam) {
      setExamDatesFormState(regionsData.results.map(region => ({
        regionId: region.id,
        dates: Array<Dayjs | null>(numSubjectColumns).fill(null)
      })));
    }
  }, [regionsData, numSubjectColumns, isLoadingExisting, existingExam]);

  useEffect(() => {
    if (errorMajor) toast.error(`Error loading majors: ${errorMajor.message}`);
    if (errorSubjects) toast.error(`Error loading subjects: ${errorSubjects.message}`);
    if (errorRegions) toast.error(`Error loading regions: ${errorRegions.message}`);
    if (errorExisting) toast.error(`Error loading exam data: ${errorExisting.message}`);
  }, [errorMajor, errorSubjects, errorRegions, errorExisting]);

  const handleMajorChange = (value: number | string) => {
    setSelectedMajorId(Number(value));
  };

  const handleDateChange = (regionId: number, subjectColumnIndex: number, date: Dayjs | null) => {
    setExamDatesFormState(prevExamDates =>
      prevExamDates.map(item => {
        if (item.regionId === regionId) {
          const newDates = [...item.dates];
          newDates[subjectColumnIndex] = date;
          return { ...item, dates: newDates };
        }
        return item;
      })
    );
  };

  const handleSubjectSelectChange = (subjectColumnIndex: number, subjectId: number | string) => {
    setSelectedSubjectIdsPerColumn(prev => {
      const newSelectedSubjects = [...prev];
      newSelectedSubjects[subjectColumnIndex] = Number(subjectId);
      return newSelectedSubjects;
    });
  };

  const handleAddSubjectColumn = () => {
    setNumSubjectColumns(prev => prev + 1);
    setSelectedSubjectIdsPerColumn(prev => [...prev, 0]);
    setExamDatesFormState(prev =>
      prev.map(item => ({
        ...item,
        dates: [...item.dates, null]
      }))
    );
  };

  const handleRemoveSubjectColumn = (index: number) => {
    if (numSubjectColumns <= 1) {
      toast.error('At least one subject is required');
      return;
    }

    setNumSubjectColumns(prev => prev - 1);
    setSelectedSubjectIdsPerColumn(prev => prev.filter((_, i) => i !== index));
    setExamDatesFormState(prev =>
      prev.map(item => ({
        ...item,
        dates: item.dates.filter((_, i) => i !== index)
      }))
    );
  };

  const handleSave = async () => {
    if (selectedMajorId === null || selectedMajorId === 0) {
      toast.error('Please select a major.');
      return;
    }

    if (!regionsData?.results || regionsData.results.length === 0) {
      toast.error('Region data not available.');
      return;
    }

    if (!subjectsData?.results || subjectsData.results.length === 0) {
      toast.error('Subject data not available.');
      return;
    }

    const payloadsToSend: {
      admission_major: number;
      subject: number;
      exam_dates: ExamDate[];
    }[] = [];
    let hasAnyValidData = false;

    for (let i = 0; i < numSubjectColumns; i++) {
      const subjectIdForColumn = selectedSubjectIdsPerColumn[i];

      if (!subjectIdForColumn || subjectIdForColumn === 0) {
        continue;
      }

      const examDatesForThisSubject: ExamDate[] = [];
      let hasDatesForThisSubject = false;

      examDatesFormState.forEach(regionFormState => {
        const dateForThisSubjectColumn = regionFormState.dates[i];
        if (dateForThisSubjectColumn) {
          const formattedDate = formatDate(dateForThisSubjectColumn);
          if (formattedDate) {
            examDatesForThisSubject.push({
              region: regionFormState.regionId,
              date_of_exam: formattedDate,
            });
            hasDatesForThisSubject = true;
          }
        }
      });

      if (hasDatesForThisSubject) {
        payloadsToSend.push({
          admission_major: selectedMajorId,
          subject: subjectIdForColumn,
          exam_dates: examDatesForThisSubject,
        });
        hasAnyValidData = true;
      }
    }

    if (!hasAnyValidData) {
      toast.error('Please select a major, at least one subject, and dates for that subject in each selected region.');
      return;
    }

    try {
      // In edit mode, we'll update each subject's exam dates one by one
      // Note: This might need adjustment based on your API's expectations
      for (const payload of payloadsToSend) {
        await mutateAsync({
          id: exam_id, // exam_id'yi doğru kullanın
          data: payload,
        });
      }

      toast.success('Admission exam updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admission_exams'] });
      navigate(-1); // Go back to previous page
    } catch (error: any) {

      const errorMessage = error?.response?.data?.message || error.message || 'Failed to update exam';
      toast.error(`Error updating exam: ${errorMessage}`);
    }
  };

  const subjectOptions = subjectsData?.results?.map(subject => ({
    value: subject.id,
    label: subject.name,
  })) || [];

  subjectOptions.unshift({ value: 0, label: 'Select Subject' });

  const canRenderTable = majorData?.results && majorData.results.length > 0 &&
    subjectsData?.results && subjectsData.results.length > 1 &&
    regionsData?.results && regionsData.results.length > 0 &&
    !isLoadingExisting;

  return (
    <div>
      <Container>
        <div className="px-5 py-10">
          <h1 className="text-lg mb-5">Edit Admission Exam</h1>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-formInputText">Major</label>
      
              <Select
                value={selectedMajorId === null ? 0 : selectedMajorId}
                onChange={handleMajorChange}
                className="w-96 h-auto rounded focus:outline-none text-gray-600 bg-white"
              >
                <Select.Option value={0}>Select a major</Select.Option>
                {majorData?.results.map(m => (
                  <Select.Option key={m.id} value={m.id}>{m.major}</Select.Option>
                ))}
              </Select>
          
          </div>

          
            <>
              <TableLayout className="overflow-x-auto border-none">
                <table className="min-w-[850px] table-auto border-collapse border">
                  <thead>
                    <tr className="bg-tableTop text-tableTopText">
                      <th className="border px-4 py-2">Region</th>
                      {Array.from({ length: numSubjectColumns }).map((_, index) => (
                        <th key={`subject-header-${index}`} className="border px-3 py-2 text-center" style={{ minWidth: '150px' }}>
                          <div className="flex items-center justify-between">
                            <Select
                              className="flex-1 rounded focus:outline-none text-gray-600 border-none bg-transparent custom-select"
                              onChange={(value) => handleSubjectSelectChange(index, value)}
                              value={selectedSubjectIdsPerColumn[index] || 0}
                              options={subjectOptions}
                            />
                           
                          </div>
                        </th>
                      ))}

                    </tr>
                  </thead>
                  <tbody>
                    {regionsData?.results.map((region) => {
                      const regionFormState = examDatesFormState.find(item => item.regionId === region.id);

                      return (
                        <tr key={region.id} >
                          <td className="border text-center px-4 py-2">{region.name}</td>
                          {Array.from({ length: numSubjectColumns }).map((_, subjectColumnIndex) => (
                            <td key={`${region.id}-${subjectColumnIndex}`} className="border px-4 py-2" style={{ textAlign: 'center' }}>
                              <DatePicker
                                onChange={(date) => handleDateChange(region.id, subjectColumnIndex, date)}
                                value={regionFormState?.dates[subjectColumnIndex] || null}
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
                          ))}

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </TableLayout>

              <div className="mt-6 flex justify-end gap-4">
                <LinkButton to={`/admissions/${selectedMajorId}/exams`} type="button" variant="cancel">
                  Cancel
                </LinkButton>
                <button
                  onClick={handleSave}
                  disabled={isUpdating || isLoadingMajor || isLoadingSubjects || isLoadingRegions || !canRenderTable || selectedMajorId === null || selectedMajorId === 0}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </>
        
        </div>
      </Container>
    </div>
  );
};

export default EditAdmissionExamPage;