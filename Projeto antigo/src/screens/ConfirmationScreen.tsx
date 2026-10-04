import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ConfirmationScreen() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratings, setRatings] = useState({ geral: 0, pontualidade: 0, didatica: 0, profissionalismo: 0, conteudo: 0 });
  const [comment, setComment] = useState("");
  const [ratingDone, setRatingDone] = useState(false);

  const StarSelect = ({ field, label }: { field: keyof typeof ratings; label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            onClick={() => setRatings((r) => ({ ...r, [field]: i }))}
            className="transition-transform hover:scale-110"
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill={i <= ratings[field] ? "#F59E0B" : "#E2E8F0"}>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );

  if (confirmed) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Substituição confirmada!</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            O professor <strong>Carlos Mendes</strong> recebeu todas as informações da aula e foi notificado por e-mail e SMS.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 text-left text-sm space-y-2 mb-8">
            {[
              ["Professor", "Carlos Mendes"],
              ["Disciplina", "Matemática"],
              ["Turma", "9º Ano A"],
              ["Data", "28/08/2026"],
              ["Horário", "13:30 – 15:10"],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-slate-400">{l}</span>
                <span className="font-semibold text-slate-800">{v}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/solicitacoes")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Ver minhas solicitações
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-xl transition-all text-sm"
            >
              Voltar ao início
            </button>
          </div>
        </div>

        {/* Rating modal */}
        {showRating && !ratingDone && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="font-bold text-lg text-slate-800 mb-1">Avaliar substituição</h3>
              <p className="text-sm text-slate-500 mb-5">Como foi a substituição de Carlos Mendes?</p>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center font-bold text-blue-700">CM</div>
                <div>
                  <p className="font-semibold text-slate-800">Carlos Mendes</p>
                  <p className="text-xs text-slate-500">Matemática · 9º Ano A · 28/08/2026</p>
                </div>
              </div>
              <div className="space-y-4 mb-5">
                <StarSelect field="geral" label="Avaliação geral" />
                <StarSelect field="pontualidade" label="Pontualidade" />
                <StarSelect field="didatica" label="Didática" />
                <StarSelect field="profissionalismo" label="Profissionalismo" />
                <StarSelect field="conteudo" label="Domínio do conteúdo" />
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Deixe um comentário sobre a substituição..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowRating(false)} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-2.5 rounded-xl text-sm transition-all">Cancelar</button>
                <button onClick={() => { setRatingDone(true); setShowRating(false); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all">Enviar avaliação</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <button onClick={() => navigate("/buscar")} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-6">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L7.414 8l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Voltar aos resultados
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">Confirmar substituição</h1>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-xl font-bold text-blue-700">CM</div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800">Carlos Mendes</h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">✓ Verificado</span>
            </div>
            <p className="text-sm text-slate-500">⭐ 4.9 · 34 substituições</p>
          </div>
          <span className="ml-auto bg-green-100 text-green-700 text-sm font-bold px-3 py-1.5 rounded-xl">98% compatível</span>
        </div>

        <div className="space-y-3">
          {[
            ["📚 Disciplina", "Matemática"],
            ["🏫 Turma", "9º Ano A"],
            ["🏢 Instituição", "Colégio São Paulo"],
            ["📅 Data", "28 de agosto de 2026 (hoje)"],
            ["🕐 Horário", "13:30 – 15:10 (2 aulas)"],
            ["💰 Valor", "R$ 120,00"],
            ["📝 Observações", "Levar exercícios de revisão para a Prova Bimestral"],
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-400">{label}</span>
              <span className="text-sm font-semibold text-slate-800 text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5 flex items-start gap-3">
        <span className="text-amber-500 text-lg">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">Atenção</p>
          <p className="text-xs text-amber-700 mt-0.5">Após a confirmação, o professor será notificado imediatamente. Cancelamentos realizados com menos de 2 horas de antecedência podem gerar penalidades.</p>
        </div>
      </div>

      <button
        onClick={() => setConfirmed(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
      >
        Confirmar substituição
      </button>
      <button
        onClick={() => navigate("/buscar")}
        className="w-full mt-3 text-slate-500 hover:text-slate-700 font-medium py-3 rounded-xl transition-all text-sm"
      >
        Cancelar
      </button>
    </div>
  );
}
