import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp } from "../../store/AppContext";

const reviews = [
  { escola: "Colégio Santa Maria", nota: 5, texto: "Professora muito pontual e comprometida. Os alunos adoraram!", data: "15/08/2026" },
  { escola: "Instituto Paulo Freire", nota: 5, texto: "Ótima didática, domínio total do conteúdo. Recomendo.", data: "02/08/2026" },
  { escola: "Escola Dom Pedro II", nota: 4, texto: "Muito bom profissional. Aula excelente e bem preparada.", data: "20/07/2026" },
];

function Stars({ nota, size = 14 }: { nota: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= Math.round(nota) ? "#F59E0B" : "#E2E8F0"}>
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
};

export default function TeacherDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { teachers, requests, inviteTeacher } = useApp();
  const teacher = teachers.find((t) => t.id === id);
  const [inviting, setInviting] = useState(false);
  const [selectedReq, setSelectedReq] = useState("");
  const [done, setDone] = useState(false);

  if (!teacher) return <div className="p-8 text-slate-500">Professor não encontrado.</div>;

  const openRequests = requests.filter((r) => r.status === "aberta");

  const handleInvite = () => {
    if (!selectedReq) return;
    inviteTeacher(selectedReq, teacher.id, teacher.nome);
    setDone(true);
    setTimeout(() => navigate("/instituicao/solicitacoes"), 2000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-6">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L7.414 8l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
        Voltar
      </button>

      {done && (
        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-green-600 text-xl">✅</span>
          <p className="text-sm font-semibold text-green-800">Convite enviado com sucesso! Aguardando resposta de {teacher.nome}.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 ${colorMap[teacher.cor]}`}>
              {teacher.initials}
            </div>
            <h1 className="text-lg font-bold text-slate-800">{teacher.nome}</h1>
            {teacher.verificado && <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">✓ Perfil verificado</span>}
            <div className="flex items-center justify-center gap-2 mt-3">
              <Stars nota={teacher.nota} size={16} />
              <span className="font-bold text-slate-800">{teacher.nota}</span>
            </div>
            <p className="text-xs text-slate-400">{teacher.subs} substituições</p>

            <div className={`rounded-xl py-2 px-4 mt-4 ${teacher.disponivel ? "bg-green-50" : "bg-slate-50"}`}>
              <span className={`text-sm font-medium ${teacher.disponivel ? "text-green-700" : "text-slate-500"}`}>
                {teacher.disponivel ? "🟢 Disponível" : "⭕ Indisponível"}
              </span>
            </div>

            <div className="border-t border-slate-100 mt-4 pt-4 space-y-2 text-sm text-left">
              <div className="flex justify-between"><span className="text-slate-400">Distância</span><span className="font-medium">~{teacher.distancia}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Cidade</span><span className="font-medium">{teacher.cidade}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Experiência</span><span className="font-medium">{teacher.experiencia} anos</span></div>
            </div>

            <div className="mt-4 space-y-2">
              {!inviting && !done && teacher.disponivel && openRequests.length > 0 && (
                <button onClick={() => setInviting(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm">
                  Convidar para substituição
                </button>
              )}
              {inviting && !done && (
                <div className="space-y-2">
                  <select value={selectedReq} onChange={(e) => setSelectedReq(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selecione a solicitação</option>
                    {openRequests.map((r) => (
                      <option key={r.id} value={r.id}>{r.disciplina} · {new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")}</option>
                    ))}
                  </select>
                  <button onClick={handleInvite} disabled={!selectedReq} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-xl transition-all text-sm">
                    Confirmar convite
                  </button>
                  <button onClick={() => setInviting(false)} className="w-full text-slate-500 hover:text-slate-700 text-sm py-1">Cancelar</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-3">Sobre</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{teacher.bio}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Formação e especialidades</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Formação</p>
                <p className="text-sm text-slate-700">{teacher.formacao}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Disciplinas</p>
                <div className="flex flex-wrap gap-1">
                  {teacher.disciplinas.map((d) => <span key={d} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-lg">{d}</span>)}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Níveis</p>
                <div className="flex flex-wrap gap-1">
                  {teacher.niveis.map((n) => <span key={n} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-lg">{n}</span>)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Avaliações de instituições</h2>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{r.escola}</p>
                      <Stars nota={r.nota} size={12} />
                    </div>
                    <span className="text-xs text-slate-400">{r.data}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{r.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
