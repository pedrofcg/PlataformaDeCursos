import api from './api';
import { Usuario } from '../models/Usuario';

const ENDPOINT = '/usuarios';

export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Usuario> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  create: async (usuario: Omit<Usuario, 'id'>): Promise<Usuario> => {
    const response = await api.post(ENDPOINT, usuario);
    return response.data;
  },
  update: async (id: number, usuario: Partial<Usuario>): Promise<Usuario> => {
    const response = await api.put(`${ENDPOINT}/${id}`, usuario);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
