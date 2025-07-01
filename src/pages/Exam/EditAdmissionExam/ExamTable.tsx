import React, { memo, useCallback, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import TableLayout from '../../../components/Table/TableLayout';
import { ExamDateCell } from './ExamDateCell';
import { Dayjs } from 'dayjs';

type Region = 'ashgabat' | 'ahal' | 'balkan' | 'dashoguz' | 'lebap' | 'mary';

interface ExamTableProps {
    regions: { name: string; value: Region }[];
    subjectsData: any; // Replace 'any' with the actual type of subjectsData
    selectedSubjectIdsPerColumn: number[];
    numSubjectColumns: number;
    subjectOptions: { value: number; label: string }[];
    initialExamDates: any;
}

export interface ExamTableHandle {
    getExamDates: () => { region: Region; dates: (Dayjs | null)[] }[];
}

const ExamTable: React.FC<ExamTableProps> = forwardRef<ExamTableHandle, ExamTableProps>((
    {
        regions,
        subjectsData,
        selectedSubjectIdsPerColumn,
        numSubjectColumns,
        subjectOptions,
        initialExamDates
    }, ref) => {
    const [examDates, setExamDates] = useState(initialExamDates);

    useEffect(() => {
        setExamDates(initialExamDates);
    }, [initialExamDates]);

    useImperativeHandle(ref, () => ({
        getExamDates: () => {
            return examDates.map((regionData:any) => {
                return {
                    region: regionData.region,
                    dates: Array.from({ length: numSubjectColumns }).map((_, subjectColumnIndex) => {
                        // Her bir ExamDateCell'den değeri almamız gerekecek
                        return document.querySelector(`[data-region="${regionData.region}"][data-subject-index="${subjectColumnIndex}"]`)?.value|| null;
                    })
                };
            });
        }
    }), [examDates, numSubjectColumns]);

    return (
        <TableLayout className="overflow-x-auto border-none">
            <table className="min-w-[850px] table-auto border-collapse border">
                <thead>
                    <tr className="bg-tableTop text-tableTopText">
                        <th className="border px-4 py-2">Region</th>
                        {Array.from({ length: numSubjectColumns }).map((_, index) => {
                            const subject = subjectsData?.results?.find(
                                (sub:any) => sub.id === selectedSubjectIdsPerColumn[index]
                            );
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

                        return (
                            <tr
                                key={regionData.value}
                                className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}
                            >
                                <td className="border text-center px-4 py-2">{regionData.name}</td>
                                {Array.from({ length: numSubjectColumns }).map(
                                    (_, subjectColumnIndex) => {
                                        const initialDate = initialExamDates.find((item:any) => item.region === regionData.value)?.dates[subjectColumnIndex] || null;
                                        return (
                                            <ExamDateCell
                                                key={`${regionData.value}-${subjectColumnIndex}`}
                                                region={regionData.value}
                                                subjectColumnIndex={subjectColumnIndex}
                                                initialDate={initialDate}
                                            />
                                        );
                                    }
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </TableLayout>
    );
});

export default ExamTable;