import api from '../../api';
import { useMutation } from '@tanstack/react-query'



const sendFiles = async (formData: FormData) => {
    const response = await api.post('/files/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
export function useSendFiles() {
    return useMutation({
        mutationFn: (data: FormData) => sendFiles(data),
    });
}
