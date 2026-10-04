export type Role = 'instituicao' | 'professor';
export type RequestStatus = 'aberta' | 'aguardando' | 'confirmada' | 'recusada' | 'concluida' | 'cancelada';
export type Modalidade = 'presencial' | 'online';

export interface SubRequest {
  id: string;
  disciplina: string;
  nivel: string;
  turma: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  modalidade: Modalidade;
  cidade: string;
  endereco: string;
  valor: string;
  observacoes: string;
  status: RequestStatus;
  professorConvidadoId: string | null;
  professorConvidadoNome: string | null;
  professorConfirmadoId: string | null;
  professorConfirmadoNome: string | null;
  criadaEm: string;
  instituicaoNome: string;
  recusadoPorIds: string[];
}

export interface Teacher {
  id: string;
  nome: string;
  disciplinas: string[];
  formacao: string;
  experiencia: number;
  nota: number;
  subs: number;
  distancia: string;
  cidade: string;
  disponivel: boolean;
  verificado: boolean;
  initials: string;
  cor: string;
  bio: string;
  niveis: string[];
}

export interface AppState {
  requests: SubRequest[];
  teachers: Teacher[];
}
