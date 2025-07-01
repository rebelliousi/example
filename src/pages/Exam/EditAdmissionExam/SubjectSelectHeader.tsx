import React, { memo } from 'react';
import { Select } from 'antd';

interface SubjectSelectHeaderProps {
    index: number;
    subjectsData: any; // Replace 'any' with the actual type of subjectsData
    selectedSubjectIdsPerColumn: number[];
    subjectOptions: { value: number; label: string }[];
}

export const SubjectSelectHeader: React.FC<SubjectSelectHeaderProps> = memo(({
    index,
    subjectsData,
    selectedSubjectIdsPerColumn,
    subjectOptions,
}) => {
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
});