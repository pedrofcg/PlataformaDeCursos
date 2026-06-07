import api from './api';
import { Pagamento } from '../models/Pagamento';

const ENDPOINT = '/pagamentos';

export const pagamentoService = {
  getAll: async (): Promise<Pagamento[]> => {
    const response = await api.get(ENDPOINT);
    return response.data;
  },
  getById: async (id: number): Promise<Pagamento> => {
    const response = await api.get(`${ENDPOINT}/${id}`);
    return response.data;
  },
  getByAssinatura: async (assinaturaId: number): Promise<Pagamento[]> => {
    const response = await api.get(`${ENDPOINT}?ID_Assinatura=${assinaturaId}`);
    return response.data;
  },
  create: async (pagamento: Omit<Pagamento, 'id'>): Promise<Pagamento> => {
    const response = await api.post(ENDPOINT, pagamento);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`${ENDPOINT}/${id}`);
  },
};
