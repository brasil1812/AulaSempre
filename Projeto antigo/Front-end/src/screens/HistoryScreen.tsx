import { useState } from "react";

const history = [
  { professor: "Carlos Mendes", disciplina: "Matemática", turma: "9º A", data: "25/08/2026", horario: "07:30–09:10", avaliacao: 5, status: "concluida" },
  { professor: "Ana Figueiredo", disciplina: "Português", turma: "7º B", data: "22/08/2026", horario: "10:50–12:30", avaliacao: 5, status: "concluida" },
  { professor: "Roberto Lima", disciplina: "Ciências", turma: "6º B", data: "19/08/2026", horario: "13:30–15:10", avaliacao: 4, status: "concluida" },
  { professor: "Fernanda Souza", disciplina: "Matemática", turma: "8º C", data: "15/08/2026", horario: "07:30–09:10", avaliacao: 4, status: "concluida" },
  { professor: "Carlos Mendes", disciplina: "Matemática", turma: "9º A", data: "12/08/2026", horario: "10:50–12:30", avaliacao: 5, status: "concluida" },
  { professor: "–", disciplina: "Física", turma: "2º Médio A", data: "10/08/2026", horario: "07:30–09:10", avaliacao: 0, status: "cancelada" },
  { professor: "Ana Figueiredo", disciplina: "Literatura", turma: "3º Médio B", data: "05/08/2026", horario: "13:30–15:10", avaliacao: 5, status: "concluida" },
];

function MiniStars({ nota }: { nota: number }) {
  if (!nota) return <span className="text-xs text-slate-400">—</span>;
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 20 20" fill={i <= nota ? "#F59E0B" : "#E2E8F0"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function HistoryScreen() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");

  const filtered = history.filter((h) => {
    const matchSearch = search === "" ||
      h.professor.toLowerCase().includes(search.toLowerCase()) ||
      h.disciplina.toLowerCase().includes(search.toLowerCase()) ||
      h.turma.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Todos" ||
      (filterStatus === "Concluídas" && h.status === "concluida") ||
      (filterStatus === "Canceladas" && h.status === "cancelada");
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Histórico de substituições</h1>
        <p className="text-sm text-slate-500 mt-1">Todas as substituições realizadas pela plataforma</p>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por professor, disciplina..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {["Todos", "Concluídas", "Canceladas"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === s ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold text-slate-700">Nenhum resultado encontrado</p>
            <p className="text-sm text-slate-400 mt-1">Tente outros termos de busca.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Professor", "Disciplina", "Turma", "Data", "Horário", "Avaliação", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-800 text-sm">{r.professor}</td>
                  <td className="px-5 py-4 text-slate-600 text-sm">{r.disciplina}</td>
                  <td className="px-5 py-4 text-slate-600 text-sm">{r.turma}</td>
                  <td className="px-5 py-4 text-slate-600 text-sm">{r.data}</td>
                  <td className="px-5 py-4 text-slate-600 text-sm">{r.horario}</td>
                  <td className="px-5 py-4"><MiniStars nota={r.avaliacao} /></td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.status === "concluida" ? "bg-slate-100 text-slate-600" : "bg-red-100 text-red-600"}`}>
                      {r.status === "concluida" ? "Concluída" : "Cancelada"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
