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

import { ExamDate, AdmissionData, useAddAdmissionExam } from '../../hooks/Exam/useAddAdmissionExam';
import { useAdmissionMajor } from '../../hooks/Major/useAdmissionMajor';
import dayjs, { Dayjs } from 'dayjs';

interface ExamDateFormState {
    regionId: number;
    dates: (Dayjs | null)[]; 
}

const formatDate = (date: Dayjs | null): string => {
    if (!date) return "";
   
    return date.format('DD.MM.YYYY');
};

const AddAdmissionExamPage = () => {
    const { admission_id } = useParams(); 
    const navigate = useNavigate();


    const { data: majorData, isLoading: isLoadingMajor, error: errorMajor } = useAdmissionMajor(1); 
    const { data: subjectsData, isLoading: isLoadingSubjects, error: errorSubjects } = useAdmissionSubjects(1); 
    const { data: regionsData, isLoading: isLoadingRegions, error: errorRegions } = useRegions(); 

    const { mutateAsync, isPending: isAddingExams, error: addExamError } = useAddAdmissionExam();

    const queryClient = useQueryClient(); 


    const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);

 
    const [examDatesFormState, setExamDatesFormState] = useState<ExamDateFormState[]>([]);

    const [numSubjectColumns, setNumSubjectColumns] = useState<number>(3); 


    const [selectedSubjectIdsPerColumn, setSelectedSubjectIdsPerColumn] = useState<number[]>(Array(numSubjectColumns).fill(0));

 
    useEffect(() => {
        if (regionsData?.results) {
         
            setExamDatesFormState(regionsData.results.map(region => ({
                regionId: region.id,
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
        }
    }, [regionsData, numSubjectColumns]); 


    useEffect(() => {
        if (errorMajor) toast.error(`Error loading majors: ${errorMajor.message}`);
        if (errorSubjects) toast.error(`Error loading subjects: ${errorSubjects.message}`);
        if (errorRegions) toast.error(`Error loading regions: ${errorRegions.message}`);
    }, [errorMajor, errorSubjects, errorRegions]);

  
     useEffect(() => {
         if(addExamError) {
          
             console.error("Mutation Error:", addExamError);
         }
     }, [addExamError]);


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
            console.log(`Subject column ${subjectColumnIndex + 1} selected ID:`, Number(subjectId));
            return newSelectedSubjects;
        });
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

        const payloadsToSend: AdmissionData[] = [];
        let hasAnyValidData = false; 

        for (let i = 0; i < numSubjectColumns; i++) {
            const subjectIdForColumn = selectedSubjectIdsPerColumn[i];

            if (!subjectIdForColumn || subjectIdForColumn === 0) {
                 console.log(`Skipping column ${i + 1}: No subject selected.`);
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
              
                 const payloadForSubject: AdmissionData = {
                    admission_major: selectedMajorId!, 
                    subject: subjectIdForColumn, 
                    exam_dates: examDatesForThisSubject, 
                 };
                 payloadsToSend.push(payloadForSubject); 
                 hasAnyValidData = true; 
                 console.log(`Constructed payload for subject ${subjectIdForColumn}:`, payloadForSubject);

            } else {
     
                console.log(`Skipping column ${i + 1} (Subject ID: ${subjectIdForColumn}): No valid dates selected.`);
            }
        }

        if (!hasAnyValidData) {
            toast.error('Please select a major, at least one subject, and dates for that subject in each selected region.');
            return;
        }

       
        let successCount = 0;
        let failCount = 0;

   
        for (const payload of payloadsToSend) {
            try {
                await mutateAsync(payload);
                successCount++;
                console.log(`Successfully added exam dates for subject ${payload.subject}`);
     
            } catch (error: any) {
                failCount++;
                console.error(`Failed to add exam dates for subject ${payload.subject}:`, error);
            
                const errorMessage = error?.response?.data?.message || error.message || `Failed for subject ID ${payload.subject}`;
                toast.error(`Error adding exam details for subject ID ${payload.subject}: ${errorMessage}`);
            }
        }

  
        if (successCount > 0) {
            toast.success(`${successCount} subject(s) exam details added successfully!`);
    
            queryClient.invalidateQueries({ queryKey: ['admission_exams'] });
         
            navigate(`/admissions/${admission_id}/exams`);
        } else {
          
             if(failCount > 0 && failCount === payloadsToSend.length) { 
                 toast.error('All attempts to add exam details failed. See specific errors above.');
             }
        }
    };

    const subjectOptions = subjectsData?.results?.map(subject => ({
        value: subject.id,
        label: subject.name,
    })) || [];
  
    subjectOptions.unshift({ value: 0, label: 'Select Subject' });



   
  
    const canRenderTable = majorData?.results && majorData.results.length > 0 &&
                           subjectsData?.results && subjectsData.results.length > 1 && 
                           regionsData?.results && regionsData.results.length > 0;


    return (
        <div>
            <Container>
                <div className="px-5 py-10">
                    <h1 className="text-lg mb-5">Add Admission Exam</h1>

               
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1 text-formInputText">Major</label>
                 
                        {canRenderTable ? (
                            <Select
                                value={selectedMajorId === null ? 0 : selectedMajorId}
                                onChange={handleMajorChange}
                                className="w-96 h-auto rounded focus:outline-none text-gray-600 bg-white"
                            >
                                <Select.Option value={0}>Select a major</Select.Option>
                                {majorData.results.map(m => (
                                    <Select.Option key={m.id} value={m.id}>{m.major}</Select.Option>
                                ))}
                            </Select>
                         ) : (
                             <div className="text-gray-500">Loading majors...</div> 
                         )}
                    </div>

              
                    {canRenderTable ? (
                         <TableLayout className="overflow-x-auto border-none">
                            <table className="min-w-[850px] table-auto border-collapse border">
                                <thead>
                                    <tr className="bg-tableTop text-tableTopText">
                                        <th className="border px-4 py-2">Region</th>
                                  
                                        {Array.from({ length: numSubjectColumns }).map((_, index) => (
                                            <th key={`subject-header-${index}`} className="border px-3 py-2 text-center" style={{ textAlign: 'center', minWidth: '150px' }}> {/* Added min-width */}
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
                                    
                                    {regionsData.results.map((region, rowIndex) => {
                                      
                                        const regionFormState = examDatesFormState.find(item => item.regionId === region.id);

                                        return (
                                            <tr key={region.id} className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}> 
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
                    ) : (
                         
                         <div className="text-center text-gray-500">
                             {isLoadingMajor || isLoadingSubjects || isLoadingRegions ? "Loading data..." : "Required data (majors, subjects, or regions) not available to display the form."}
                         </div>
                    )}


                 
                    <div className="mt-6 flex justify-end gap-4">
                        <LinkButton to={`/admissions/${admission_id}/exams`} type="button" variant="cancel">
                            Cancel
                        </LinkButton>
                        <button
                            onClick={handleSave}
                          
                            disabled={isAddingExams || isLoadingMajor || isLoadingSubjects || isLoadingRegions || !canRenderTable || selectedMajorId === null || selectedMajorId === 0}
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