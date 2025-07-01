import { useQuery } from '@tanstack/react-query';
import api from '../../api';

interface User {
  id: number;
  area: string;
}

interface Major {
  id: number;
  major: string;
}

export interface Client {
  id: number;
  user: User;
  full_name: string;
  primary_major: Major;
  admission: number;
  admission_year: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const getClients = async (page: number): Promise<PaginatedResponse<Client>> => {
  const response = await api.get(`/admission/client?page=${page}`);
  return response.data;
};

export const useClients = (page: number) => {
  return useQuery<PaginatedResponse<Client>, Error>({
    queryKey: ['clients', page],
    queryFn: () => getClients(page),
    
  });
};