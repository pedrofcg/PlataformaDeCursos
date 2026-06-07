import api from './api';
import { Curso } from '../models/Curso';

const ENDPOINT = '/cursos';

export const cursoService = {
  getAll: async (): Promise<Curso[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Curso> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  getByCategoria: async (categoriaId: number): Promise<Curso[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Categoria=${categoriaId}`);
    return response.data;
  },
  getByInstrutor: async (instrutorId: number): Promise<Curso[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Instrutor=${instrutorId}`);
    return response.data;
  },
  create: async (curso: Omit<Curso, 'id'>): Promise<Curso> => {
    const response = await api.post(ENDPOINT, curso);
    return response.data;
  },
  update: async (id: number, curso: Partial<Curso>): Promise<Curso> => {
    const response = await api.put(`${ENDPOINT}/${id}`, curso);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
