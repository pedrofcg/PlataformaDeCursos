import api from './api';
import { Plano } from '../models/Plano';

const ENDPOINT = '/planos';

export const planoService = {
  getAll: async (): Promise<Plano[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Plano> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  create: async (plano: Omit<Plano, 'id'>): Promise<Plano> => {
    const response = await api.post(ENDPOINT, plano);
    return response.data;
  },
  update: async (id: number, plano: Partial<Plano>): Promise<Plano> => {
    const response = await api.put(`${ENDPOINT}/${id}`, plano);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
