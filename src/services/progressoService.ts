import api from './api';
import { ProgressoAula } from '../models/ProgressoAula';

const ENDPOINT = '/progresso_aulas';

export const progressoService = {
  getAll: async (): Promise<ProgressoAula[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getByUsuario: async (usuarioId: number): Promise<ProgressoAula[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Usuario=${usuarioId}`);
    return response.data;
  },
  getByUsuarioAndAula: async (usuarioId: number, aulaId: number): Promise<ProgressoAula[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Usuario=${usuarioId}&ID_Aula=${aulaId}`);
    return response.data;
  },
  create: async (progresso: Omit<ProgressoAula, 'id'>): Promise<ProgressoAula> => {
    const response = await api.post(ENDPOINT, progresso);
    return response.data;
  },
  update: async (id: number, progresso: Partial<ProgressoAula>): Promise<ProgressoAula> => {
    const response = await api.put(`${ENDPOINT}/${id}`, progresso);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
