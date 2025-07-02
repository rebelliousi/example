import { useQuery } from '@tanstack/react-query';
import api from '../../api'; // api.ts dosyasının yolu
import type { IPagination, IDocument } from '../../models/models'; // type-only import

const getDocuments = async (): Promise<IPagination<IDocument>> => {
  try {
    const response = await api.get<IPagination<IDocument>>('/admission/document_needed/');
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const useDocument = () => {
  return useQuery<IPagination<IDocument>, Error>({
    queryKey: ['document'],
    queryFn: getDocuments,
    retry: 1,
  });
};