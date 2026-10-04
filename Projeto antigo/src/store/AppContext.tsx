import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Role = "instituicao" | "professor";
export type RequestStatus = "aberta" | "aguardando" | "confirmada" | "recusada" | "concluida" | "cancelada";
export type Modalidade = "presencial" | "online";

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

const STORAGE_KEY = "aulasempre_v1";

const DEFAULT_TEACHERS: Teacher[] = [
  {
    id: "ana",
    nome: "Ana Figueiredo",
    disciplinas: ["Matemática", "Estatística"],
    formacao: "Licenciatura em Matemática – USP",
    experiencia: 8,
    nota: 4.9,
    subs: 34,
    distancia: "2,1 km",
    cidade: "São Paulo",
    disponivel: true,
    verificado: true,
    initials: "AF",
    cor: "blue",
    bio: "Professora de Matemática com 8 anos de experiência no Ensino Médio e Superior. Metodologia ativa, foco em resolução de problemas.",
    niveis: ["Ensino Fundamental II", "Ensino Médio", "Ensino Superior"],
  },
  {
    id: "carlos",
    nome: "Carlos Mendes",
    disciplinas: ["Matemática", "Física"],
    formacao: "Licenciatura em Matemática – UNESP",
    experiencia: 12,
    nota: 4.8,
    subs: 52,
    distancia: "3,4 km",
    cidade: "São Paulo",
    disponivel: true,
    verificado: true,
    initials: "CM",
    cor: "green",
    bio: "Professor com ampla experiência em preparação para vestibular. Especializado em Matemática e Física para o Ensino Médio.",
    niveis: ["Ensino Médio"],
  },
  {
    id: "roberto",
    nome: "Roberto Lima",
    disciplinas: ["Ciências", "Biologia"],
    formacao: "Licenciatura em Ciências Biológicas – UNICAMP",
    experiencia: 5,
    nota: 4.6,
    subs: 18,
    distancia: "5,8 km",
    cidade: "São Paulo",
    disponivel: true,
    verificado: true,
    initials: "RL",
    cor: "purple",
    bio: "Professor de Ciências e Biologia. Experiência com Ensino Fundamental e Médio em escolas públicas e privadas.",
    niveis: ["Ensino Fundamental I", "Ensino Fundamental II", "Ensino Médio"],
  },
];

const DEFAULT_REQUESTS: SubRequest[] = [
  {
    id: "demo-1",
    disciplina: "Matemática",
    nivel: "Ensino Médio",
    turma: "2º Médio A",
    data: "2026-09-25",
    horarioInicio: "07:30",
    horarioFim: "09:10",
    modalidade: "presencial",
    cidade: "São Paulo",
    endereco: "Rua das Palmeiras, 450",
    valor: "120",
    observacoes: "Conteúdo: Funções do 2º grau. Levar exercícios de revisão.",
    status: "aguardando",
    professorConvidadoId: "ana",
    professorConvidadoNome: "Ana Figueiredo",
    professorConfirmadoId: null,
    professorConfirmadoNome: null,
    criadaEm: new Date().toISOString(),
    instituicaoNome: "Colégio Horizonte",
    recusadoPorIds: [],
  },
];

interface AppState {
  requests: SubRequest[];
  teachers: Teacher[];
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { requests: DEFAULT_REQUESTS, teachers: DEFAULT_TEACHERS };
}

function save(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function resetToDefaults(): AppState {
  const fresh = { requests: DEFAULT_REQUESTS, teachers: DEFAULT_TEACHERS };
  save(fresh);
  return fresh;
}

interface AppContextValue {
  role: Role;
  setRole: (r: Role) => void;
  requests: SubRequest[];
  teachers: Teacher[];
  createRequest: (r: Omit<SubRequest, "id" | "status" | "professorConvidadoId" | "professorConvidadoNome" | "professorConfirmadoId" | "professorConfirmadoNome" | "criadaEm" | "recusadoPorIds">) => SubRequest;
  inviteTeacher: (requestId: string, teacherId: string, teacherNome: string) => void;
  acceptInvite: (requestId: string) => void;
  declineInvite: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  resetData: () => void;
  currentTeacher: Teacher;
  currentInstitution: { nome: string };
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem("aulasempre_role") as Role) || "instituicao";
  });
  const [state, setState] = useState<AppState>(load);

  const persist = useCallback((next: AppState) => {
    setState(next);
    save(next);
  }, []);

  const handleSetRole = (r: Role) => {
    setRole(r);
    localStorage.setItem("aulasempre_role", r);
  };

  const createRequest = useCallback(
    (data: Omit<SubRequest, "id" | "status" | "professorConvidadoId" | "professorConvidadoNome" | "professorConfirmadoId" | "professorConfirmadoNome" | "criadaEm" | "recusadoPorIds">) => {
      const req: SubRequest = {
        ...data,
        id: `req-${Date.now()}`,
        status: "aberta",
        professorConvidadoId: null,
        professorConvidadoNome: null,
        professorConfirmadoId: null,
        professorConfirmadoNome: null,
        criadaEm: new Date().toISOString(),
        recusadoPorIds: [],
      };
      const next = { ...state, requests: [req, ...state.requests] };
      persist(next);
      return req;
    },
    [state, persist]
  );

  const inviteTeacher = useCallback(
    (requestId: string, teacherId: string, teacherNome: string) => {
      const next = {
        ...state,
        requests: state.requests.map((r) =>
          r.id === requestId
            ? { ...r, status: "aguardando" as RequestStatus, professorConvidadoId: teacherId, professorConvidadoNome: teacherNome }
            : r
        ),
      };
      persist(next);
    },
    [state, persist]
  );

  const acceptInvite = useCallback(
    (requestId: string) => {
      const next = {
        ...state,
        requests: state.requests.map((r) =>
          r.id === requestId
            ? { ...r, status: "confirmada" as RequestStatus, professorConfirmadoId: r.professorConvidadoId, professorConfirmadoNome: r.professorConvidadoNome }
            : r
        ),
      };
      persist(next);
    },
    [state, persist]
  );

  const declineInvite = useCallback(
    (requestId: string) => {
      const req = state.requests.find((r) => r.id === requestId);
      if (!req) return;
      const next = {
        ...state,
        requests: state.requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "aberta" as RequestStatus,
                professorConvidadoId: null,
                professorConvidadoNome: null,
                recusadoPorIds: [...r.recusadoPorIds, req.professorConvidadoId!],
              }
            : r
        ),
      };
      persist(next);
    },
    [state, persist]
  );

  const cancelRequest = useCallback(
    (requestId: string) => {
      const next = {
        ...state,
        requests: state.requests.map((r) =>
          r.id === requestId ? { ...r, status: "cancelada" as RequestStatus } : r
        ),
      };
      persist(next);
    },
    [state, persist]
  );

  const resetData = useCallback(() => {
    const fresh = resetToDefaults();
    setState(fresh);
  }, []);

  const currentTeacher = state.teachers.find((t) => t.id === "ana") || state.teachers[0];
  const currentInstitution = { nome: "Colégio Horizonte" };

  return (
    <Ctx.Provider
      value={{
        role,
        setRole: handleSetRole,
        requests: state.requests,
        teachers: state.teachers,
        createRequest,
        inviteTeacher,
        acceptInvite,
        declineInvite,
        cancelRequest,
        resetData,
        currentTeacher,
        currentInstitution,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
