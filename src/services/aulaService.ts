import api from './api';
import { Aula } from '../models/Aula';

const ENDPOINT = '/aulas';

export const aulaService = {
  getAll: async (): Promise<Aula[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Aula> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  getByModulo: async (moduloId: number): Promise<Aula[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Modulo=${moduloId}&_sort=Ordem`);
    return response.data;
  },
  create: async (aula: Omit<Aula, 'id'>): Promise<Aula> => {
    const response = await api.post(ENDPOINT, aula);
    return response.data;
  },
  update: async (id: number, aula: Partial<Aula>): Promise<Aula> => {
    const response = await api.put(`${ENDPOINT}/${id}`, aula);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
