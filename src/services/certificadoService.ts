import api from './api';
import { Certificado } from '../models/Certificado';

const ENDPOINT = '/certificados';

export const certificadoService = {
  getAll: async (): Promise<Certificado[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Certificado> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  getByUsuario: async (usuarioId: number): Promise<Certificado[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Usuario=${usuarioId}`);
    return response.data;
  },
  getByCodigo: async (codigo: string): Promise<Certificado[]> => {
    const response = await api.get(`${ENDPOINT}?CodigoVerificacao=${codigo}`);
    return response.data;
  },
  create: async (certificado: Omit<Certificado, 'id'>): Promise<Certificado> => {
    const response = await api.post(ENDPOINT, certificado);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
