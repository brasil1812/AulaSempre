import { useNavigate } from "react-router-dom";
import { useApp } from "../../store/AppContext";

function fmt(data: string) {
  if (!data) return "—";
  const [y, m, d] = data.split("-");
  return `${d}/${m}/${y}`;
}

export default function TeacherInvites() {
  const navigate = useNavigate();
  const { requests, currentTeacher, acceptInvite, declineInvite } = useApp();

  const myInvites = requests.filter(
    (r) => r.professorConvidadoId === currentTeacher.id && (r.status === "aguardando" || r.status === "confirmada" || r.status === "aberta")
  );
  const pending = myInvites.filter((r) => r.status === "aguardando");
  const others = myInvites.filter((r) => r.status !== "aguardando");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Convites recebidos</h1>
        <p className="text-sm text-slate-500 mt-1">Aceite ou recuse convites de substituição</p>
      </div>

      {pending.length === 0 && others.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h3 className="font-semibold text-slate-700 mb-1">Nenhum convite recebido</h3>
          <p className="text-sm text-slate-400">Quando uma escola te convidar, o convite aparecerá aqui.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Aguardando sua resposta ({pending.length})</h2>
              <div className="space-y-4">
                {pending.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{r.disciplina}</h3>
                        <p className="text-slate-500 text-sm">{r.turma || r.nivel}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">Novo convite</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        ["🏢 Instituição", r.instituicaoNome],
                        ["📅 Data", fmt(r.data)],
                        ["🕐 Horário", `${r.horarioInicio} – ${r.horarioFim}`],
                        ["📍 Modalidade", r.modalidade === "presencial" ? `Presencial – ${r.cidade}` : "Online"],
                        ["💰 Valor", `R$ ${r.valor}`],
                        ...(r.turma ? [["👥 Turma", r.turma] as [string, string]] : []),
                      ].map(([label, value]) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                          <p className="text-sm font-semibold text-slate-800">{value}</p>
                        </div>
                      ))}
                    </div>

                    {r.observacoes && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                        <p className="text-xs text-slate-500 mb-0.5">📝 Observações da instituição</p>
                        <p className="text-sm text-slate-700">{r.observacoes}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => { declineInvite(r.id); }}
                        className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-xl transition-all text-sm"
                      >
                        Recusar convite
                      </button>
                      <button
                        onClick={() => { acceptInvite(r.id); }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm text-sm"
                      >
                        Aceitar convite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {others.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Histórico de convites</h2>
              <div className="space-y-3">
                {others.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{r.disciplina} · {r.turma || r.nivel}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{r.instituicaoNome} · {fmt(r.data)}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.status === "confirmada" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                        {r.status === "confirmada" ? "Aceito ✓" : "Recusado"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
