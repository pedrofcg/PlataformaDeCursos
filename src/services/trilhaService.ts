import api from './api';
import { Trilha } from '../models/Trilha';

const ENDPOINT = '/trilhas';

export const trilhaService = {
  getAll: async (): Promise<Trilha[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Trilha> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  getByCategoria: async (categoriaId: number): Promise<Trilha[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Categoria=${categoriaId}`);
    return response.data;
  },
  create: async (trilha: Omit<Trilha, 'id'>): Promise<Trilha> => {
    const response = await api.post(ENDPOINT, trilha);
    return response.data;
  },
  update: async (id: number, trilha: Partial<Trilha>): Promise<Trilha> => {
    const response = await api.put(`${ENDPOINT}/${id}`, trilha);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
