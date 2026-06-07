export interface Curso {
  id?: number;
  Titulo: string;
  Descricao: string;
  ID_Instrutor: number;
  ID_Categoria: number;
  Nivel: 'Iniciante' | 'Intermediário' | 'Avançado';
  DataPublicacao: string;
  TotalAulas: number;
  TotalHoras: number;
}
