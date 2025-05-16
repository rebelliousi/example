import { useEffect, useState } from 'react';
import Container from '../../components/Container/Container';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { LinkButton } from '../../components/Buttons/LinkButton';
import { DatePicker, Select } from "antd";
import TableLayout from '../../components/Table/TableLayout';
import './AddAdmissionExamPage.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmissionSubjects } from '../../hooks/AdmissionSubject/useAdmissionSubject';
import { ExamDate, AdmissionData, useAddAdmissionExam } from '../../hooks/Exam/useAddAdmissionExam';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';
import dayjs, { Dayjs } from 'dayjs';

// Enum tanımı (string literal türü)
type Region = "ashgabat" | "ahal" | "balkan" | "dashoguz" | "lebap" | "mary";

interface ExamDateFormState {
    region: Region; // regionId yerine enum string
    dates: (Dayjs | null)[];
}

const formatDate = (date: Dayjs | null): string => {
    if (!date) return "";
    return date.format('DD.MM.YYYY');
};

const AddAdmissionExamPage = () => {
    const { admission_id } = useParams();
    const navigate = useNavigate();

    // Veri çekme hook'ları
    const { data: majorData, isLoading: isLoadingMajor, error: errorMajor } = useAdmissionMajor(1);
    const { data: subjectsData, isLoading: isLoadingSubjects, error: errorSubjects } = useAdmissionSubjects(1);
    // useRegions kaldırıldı

    // Mutation hook'u
    const { mutateAsync, isPending: isAddingExams, error: addExamError } = useAddAdmissionExam();

    // Query client
    const queryClient = useQueryClient();

    // State'ler
    const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
    const [examDatesFormState, setExamDatesFormState] = useState<ExamDateFormState[]>([]);
    const [numSubjectColumns, setNumSubjectColumns] = useState<number>(3);
    const [selectedSubjectIdsPerColumn, setSelectedSubjectIdsPerColumn] = useState<number[]>(Array(numSubjectColumns).fill(0));

    // Bölgeler (Sabit, artık API'den gelmiyor)
    const regions: { name: string; value: Region }[] = [
        { name: "Ashgabat", value: "ashgabat" },
        { name: "Ahal", value: "ahal" },
        { name: "Balkan", value: "balkan" },
        { name: "Dashoguz", value: "dashoguz" },
        { name: "Lebap", value: "lebap" },
        { name: "Mary", value: "mary" },
    ];

    // useEffect hook'ları (artık useRegions'a bağımlı değil)
    useEffect(() => {
        // regionId yerine region enum string'ini kullan
        setExamDatesFormState(regions.map(region => ({
            region: region.value,
            dates: Array<Dayjs | null>(numSubjectColumns).fill(null)
        })));

        setSelectedSubjectIdsPerColumn(prev => {
            const newSubjects = Array(numSubjectColumns).fill(0);
            prev.slice(0, numSubjectColumns).forEach((id, index) => {
                if (index < numSubjectColumns) {
                    newSubjects[index] = id;
                }
            });
            return newSubjects;
        });

    }, [numSubjectColumns]); // regions dependency'si kaldırıldı

    // Hata mesajlarını göster (useRegions hatası kaldırıldı)
    useEffect(() => {
        if (errorMajor) toast.error(`Error loading majors: ${errorMajor.message}`);
        if (errorSubjects) toast.error(`Error loading subjects: ${errorSubjects.message}`);
        //if (errorRegions) toast.error(`Error loading regions: ${errorRegions.message}`); useRegions kaldırıldığı için gerek yok
    }, [errorMajor, errorSubjects]); // errorRegions kaldırıldı

    // Mutation hatasını göster
    useEffect(() => {
        if (addExamError) {
            console.error("Mutation Error:", addExamError);
            toast.error(`Error adding exam: ${addExamError.message}`); // Display mutation error
        }
    }, [addExamError]);

    // Kaydetme işlemini gerçekleştir
    const handleSave = async () => {
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

        const examDatesBySubject: { [subjectId: number]: ExamDate[] } = {};

        examDatesFormState.forEach(regionFormState => {
            for (let i = 0; i < numSubjectColumns; i++) {
                const subjectId = selectedSubjectIdsPerColumn[i];
                const date = regionFormState.dates[i];
                const formattedDate = formatDate(date);

                if (subjectId && formattedDate) {
                    if (!examDatesBySubject[subjectId]) {
                        examDatesBySubject[subjectId] = [];
                    }
                    examDatesBySubject[subjectId].push({
                        region: regionFormState.region,
                        date_of_exam: formattedDate,
                        subject: subjectId
                    });
                }
            }
        });

        const payloadsToSend: AdmissionData[] = [];
        for (const subjectId in examDatesBySubject) {
            if (examDatesBySubject.hasOwnProperty(subjectId)) {
                const examDates = examDatesBySubject[subjectId];
                if (examDates.length > 0) {
                    // Modify the examDates array to include the subject in each ExamDate object
                    const updatedExamDates = examDates.map(examDate => ({
                        ...examDate,
                        subject: parseInt(subjectId) // Add subject to each ExamDate
                    }));

                    payloadsToSend.push({
                        admission_major: selectedMajorId!,
                        exam_dates: updatedExamDates,
                    });
                }
            }
        }
        if (payloadsToSend.length === 0) {
            toast.error('Please select at least one subject, and dates for that subject in each selected region.');
            return;
        }


        try {
            await Promise.all(payloadsToSend.map(payload => mutateAsync(payload)));
            toast.success('Exam details added successfully!');
            queryClient.invalidateQueries({ queryKey: ['admission_exams'] });
            navigate(`/admissions/${admission_id}/exams`);
        } catch (error: any) {
            console.error("Error adding exam details:", error);
            toast.error(`Error adding exam details: ${error?.message || "An unexpected error occurred."}`);
        }

    };

    // Bölüm seçimini güncelle
    const handleMajorChange = (value: number | string) => {
        setSelectedMajorId(Number(value));
    };
   // Tarih seçimini güncelle
    const handleDateChange = (region: Region, subjectColumnIndex: number, date: Dayjs | null) => {
        setExamDatesFormState(prevExamDates =>
            prevExamDates.map(item => {
                if (item.region === region) { // Karşılaştırma region enum string'i ile
                    const newDates = [...item.dates];
                    newDates[subjectColumnIndex] = date;
                    return { ...item, dates: newDates };
                }
                return item;
            })
        );
    };

    // Ders seçimini güncelle
    const handleSubjectSelectChange = (subjectColumnIndex: number, subjectId: number | string) => {
        setSelectedSubjectIdsPerColumn(prev => {
            const newSelectedSubjects = [...prev];
            newSelectedSubjects[subjectColumnIndex] = Number(subjectId);
            console.log(`Subject column ${subjectColumnIndex + 1} selected ID:`, Number(subjectId));
            return newSelectedSubjects;
        });
    };

    // Ders seçim seçeneklerini oluştur
    const subjectOptions = subjectsData?.results?.map(subject => ({
        value: subject.id,
        label: subject.name,
    })) || [];

    subjectOptions.unshift({ value: 0, label: 'Select Subject' });

    return (
        <div>
            <Container>
                <div className="px-5 py-10">
                    <h1 className="text-lg mb-5">Add Admission Exam</h1>

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

                    <TableLayout className="overflow-x-auto border-none">
                        <table className="min-w-[850px] table-auto border-collapse border">
                            <thead>
                                <tr className="bg-tableTop text-tableTopText">
                                    <th className="border px-4 py-2">Region</th>
                                    {Array.from({ length: numSubjectColumns }).map((_, index) => (
                                        <th key={`subject-header-${index}`} className="border px-3 py-2 text-center" style={{ textAlign: 'center', minWidth: '150px' }}>
                                            <Select
                                                className="w-full rounded focus:outline-none text-gray-600 border-none bg-transparent custom-select"
                                                onChange={(value) => handleSubjectSelectChange(index, value)}
                                                value={selectedSubjectIdsPerColumn[index]}
                                                style={{ width: '100%', textAlign: 'center' }}
                                                options={subjectOptions}
                                            />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>

                                {regions.map((regionData, rowIndex) => {
                                    // Form State'i Bul
                                    const regionFormState = examDatesFormState.find(item => item.region === regionData.value);

                                    return (
                                        <tr key={regionData.value} className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}>
                                            <td className="border text-center px-4 py-2">{regionData.name}</td>
                                            {Array.from({ length: numSubjectColumns }).map((_, subjectColumnIndex) => (
                                                <td key={`${regionData.value}-${subjectColumnIndex}`} className="border px-4 py-2" style={{ textAlign: 'center' }}>
                                                    <DatePicker
                                                        onChange={(date) => handleDateChange(regionData.value, subjectColumnIndex, date)}
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
                        <LinkButton to={`/admissions/${admission_id}/exams`} type="button" variant="cancel">
                            Cancel
                        </LinkButton>
                        <button
                            onClick={handleSave}
                            disabled={isAddingExams || isLoadingMajor || isLoadingSubjects || selectedMajorId === null || selectedMajorId === 0}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAddingExams ? 'Adding...' : 'Save'}
                        </button>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default AddAdmissionExamPage;