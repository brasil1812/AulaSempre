import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppState, Role, SubRequest, Teacher, RequestStatus } from '../models/app.models';

const STORAGE_KEY = 'aulasempre_v1';
const ROLE_KEY = 'aulasempre_role';

const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: 'ana',
    nome: 'Ana Figueiredo',
    disciplinas: ['Matemática', 'Estatística'],
    formacao: 'Licenciatura em Matemática – USP',
    experiencia: 8,
    nota: 4.9,
    subs: 34,
    distancia: '2,1 km',
    cidade: 'São Paulo',
    disponivel: true,
    verificado: true,
    initials: 'AF',
    cor: 'blue',
    bio: 'Professora de Matemática com 8 anos de experiência no Ensino Médio e Superior. Metodologia ativa, foco em resolução de problemas.',
    niveis: ['Ensino Fundamental II', 'Ensino Médio', 'Ensino Superior'],
  },
  {
    id: 'carlos',
    nome: 'Carlos Mendes',
    disciplinas: ['Matemática', 'Física'],
    formacao: 'Licenciatura em Matemática – UNESP',
    experiencia: 12,
    nota: 4.8,
    subs: 52,
    distancia: '3,4 km',
    cidade: 'São Paulo',
    disponivel: true,
    verificado: true,
    initials: 'CM',
    cor: 'green',
    bio: 'Professor com ampla experiência em preparação para vestibular. Especializado em Matemática e Física para o Ensino Médio.',
    niveis: ['Ensino Médio'],
  },
  {
    id: 'roberto',
    nome: 'Roberto Lima',
    disciplinas: ['Ciências', 'Biologia'],
    formacao: 'Licenciatura em Ciências Biológicas – UNICAMP',
    experiencia: 5,
    nota: 4.6,
    subs: 18,
    distancia: '5,8 km',
    cidade: 'São Paulo',
    disponivel: true,
    verificado: true,
    initials: 'RL',
    cor: 'purple',
    bio: 'Professor de Ciências e Biologia. Experiência com Ensino Fundamental e Médio em escolas públicas e privadas.',
    niveis: ['Ensino Fundamental I', 'Ensino Fundamental II', 'Ensino Médio'],
  },
];

const DEFAULT_REQUESTS: SubRequest[] = [
  {
    id: 'demo-1',
    disciplina: 'Matemática',
    nivel: 'Ensino Médio',
    turma: '2º Médio A',
    data: '2026-10-25',
    horarioInicio: '07:30',
    horarioFim: '09:10',
    modalidade: 'presencial',
    cidade: 'São Paulo',
    endereco: 'Rua das Palmeiras, 450',
    valor: '120',
    observacoes: 'Conteúdo: Funções do 2º grau. Levar exercícios de revisão.',
    status: 'aguardando',
    professorConvidadoId: 'ana',
    professorConvidadoNome: 'Ana Figueiredo',
    professorConfirmadoId: null,
    professorConfirmadoNome: null,
    criadaEm: new Date().toISOString(),
    instituicaoNome: 'Colégio Horizonte',
    recusadoPorIds: [],
  },
];

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private _role = new BehaviorSubject<Role>(this.loadRole());
  private _state = new BehaviorSubject<AppState>(this.loadState());

  role$ = this._role.asObservable();
  state$ = this._state.asObservable();

  get role(): Role { return this._role.value; }
  get requests(): SubRequest[] { return this._state.value.requests; }
  get teachers(): Teacher[] { return this._state.value.teachers; }
  get currentTeacher(): Teacher {
    return this._state.value.teachers.find(t => t.id === 'ana') || this._state.value.teachers[0];
  }
  get currentInstitution() { return { nome: 'Colégio Horizonte' }; }

  setRole(role: Role): void {
    this._role.next(role);
    localStorage.setItem(ROLE_KEY, role);
  }

  createRequest(data: Omit<SubRequest, 'id' | 'status' | 'professorConvidadoId' | 'professorConvidadoNome' | 'professorConfirmadoId' | 'professorConfirmadoNome' | 'criadaEm' | 'recusadoPorIds'>): SubRequest {
    const req: SubRequest = {
      ...data,
      id: `req-${Date.now()}`,
      status: 'aberta',
      professorConvidadoId: null,
      professorConvidadoNome: null,
      professorConfirmadoId: null,
      professorConfirmadoNome: null,
      criadaEm: new Date().toISOString(),
      recusadoPorIds: [],
    };
    this.persist({ ...this._state.value, requests: [req, ...this._state.value.requests] });
    return req;
  }

  inviteTeacher(requestId: string, teacherId: string, teacherNome: string): void {
    const requests = this._state.value.requests.map(r =>
      r.id === requestId
        ? { ...r, status: 'aguardando' as RequestStatus, professorConvidadoId: teacherId, professorConvidadoNome: teacherNome }
        : r
    );
    this.persist({ ...this._state.value, requests });
  }

  acceptInvite(requestId: string): void {
    const requests = this._state.value.requests.map(r =>
      r.id === requestId
        ? { ...r, status: 'confirmada' as RequestStatus, professorConfirmadoId: r.professorConvidadoId, professorConfirmadoNome: r.professorConvidadoNome }
        : r
    );
    this.persist({ ...this._state.value, requests });
  }

  declineInvite(requestId: string): void {
    const req = this._state.value.requests.find(r => r.id === requestId);
    if (!req) return;
    const requests = this._state.value.requests.map(r =>
      r.id === requestId
        ? { ...r, status: 'aberta' as RequestStatus, professorConvidadoId: null, professorConvidadoNome: null, recusadoPorIds: [...r.recusadoPorIds, req.professorConvidadoId!] }
        : r
    );
    this.persist({ ...this._state.value, requests });
  }

  cancelRequest(requestId: string): void {
    const requests = this._state.value.requests.map(r =>
      r.id === requestId ? { ...r, status: 'cancelada' as RequestStatus } : r
    );
    this.persist({ ...this._state.value, requests });
  }

  resetData(): void {
    const fresh: AppState = { requests: DEFAULT_REQUESTS, teachers: DEFAULT_TEACHERS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    this._state.next(fresh);
  }

  private persist(state: AppState): void {
    this._state.next(state);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  private loadState(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { requests: DEFAULT_REQUESTS, teachers: DEFAULT_TEACHERS };
  }

  private loadRole(): Role {
    return (localStorage.getItem(ROLE_KEY) as Role) || 'instituicao';
  }
}
