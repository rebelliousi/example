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
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useMajorById, Exam } from '../../hooks/Major/useMajorById';
import { useEditAdmissionExamById } from '../../hooks/Exam/useEditAdmissionExam';

type Region = 'ashgabat' | 'ahal' | 'balkan' | 'dashoguz' | 'lebap' | 'mary';

interface ExamDateFormState {
    region: Region;
    dates: (Dayjs | null)[];
}

interface RegionOption {
    name: string;
    value: Region;
}

interface SubjectOption {
    value: number;
    label: string;
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
                            format="YYYY-MM-DD"
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
    subjectOptions: SubjectOption[];
    handleSubjectSelectChange: (index: number, value: number) => void;
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

const EditAdmissionExamPage = () => {
    const { major_id } = useParams<{ major_id: string }>();
    const navigate = useNavigate();

    const { data: majorData, isLoading: isLoadingMajor, error: errorMajor } = useAdmissionMajor(1);
    const { data: subjectsData, isLoading: isLoadingSubjects, error: errorSubjects } = useAdmissionSubjects(1);
    const { data: examData, isLoading: isExamDataLoading, error: examDataError } = useMajorById(major_id);
    const { mutateAsync, isPending: isEditingExams, error: editExamError } = useEditAdmissionExamById();

    const queryClient = useQueryClient();

    const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
    const [numSubjectColumns, setNumSubjectColumns] = useState<number>(1);
    const [selectedSubjectIdsPerColumn, setSelectedSubjectIdsPerColumn] = useState<number[]>([]);

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

    // Initialize form with existing exam data
    useEffect(() => {
        if (examData && examData.exams) {
            const uniqueSubjects = Array.from(
                new Set(examData.exams.map(exam => exam.subject[0]?.id).filter(Boolean))
            );
            setNumSubjectColumns(uniqueSubjects.length);
            setSelectedSubjectIdsPerColumn(uniqueSubjects);

            const initialExamDatesFormState = regions.map(region => ({
                region: region.value,
                dates: Array(uniqueSubjects.length).fill(null) as (Dayjs | null)[],
            }));

            examData.exams.forEach((exam, subjectIndex) => {
                exam.exam_dates?.forEach(examDate => {
                    if (!examDate) return;
                    const regionIndex = initialExamDatesFormState.findIndex(
                        r => r.region === examDate.region
                    );
                    if (regionIndex !== -1 && examDate.date_of_exam) {
                        // Parse the date in DD.MM.YYYY format
                        const date = dayjs(examDate.date_of_exam, 'DD.MM.YYYY');
                        initialExamDatesFormState[regionIndex].dates[subjectIndex] = date.isValid() ? date : null;
                    }
                });
            });

            setExamDatesFormState(initialExamDatesFormState);
            setSelectedMajorId(examData.id || null); // Use the ID from the major data
        }
    }, [examData, regions]);

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
        if (examDataError) toast.error(`Error loading exam data: ${examDataError.message}`);
        if (editExamError) {
            console.error('Mutation Error:', editExamError);

            if ((editExamError as any)?.response?.data) {
                const apiError = (editExamError as any).response.data;
                if (apiError.exams) {
                    apiError.exams.forEach((examError: any, examIndex: number) => {
                        if (examError.exam_dates) {
                            examError.exam_dates.forEach((dateError: any, dateIndex: number) => {
                                if (dateError.date_of_exam) {
                                    toast.error(`Subject ${examIndex + 1}, Date ${dateIndex + 1}: ${dateError.date_of_exam.join(', ')}`);
                                }
                            });
                        }
                    });
                } else {
                    toast.error(
                        `Error editing exam: ${
                        apiError.detail ||
                        apiError.message ||
                        'An unexpected error occurred.'
                        }`
                    );
                }
            } else {
                toast.error('An unexpected error occurred while editing the exam.');
            }
        }
    }, [errorMajor, errorSubjects, examDataError, editExamError]);

    const formatDateForAPI = useCallback((date: Dayjs | null): string | null => {
        if (!date) return null;
        try {
            return date.format('YYYY-MM-DD');
        } catch (error) {
            console.error('Date formatting error:', error);
            toast.error('Invalid date format. Please use YYYY-MM-DD format.');
            return null;
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (!major_id) {
            toast.error('Major ID is missing.');
            return;
        }
        if (selectedMajorId === null || selectedMajorId === 0) {
            toast.error('Please select a major.');
            return;
        }

        const examsToSend: any[] = [];

        for (let i = 0; i < numSubjectColumns; i++) {
            const subjectId = selectedSubjectIdsPerColumn[i];
            if (!subjectId || subjectId === 0) continue;

            const examDates: ExamDate[] = [];
            for (const regionFormState of examDatesFormState) {
                const date = regionFormState.dates[i];
                if (date) {
                    const formattedDate = formatDateForAPI(date);
                    if (formattedDate) {
                        examDates.push({
                            region: regionFormState.region,
                            date_of_exam: formattedDate,
                        });
                    }
                }
            }

            if (examDates.length > 0) {
                examsToSend.push({
                    admission_major: selectedMajorId,
                    subject: [subjectId], // Wrap subjectId in an array
                    exam_dates: examDates,
                });
            }
        }

        if (examsToSend.length === 0) {
            toast.error('Please select at least one subject and dates for that subject in each selected region.');
            return;
        }

        const payload = {
            exams: examsToSend,
        };

        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        try {
            await mutateAsync({ id: major_id, data: payload });
            toast.success('Exam details updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['admission_exams'] });
            navigate(-1);
        } catch (error) {
            console.error('Error updating exam details:', error);
        }
    }, [
        major_id,
        selectedMajorId,
        numSubjectColumns,
        selectedSubjectIdsPerColumn,
        examDatesFormState,
        mutateAsync,
        queryClient,
        navigate,
        formatDateForAPI
    ]);

    const handleMajorChange = useCallback((value: number) => {
        setSelectedMajorId(value);
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
        subjectId: number
    ) => {
        setSelectedSubjectIdsPerColumn(prev =>
            prev.map((id, i) =>
                i === subjectColumnIndex ? subjectId : id
            )
        );
    }, []);

    if (isExamDataLoading) {
        return <div className="flex justify-center items-center h-64">Loading exam data...</div>;
    }

    if (!examData) {
        return <div className="flex justify-center items-center h-64">Error: No exam data found.</div>;
    }

    return (
        <div>
            <Container>
                <div className="px-5 py-10">
                    <h1 className="text-lg mb-5">Edit Admission Exam</h1>

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
                            to={`/admissions/majors/${major_id}`}
                            type="button"
                            variant="cancel"
                        >
                            Cancel
                        </LinkButton>
                        <button
                            onClick={handleSave}
                            disabled={
                                isEditingExams ||
                                isLoadingMajor ||
                                isLoadingSubjects ||
                                isExamDataLoading ||
                                selectedMajorId === null ||
                                selectedMajorId === 0
                            }
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isEditingExams ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default React.memo(EditAdmissionExamPage);