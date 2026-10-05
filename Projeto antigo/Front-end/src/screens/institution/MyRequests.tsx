import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppContext";

const tabs = ["Todas", "Abertas", "Aguardando", "Confirmadas", "Concluídas", "Canceladas"];

const statusMap: Record<string, { label: string; cls: string }> = {
  aberta: { label: "Buscando professor", cls: "bg-amber-100 text-amber-700" },
  aguardando: { label: "Aguardando confirmação", cls: "bg-blue-100 text-blue-700" },
  confirmada: { label: "Professor confirmado", cls: "bg-green-100 text-green-700" },
  recusada: { label: "Recusada", cls: "bg-red-100 text-red-600" },
  concluida: { label: "Concluída", cls: "bg-slate-100 text-slate-600" },
  cancelada: { label: "Cancelada", cls: "bg-red-100 text-red-500" },
};

const tabFilter: Record<string, string[]> = {
  Todas: [],
  Abertas: ["aberta"],
  Aguardando: ["aguardando"],
  Confirmadas: ["confirmada"],
  Concluídas: ["concluida"],
  Canceladas: ["cancelada"],
};

function fmt(data: string) {
  if (!data) return "—";
  const [y, m, d] = data.split("-");
  return `${d}/${m}/${y}`;
}

export default function MyRequests() {
  const navigate = useNavigate();
  const { requests, cancelRequest } = useApp();
  const [active, setActive] = useState("Todas");
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  const filtered = tabFilter[active].length > 0
    ? requests.filter((r) => tabFilter[active].includes(r.status))
    : requests;

  const handleCancel = (id: string) => {
    cancelRequest(id);
    setConfirmCancel(null);
  };

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Minhas solicitações</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe todas as substituições solicitadas</p>
        </div>
        <button onClick={() => navigate("/instituicao/solicitar")} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Nova solicitação
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const count = tabFilter[tab].length > 0 ? requests.filter((r) => tabFilter[tab].includes(r.status)).length : requests.length;
          return (
            <button key={tab} onClick={() => setActive(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${active === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {tab}
              {count > 0 && (
                <span className={`ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${active === tab ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-semibold text-slate-700 mb-1">Nenhuma solicitação {active !== "Todas" ? active.toLowerCase() : "encontrada"}</p>
          {active === "Todas" && (
            <button onClick={() => navigate("/instituicao/solicitar")} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
              Criar primeira solicitação
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const s = statusMap[r.status];
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-slate-800">{r.disciplina}</h3>
                      {r.turma && <span className="text-sm text-slate-500">· {r.turma}</span>}
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                      <span>📅 {fmt(r.data)}</span>
                      <span>🕐 {r.horarioInicio} – {r.horarioFim}</span>
                      <span>{r.modalidade === "presencial" ? `🏫 ${r.cidade}` : "💻 Online"}</span>
                      <span>💰 R$ {r.valor}</span>
                    </div>
                    {r.professorConvidadoNome && (
                      <p className="text-sm text-slate-600 mt-2">
                        👩‍🏫 {r.status === "confirmada" ? "Confirmado:" : "Convidado:"}{" "}
                        <strong>{r.professorConvidadoNome}</strong>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {r.status === "aberta" && (
                      <>
                        <button onClick={() => navigate("/instituicao/professores")} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                          Buscar professores
                        </button>
                        <button onClick={() => setConfirmCancel(r.id)} className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1.5">
                          Cancelar
                        </button>
                      </>
                    )}
                    {r.status === "aguardando" && (
                      <button onClick={() => setConfirmCancel(r.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">Cancelar solicitação?</h3>
            <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita. O professor convidado será notificado.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCancel(null)} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-2.5 rounded-xl text-sm">Manter</button>
              <button onClick={() => handleCancel(confirmCancel)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm">Cancelar mesmo assim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
