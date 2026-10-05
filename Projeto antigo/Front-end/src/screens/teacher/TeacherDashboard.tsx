import { useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppContext";

function fmt(data: string) {
  if (!data) return "—";
  const [y, m, d] = data.split("-");
  return `${d}/${m}/${y}`;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { requests, currentTeacher } = useApp();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const myInvites = requests.filter((r) => r.status === "aguardando" && r.professorConvidadoId === currentTeacher.id);
  const myConfirmed = requests.filter((r) => r.status === "confirmada" && r.professorConfirmadoId === currentTeacher.id);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">{greeting}, {currentTeacher.nome}!</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span className="text-2xl block mb-2">✉️</span>
          <p className="text-3xl font-bold text-slate-800 mb-1">{myInvites.length}</p>
          <p className="text-sm text-slate-500">Convites recebidos</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span className="text-2xl block mb-2">✅</span>
          <p className="text-3xl font-bold text-slate-800 mb-1">{myConfirmed.length}</p>
          <p className="text-sm text-slate-500">Substituições confirmadas</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <span className="text-2xl block mb-2">⭐</span>
          <p className="text-3xl font-bold text-slate-800 mb-1">{currentTeacher.nota}</p>
          <p className="text-sm text-slate-500">Avaliação média</p>
        </div>
      </div>

      {/* Convites pendentes */}
      {myInvites.length > 0 && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{myInvites.length}</div>
            <h2 className="font-semibold text-slate-800">Convite{myInvites.length > 1 ? "s" : ""} aguardando sua resposta</h2>
          </div>
          <div className="space-y-3">
            {myInvites.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{r.disciplina} · {r.turma || r.nivel}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {r.instituicaoNome} · {fmt(r.data)} · {r.horarioInicio}–{r.horarioFim} · R$ {r.valor}
                  </p>
                </div>
                <button onClick={() => navigate("/professor/convites")} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all">
                  Ver convite
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmadas */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Substituições confirmadas</h2>
          <button onClick={() => navigate("/professor/confirmadas")} className="text-xs text-blue-600 font-medium hover:underline">Ver todas</button>
        </div>
        {myConfirmed.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-sm text-slate-500">Nenhuma substituição confirmada ainda.</p>
            {myInvites.length === 0 && <p className="text-xs text-slate-400 mt-1">Aguarde convites de instituições.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {myConfirmed.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{r.disciplina} · {r.turma || r.nivel}</p>
                  <p className="text-xs text-slate-500">{r.instituicaoNome} · {fmt(r.data)} · {r.horarioInicio}–{r.horarioFim}</p>
                </div>
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Confirmada</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
