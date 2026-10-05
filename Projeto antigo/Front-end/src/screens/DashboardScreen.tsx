import { useNavigate } from "react-router-dom"

const stats = [
  {
    label: "Substituições hoje",
    value: "2",
    icon: "📅",
    color: "blue",
    trend: "+1 vs ontem",
  },
  {
    label: "Solicitações abertas",
    value: "4",
    icon: "📋",
    color: "amber",
    trend: "2 aguardando",
  },
  {
    label: "Realizadas no mês",
    value: "18",
    icon: "✅",
    color: "green",
    trend: "+3 vs mês anterior",
  },
  {
    label: "Professores favoritos",
    value: "7",
    icon: "⭐",
    color: "purple",
    trend: "Todos disponíveis",
  },
]

const todaySubstitutions = [
  {
    professor: "Carlos Mendes",
    disciplina: "Matemática",
    turma: "9º A",
    horario: "07:30 – 09:10",
    status: "confirmado",
  },
  {
    professor: "Ana Figueiredo",
    disciplina: "Português",
    turma: "7º B",
    horario: "10:50 – 12:30",
    status: "confirmado",
  },
]

const openRequests = [
  {
    disciplina: "Física",
    turma: "2º Médio A",
    data: "Hoje",
    horario: "13:30 – 15:10",
    status: "buscando",
  },
  {
    disciplina: "História",
    turma: "8º C",
    data: "Amanhã",
    horario: "07:30 – 09:10",
    status: "aguardando",
  },
  {
    disciplina: "Biologia",
    turma: "3º Médio B",
    data: "28/08",
    horario: "10:50 – 12:30",
    status: "buscando",
  },
]

const favorites = [
  {
    nome: "Carlos Mendes",
    disciplina: "Matemática",
    nota: 4.9,
    subs: 34,
    disponivel: true,
    initials: "CM",
  },
  {
    nome: "Ana Figueiredo",
    disciplina: "Português",
    nota: 4.8,
    subs: 28,
    disponivel: true,
    initials: "AF",
  },
  {
    nome: "Roberto Lima",
    disciplina: "Ciências",
    nota: 4.7,
    subs: 21,
    disponivel: false,
    initials: "RL",
  },
]

const notifications = [
  {
    text: "Carlos Mendes aceitou sua solicitação de substituição.",
    time: "há 10 min",
    read: false,
  },
  {
    text: "Novo professor compatível encontrado para Física.",
    time: "há 45 min",
    read: false,
  },
  {
    text: "Lembre-se de avaliar a substituição de ontem.",
    time: "há 3h",
    read: true,
  },
]

const upcoming = [
  {
    professor: "Carlos Mendes",
    disciplina: "Matemática",
    turma: "9º A",
    data: "Hoje, 07:30",
    status: "confirmado",
  },
  {
    professor: "Ana Figueiredo",
    disciplina: "Português",
    turma: "7º B",
    data: "Hoje, 10:50",
    status: "confirmado",
  },
  {
    professor: "–",
    disciplina: "Física",
    turma: "2º Médio A",
    data: "Hoje, 13:30",
    status: "buscando",
  },
]

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmado: "bg-green-100 text-green-700",
    buscando: "bg-amber-100 text-amber-700",
    aguardando: "bg-blue-100 text-blue-700",
    concluida: "bg-slate-100 text-slate-600",
  }
  const labels: Record<string, string> = {
    confirmado: "Confirmado",
    buscando: "Buscando professor",
    aguardando: "Aguardando confirmação",
    concluida: "Concluída",
  }
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[status] || "bg-slate-100 text-slate-600"}`}
    >
      {labels[status] || status}
    </span>
  )
}

export default function DashboardScreen() {
  const navigate = useNavigate()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {greeting}, Mariana!{" "}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Colégio São Paulo — Quinta-feira, 28 de agosto de 2026
          </p>
        </div>
        <button
          onClick={() => navigate("/criar-solicitacao")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Encontrar professor substituto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon, trend }) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{icon}</span>
              <span className="text-xs text-slate-400 font-medium">
                {trend}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Today */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">
                Substituições de hoje
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                2 confirmadas
              </span>
            </div>
            <div className="space-y-3">
              {todaySubstitutions.map((s) => (
                <div
                  key={s.professor}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-sm font-semibold text-green-700">
                      {s.professor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {s.professor}
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.disciplina} · {s.turma}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-600">
                      {s.horario}
                    </p>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">
                Solicitações abertas
              </h2>
              <button
                onClick={() => navigate("/solicitacoes")}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {openRequests.map((r) => (
                <div
                  key={r.disciplina + r.turma}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {r.disciplina} · {r.turma}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.data} · {r.horario}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={r.status} />
                    {r.status === "buscando" && (
                      <button
                        onClick={() => navigate("/buscar")}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Ver professores
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximas */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">
              Próximas substituições
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 font-medium">
                    <th className="text-left pb-3">Professor</th>
                    <th className="text-left pb-3">Disciplina</th>
                    <th className="text-left pb-3">Turma</th>
                    <th className="text-left pb-3">Data/Hora</th>
                    <th className="text-left pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {upcoming.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-800">
                        {u.professor}
                      </td>
                      <td className="py-3 text-slate-600">{u.disciplina}</td>
                      <td className="py-3 text-slate-600">{u.turma}</td>
                      <td className="py-3 text-slate-600">{u.data}</td>
                      <td className="py-3">
                        <StatusBadge status={u.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-6">
          {/* Favorites */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">
                Professores favoritos
              </h2>
              <button
                onClick={() => navigate("/professores")}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="space-y-3">
              {favorites.map((f) => (
                <div key={f.nome} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                    {f.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {f.nome}
                    </p>
                    <p className="text-xs text-slate-400">
                      {f.disciplina} · ⭐ {f.nota}
                    </p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      f.disponivel ? "bg-green-400" : "bg-slate-300"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800">Notificações</h2>
              <button
                onClick={() => navigate("/notificacoes")}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs ${
                    n.read ? "bg-slate-50" : "bg-blue-50 border border-blue-100"
                  }`}
                >
                  <p
                    className={`mb-1 leading-relaxed ${
                      n.read ? "text-slate-600" : "text-slate-800 font-medium"
                    }`}
                  >
                    {n.text}
                  </p>
                  <p className="text-slate-400">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
