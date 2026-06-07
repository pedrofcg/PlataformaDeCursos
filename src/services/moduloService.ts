import api from './api';
import { Modulo } from '../models/Modulo';

const ENDPOINT = '/modulos';

export const moduloService = {
  getAll: async (): Promise<Modulo[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Modulo> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  getByCurso: async (cursoId: number): Promise<Modulo[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Curso=${cursoId}&_sort=Ordem`);
    return response.data;
  },
  create: async (modulo: Omit<Modulo, 'id'>): Promise<Modulo> => {
    const response = await api.post(ENDPOINT, modulo);
    return response.data;
  },
  update: async (id: number, modulo: Partial<Modulo>): Promise<Modulo> => {
    const response = await api.put(`${ENDPOINT}/${id}`, modulo);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
