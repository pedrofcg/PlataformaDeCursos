import api from './api';
import { Avaliacao } from '../models/Avaliacao';

const ENDPOINT = '/avaliacoes';

export const avaliacaoService = {
  getAll: async (): Promise<Avaliacao[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getByCurso: async (cursoId: number): Promise<Avaliacao[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Curso=${cursoId}`);
    return response.data;
  },
  getByUsuario: async (usuarioId: number): Promise<Avaliacao[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Usuario=${usuarioId}`);
    return response.data;
  },
  create: async (avaliacao: Omit<Avaliacao, 'id'>): Promise<Avaliacao> => {
    const response = await api.post(ENDPOINT, avaliacao);
    return response.data;
  },
  update: async (id: number, avaliacao: Partial<Avaliacao>): Promise<Avaliacao> => {
    const response = await api.put(`${ENDPOINT}/${id}`, avaliacao);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
