import React, { useState, useCallback, memo } from 'react';
import { DatePicker } from 'antd';
import { Dayjs } from 'dayjs';

type Region = 'ashgabat' | 'ahal' | 'balkan' | 'dashoguz' | 'lebap' | 'mary';

interface ExamDateCellProps {
    region: Region;
    subjectColumnIndex: number;
    initialDate: Dayjs | null; // Başlangıç tarihi
}

export const ExamDateCell: React.FC<ExamDateCellProps> = memo(({
    region,
    subjectColumnIndex,
    initialDate
}) => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(initialDate || null);

    const handleDateChange = useCallback((date: Dayjs | null) => {
        setSelectedDate(date);
    }, [setSelectedDate]);

    return (
        <td
            className="border px-4 py-2"
            style={{ textAlign: 'center' }}
        >
            <DatePicker
                onChange={handleDateChange}
                defaultValue={selectedDate || null}
                format="DD.MM.YYYY"
                style={{ width: '100%', border: 'none', padding: '0' }}
                className="custom-datepicker"
                placeholder="Select Date"
                data-region={region}
                data-subject-index={subjectColumnIndex}
            />
        </td>
    );
});