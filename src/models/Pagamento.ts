export interface Pagamento {
  id?: number;
  ID_Assinatura: number;
  ValorPago: number;
  DataPagamento: string;
  MetodoPagamento: 'Cartão de Crédito' | 'Boleto' | 'PIX';
  Id_Transacao_Gateway: string;
}
