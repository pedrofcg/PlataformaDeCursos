import api from './api';
import { Assinatura } from '../models/Assinatura';

const ENDPOINT = '/assinaturas';

export const assinaturaService = {
  getAll: async (): Promise<Assinatura[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Assinatura> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  getByUsuario: async (usuarioId: number): Promise<Assinatura[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Usuario=${usuarioId}`);
    return response.data;
  },
  create: async (assinatura: Omit<Assinatura, 'id'>): Promise<Assinatura> => {
    const response = await api.post(ENDPOINT, assinatura);
    return response.data;
  },
  update: async (id: number, assinatura: Partial<Assinatura>): Promise<Assinatura> => {
    const response = await api.put(`${ENDPOINT}/${id}`, assinatura);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
