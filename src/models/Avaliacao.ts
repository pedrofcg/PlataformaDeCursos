export interface Avaliacao {
  id?: number;
  ID_Usuario: number;
  ID_Curso: number;
  Nota: number;
  Comentario: string | null;
  DataAvaliacao: string;
}
