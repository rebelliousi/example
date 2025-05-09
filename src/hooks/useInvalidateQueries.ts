import { useQueryClient } from '@tanstack/react-query';

export function useInvalidateQueries() {
    const queryClient = useQueryClient();
    const invalidate = (key: string) => {
        queryClient.invalidateQueries({ queryKey: [key] });
    };
    return { invalidate };
}
