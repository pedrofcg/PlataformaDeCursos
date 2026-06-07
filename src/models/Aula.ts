export interface Aula {
  id?: number;
  ID_Modulo: number;
  Titulo: string;
  TipoConteudo: 'Vídeo' | 'Texto' | 'Quiz';
  URL_Conteudo: string;
  DuracaoMinutos: number;
  Ordem: number;
}
