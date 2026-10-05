import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, SubRequest } from "../../store/AppContext";

function Stars({ nota }: { nota: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 20 20" fill={i <= Math.round(nota) ? "#F59E0B" : "#E2E8F0"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  amber: "bg-amber-100 text-amber-700",
};

export default function SearchTeachers() {
  const navigate = useNavigate();
  const { teachers, requests, inviteTeacher } = useApp();
  const [search, setSearch] = useState("");
  const [filterDisciplina, setFilterDisciplina] = useState("");
  const [filterAvail, setFilterAvail] = useState(false);
  const [sortBy, setSortBy] = useState("nota");
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [invitedId, setInvitedId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const openRequests = requests.filter((r) => r.status === "aberta");
  const selectedRequest = openRequests.find((r) => r.id === selectedRequestId);

  const filtered = teachers
    .filter((t) => {
      if (filterAvail && !t.disponivel) return false;
      if (filterDisciplina && !t.disciplinas.includes(filterDisciplina)) return false;
      if (search && !t.nome.toLowerCase().includes(search.toLowerCase()) && !t.disciplinas.join(" ").toLowerCase().includes(search.toLowerCase())) return false;
      // Hide teachers already declined for selected request
      if (selectedRequest && selectedRequest.recusadoPorIds.includes(t.id)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "nota") return b.nota - a.nota;
      if (sortBy === "subs") return b.subs - a.subs;
      return parseFloat(a.distancia) - parseFloat(b.distancia);
    });

  const allDisciplinas = Array.from(new Set(teachers.flatMap((t) => t.disciplinas))).sort();

  const handleInvite = (teacherId: string, teacherNome: string) => {
    if (!selectedRequestId) {
      alert("Selecione primeiro qual solicitação você quer preencher.");
      return;
    }
    inviteTeacher(selectedRequestId, teacherId, teacherNome);
    setInvitedId(teacherId);
    setSuccess(`Convite enviado para ${teacherNome}! Aguardando resposta.`);
    setTimeout(() => navigate("/instituicao/solicitacoes"), 2000);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Buscar professores</h1>
        <p className="text-sm text-slate-500 mt-1">Encontre professores disponíveis e envie convites</p>
      </div>

      {success && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-green-600 text-xl">✅</span>
          <p className="text-sm font-semibold text-green-800">{success}</p>
        </div>
      )}

      {/* Select request */}
      {openRequests.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-2">Qual solicitação deseja preencher?</p>
          <select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-blue-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecione uma solicitação aberta...</option>
            {openRequests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.disciplina} · {r.turma || r.nivel} · {r.data ? new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR") : ""} · {r.horarioInicio}–{r.horarioFim}
              </option>
            ))}
          </select>
        </div>
      )}

      {openRequests.length === 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-500 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Nenhuma solicitação aberta</p>
            <p className="text-xs text-amber-700 mt-0.5">Crie uma solicitação antes de convidar professores.</p>
            <button onClick={() => navigate("/instituicao/solicitar")} className="text-xs text-blue-600 font-semibold hover:underline mt-1">
              Criar solicitação →
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Filters */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Filtros</h3>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Busca</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome ou disciplina..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Disciplina</label>
              <select value={filterDisciplina} onChange={(e) => setFilterDisciplina(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Todas</option>
                {allDisciplinas.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={filterAvail} onChange={(e) => setFilterAvail(e.target.checked)} className="accent-blue-600" />
              <span className="text-sm text-slate-700">Apenas disponíveis</span>
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">{filtered.length} professor(es)</p>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {[{ v: "nota", l: "Melhor avaliação" }, { v: "subs", l: "Mais substituições" }, { v: "dist", l: "Mais próximo" }].map(({ v, l }) => (
                <button key={v} onClick={() => setSortBy(v)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${sortBy === v ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{l}</button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold text-slate-700">Nenhum professor encontrado</p>
              <p className="text-sm text-slate-400 mt-1">Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((t) => {
                const alreadyInvited = invitedId === t.id ||
                  (selectedRequest?.professorConvidadoId === t.id && selectedRequest?.status === "aguardando");
                return (
                  <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                    <div className="flex gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${colorMap[t.cor]}`}>
                        {t.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-800">{t.nome}</h3>
                              {t.verificado && <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">✓ Verificado</span>}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{t.formacao}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full inline-block mr-1 ${t.disponivel ? "bg-green-400" : "bg-slate-300"}`} />
                            <span className={`text-xs font-medium ${t.disponivel ? "text-green-600" : "text-slate-400"}`}>
                              {t.disponivel ? "Disponível" : "Indisponível"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <div className="flex items-center gap-1"><Stars nota={t.nota} /><span className="text-xs font-semibold text-slate-700 ml-1">{t.nota}</span></div>
                          <span className="text-xs text-slate-500">📚 {t.experiencia} anos</span>
                          <span className="text-xs text-slate-500">📍 {t.distancia}</span>
                          <span className="text-xs text-slate-500">🔄 {t.subs} substituições</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {t.disciplinas.map((d) => (
                            <span key={d} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-lg">{d}</span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => navigate(`/instituicao/professor/${t.id}`)} className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-3 py-2 rounded-xl transition-all">
                            Ver perfil
                          </button>
                          {t.disponivel && !alreadyInvited && (
                            <button
                              onClick={() => handleInvite(t.id, t.nome)}
                              disabled={!selectedRequestId}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
                            >
                              {!selectedRequestId ? "Selecione uma solicitação" : "Convidar para substituição"}
                            </button>
                          )}
                          {alreadyInvited && (
                            <span className="text-xs text-blue-600 font-semibold px-3 py-2 bg-blue-50 rounded-xl">
                              ✓ Convite enviado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
