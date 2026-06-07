import api from './api';
import { Matricula } from '../models/Matricula';

const ENDPOINT = '/matriculas';

export const matriculaService = {
  getAll: async (): Promise<Matricula[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Matricula> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  getByUsuario: async (usuarioId: number): Promise<Matricula[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Usuario=${usuarioId}`);
    return response.data;
  },
  getByCurso: async (cursoId: number): Promise<Matricula[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Curso=${cursoId}`);
    return response.data;
  },
  create: async (matricula: Omit<Matricula, 'id'>): Promise<Matricula> => {
    const response = await api.post(ENDPOINT, matricula);
    return response.data;
  },
  update: async (id: number, matricula: Partial<Matricula>): Promise<Matricula> => {
    const response = await api.put(`${ENDPOINT}/${id}`, matricula);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
