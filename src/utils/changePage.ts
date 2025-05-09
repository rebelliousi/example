import { useQueryClient } from '@tanstack/react-query';
import React from 'react';

export const useChangePage = () => {
    const queryClient = useQueryClient();
    return (
        setPage: React.Dispatch<React.SetStateAction<number>>,
        value: number,
        invalidate: string
    ) => {
        setPage(value);
        queryClient.invalidateQueries({
            queryKey: [invalidate, value],
        });
    };
};
