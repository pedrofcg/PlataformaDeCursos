export interface Certificado {
  id?: number;
  ID_Usuario: number;
  ID_Curso: number;
  ID_Trilha: number | null;
  CodigoVerificacao: string;
  DataEmissao: string;
}
