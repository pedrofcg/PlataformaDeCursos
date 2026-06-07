export interface ProgressoAula {
  id?: number;
  ID_Usuario: number;
  ID_Aula: number;
  DataConclusao: string;
  Status: 'Concluído' | 'Em Andamento';
}
