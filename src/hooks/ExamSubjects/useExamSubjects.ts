import { useQuery } from '@tanstack/react-query';
import {  IExamSubjects, IPagination } from '../../models/models';
import api from '../../api';


const getExamSubjects = async (page: number): Promise<IPagination<IExamSubjects>> => {
  const response = await api.get(`/admission/subject?page=${page}`);
  return response.data;
};

export const useExamSubjects = (page: number) => {
  return useQuery<IPagination<IExamSubjects>, Error>({
    queryKey: ['exam_subjects', page], 
    queryFn: () => getExamSubjects(page),
  });
};
