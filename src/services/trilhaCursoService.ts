import api from './api';
import { TrilhaCurso } from '../models/TrilhaCurso';

const ENDPOINT = '/trilhas_cursos';

export const trilhaCursoService = {
  getAll: async (): Promise<TrilhaCurso[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getByTrilha: async (trilhaId: number): Promise<TrilhaCurso[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Trilha=${trilhaId}&_sort=Ordem`);
    return response.data;
  },
  create: async (tc: Omit<TrilhaCurso, 'id'>): Promise<TrilhaCurso> => {
    const response = await api.post(ENDPOINT, tc);
    return response.data;
  },
  update: async (id: number, tc: Partial<TrilhaCurso>): Promise<TrilhaCurso> => {
    const response = await api.put(`${ENDPOINT}/${id}`, tc);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
