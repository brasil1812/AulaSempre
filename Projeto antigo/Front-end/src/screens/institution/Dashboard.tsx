import { useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppContext";

const statusMap: Record<string, { label: string; cls: string }> = {
  aberta: { label: "Buscando professor", cls: "bg-amber-100 text-amber-700" },
  aguardando: { label: "Aguardando confirmação", cls: "bg-blue-100 text-blue-700" },
  confirmada: { label: "Professor confirmado", cls: "bg-green-100 text-green-700" },
  recusada: { label: "Recusada", cls: "bg-red-100 text-red-600" },
  concluida: { label: "Concluída", cls: "bg-slate-100 text-slate-600" },
  cancelada: { label: "Cancelada", cls: "bg-red-100 text-red-500" },
};

function fmt(data: string) {
  if (!data) return "—";
  const [y, m, d] = data.split("-");
  return `${d}/${m}/${y}`;
}

export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const { requests, currentInstitution } = useApp();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const active = requests.filter((r) => !["concluida", "cancelada"].includes(r.status));
  const confirmed = requests.filter((r) => r.status === "confirmada");
  const waiting = requests.filter((r) => r.status === "aguardando");
  const open = requests.filter((r) => r.status === "aberta");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {greeting}, {currentInstitution.nome}!
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => navigate("/instituicao/solicitar")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Solicitar substituição
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Solicitações ativas", value: active.length, icon: "📋", color: "blue" },
          { label: "Aguardando resposta", value: waiting.length, icon: "⏳", color: "amber" },
          { label: "Confirmadas", value: confirmed.length, icon: "✅", color: "green" },
          { label: "Em aberto", value: open.length, icon: "🔍", color: "slate" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <span className="text-2xl block mb-2">{icon}</span>
            <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Active requests */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-800">Solicitações recentes</h2>
          <button onClick={() => navigate("/instituicao/solicitacoes")} className="text-xs text-blue-600 font-medium hover:underline">
            Ver todas
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold text-slate-600 mb-1">Nenhuma solicitação ainda</p>
            <p className="text-sm text-slate-400 mb-4">Crie sua primeira solicitação de substituição</p>
            <button
              onClick={() => navigate("/instituicao/solicitar")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              Solicitar substituição
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 5).map((r) => {
              const s = statusMap[r.status];
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => navigate("/instituicao/solicitacoes")}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {r.disciplina} · {r.turma || r.nivel}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {fmt(r.data)} · {r.horarioInicio} – {r.horarioFim}
                      {r.professorConvidadoNome && ` · ${r.professorConvidadoNome}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                    {r.status === "aberta" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate("/instituicao/professores"); }}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        Buscar professores
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
