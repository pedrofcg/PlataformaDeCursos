import api from './api';
import { Categoria } from '../models/Categoria';

const ENDPOINT = '/categorias';

export const categoriaService = {
  getAll: async (): Promise<Categoria[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Categoria> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  create: async (categoria: Omit<Categoria, 'id'>): Promise<Categoria> => {
    const response = await api.post(ENDPOINT, categoria);
    return response.data;
  },
  update: async (id: number, categoria: Partial<Categoria>): Promise<Categoria> => {
    const response = await api.put(`${ENDPOINT}/${id}`, categoria);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
