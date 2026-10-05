import { useState } from "react";
import { useNavigate } from "react-router-dom";

const tabs = ["Abertas", "Aguardando resposta", "Confirmadas", "Concluídas", "Canceladas"];

const requests = {
  Abertas: [
    { disciplina: "Física", turma: "2º Médio A", data: "28/08/2026", horario: "13:30 – 15:10", professor: "—", status: "buscando" },
    { disciplina: "Biologia", turma: "3º Médio B", data: "29/08/2026", horario: "07:30 – 09:10", professor: "—", status: "buscando" },
    { disciplina: "Filosofia", turma: "1º Médio C", data: "30/08/2026", horario: "10:50 – 12:30", professor: "—", status: "buscando" },
  ],
  "Aguardando resposta": [
    { disciplina: "História", turma: "8º C", data: "29/08/2026", horario: "07:30 – 09:10", professor: "Dr. Paulo Salave'a", status: "aguardando" },
    { disciplina: "Geografia", turma: "7º A", data: "30/08/2026", horario: "13:30 – 15:10", professor: "Marcia Tanaka", status: "aguardando" },
  ],
  Confirmadas: [
    { disciplina: "Matemática", turma: "9º A", data: "28/08/2026", horario: "07:30 – 09:10", professor: "Carlos Mendes", status: "confirmado" },
    { disciplina: "Português", turma: "7º B", data: "28/08/2026", horario: "10:50 – 12:30", professor: "Ana Figueiredo", status: "confirmado" },
  ],
  Concluídas: [
    { disciplina: "Matemática", turma: "8º A", data: "25/08/2026", horario: "07:30 – 09:10", professor: "Carlos Mendes", status: "concluida" },
    { disciplina: "Ciências", turma: "6º B", data: "22/08/2026", horario: "10:50 – 12:30", professor: "Roberto Lima", status: "concluida" },
  ],
  Canceladas: [
    { disciplina: "Artes", turma: "5º A", data: "20/08/2026", horario: "13:30 – 15:10", professor: "—", status: "cancelada" },
  ],
};

const statusMap: Record<string, { label: string; cls: string }> = {
  buscando: { label: "Procurando professor", cls: "bg-amber-100 text-amber-700" },
  aguardando: { label: "Aguardando confirmação", cls: "bg-blue-100 text-blue-700" },
  confirmado: { label: "Professor confirmado", cls: "bg-green-100 text-green-700" },
  concluida: { label: "Concluída", cls: "bg-slate-100 text-slate-600" },
  cancelada: { label: "Cancelada", cls: "bg-red-100 text-red-600" },
};

export default function MyRequestsScreen() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Abertas");

  const items = requests[active as keyof typeof requests] || [];

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Minhas solicitações</h1>
          <p className="text-sm text-slate-500 mt-1">Acompanhe todas as suas solicitações de substituição</p>
        </div>
        <button
          onClick={() => navigate("/criar-solicitacao")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nova solicitação
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              active === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
            {requests[tab as keyof typeof requests]?.length > 0 && (
              <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${active === tab ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"}`}>
                {requests[tab as keyof typeof requests].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-semibold text-slate-700 mb-1">Nenhuma solicitação {active.toLowerCase()}</h3>
          <p className="text-sm text-slate-400">Quando houver, ela aparecerá aqui.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Disciplina", "Turma", "Data", "Horário", "Professor", "Status", "Ações"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((r, i) => {
                const s = statusMap[r.status];
                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800 text-sm">{r.disciplina}</td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{r.turma}</td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{r.data}</td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{r.horario}</td>
                    <td className="px-5 py-4 text-slate-600 text-sm">{r.professor}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {r.status === "buscando" && (
                          <button onClick={() => navigate("/buscar")} className="text-xs text-blue-600 font-semibold hover:underline">
                            Ver professores
                          </button>
                        )}
                        {r.status === "concluida" && (
                          <button onClick={() => navigate("/confirmacao")} className="text-xs text-amber-600 font-semibold hover:underline">
                            Avaliar
                          </button>
                        )}
                        {(r.status === "confirmado" || r.status === "aguardando") && (
                          <button className="text-xs text-red-500 font-semibold hover:underline">
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
