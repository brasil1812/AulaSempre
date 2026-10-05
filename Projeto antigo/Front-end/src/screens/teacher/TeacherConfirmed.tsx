import { useApp } from "../../store/AppContext";

function fmt(data: string) {
  if (!data) return "—";
  const [y, m, d] = data.split("-");
  return `${d}/${m}/${y}`;
}

export default function TeacherConfirmed() {
  const { requests, currentTeacher } = useApp();
  const confirmed = requests.filter((r) => r.status === "confirmada" && r.professorConfirmadoId === currentTeacher.id);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Substituições confirmadas</h1>
        <p className="text-sm text-slate-500 mt-1">Todas as substituições que você confirmou</p>
      </div>

      {confirmed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="font-semibold text-slate-700 mb-1">Nenhuma substituição confirmada</h3>
          <p className="text-sm text-slate-400">Aceite convites para ver as substituições confirmadas aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {confirmed.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-green-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">{r.disciplina}</h3>
                  <p className="text-sm text-slate-500">{r.turma || r.nivel} · {r.instituicaoNome}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">✓ Confirmada</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["📅 Data", fmt(r.data)],
                  ["🕐 Horário", `${r.horarioInicio} – ${r.horarioFim}`],
                  ["📍 Local", r.modalidade === "presencial" ? r.cidade : "Online"],
                  ["💰 Valor", `R$ ${r.valor}`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
              {r.observacoes && (
                <div className="mt-3 bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-0.5">📝 Observações</p>
                  <p className="text-sm text-slate-700">{r.observacoes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
