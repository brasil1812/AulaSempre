import { useState } from "react";
import { useNavigate } from "react-router-dom";

const teachers = [
  {
    id: 1, nome: "Carlos Mendes", disciplina: "Matemática", formacao: "Licenciatura em Matemática – USP",
    experiencia: 8, distancia: "2,3 km", disponivel: true, nota: 4.9, subs: 34, compat: 98, verificado: true,
    foto: "CM", cor: "blue",
  },
  {
    id: 2, nome: "Ana Figueiredo", disciplina: "Matemática", formacao: "Mestre em Educação Matemática – Unicamp",
    experiencia: 12, distancia: "4,1 km", disponivel: true, nota: 4.8, subs: 28, compat: 95, verificado: true,
    foto: "AF", cor: "purple",
  },
  {
    id: 3, nome: "Roberto Lima", disciplina: "Matemática", formacao: "Licenciatura em Matemática – UNESP",
    experiencia: 5, distancia: "6,7 km", disponivel: true, nota: 4.6, subs: 15, compat: 87, verificado: true,
    foto: "RL", cor: "green",
  },
  {
    id: 4, nome: "Fernanda Souza", disciplina: "Matemática", formacao: "Licenciatura em Matemática – UNIFESP",
    experiencia: 3, distancia: "9,2 km", disponivel: false, nota: 4.4, subs: 9, compat: 78, verificado: false,
    foto: "FS", cor: "amber",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
};

function Stars({ nota }: { nota: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 20 20" fill={i <= Math.round(nota) ? "#F59E0B" : "#E2E8F0"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default function SearchScreen() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("compat");
  const [filterAvail, setFilterAvail] = useState(false);
  const [invitedId, setInvitedId] = useState<number | null>(null);

  const sorted = [...teachers]
    .filter((t) => !filterAvail || t.disponivel)
    .sort((a, b) => {
      if (sortBy === "compat") return b.compat - a.compat;
      if (sortBy === "nota") return b.nota - a.nota;
      return parseFloat(a.distancia) - parseFloat(b.distancia);
    });

  return (
    <div className="p-8">
      <div className="mb-6">
        <button onClick={() => navigate("/criar-solicitacao")} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L7.414 8l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Voltar à solicitação
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Professores disponíveis</h1>
            <p className="text-slate-500 text-sm mt-1">
              <span className="text-green-600 font-semibold">3 professores disponíveis</span> para Matemática · 9º Ano A · Hoje, 13:30 – 15:10
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <div className="w-56 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Filtros</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Disponibilidade</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterAvail}
                    onChange={(e) => setFilterAvail(e.target.checked)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-slate-700">Apenas disponíveis</span>
                </label>
              </div>

              {[
                { label: "Avaliação mínima", options: ["Qualquer", "4.0+", "4.5+", "4.8+"] },
                { label: "Distância máxima", options: ["Qualquer", "5 km", "10 km", "20 km"] },
                { label: "Experiência", options: ["Qualquer", "1+ anos", "3+ anos", "5+ anos"] },
              ].map(({ label, options }) => (
                <div key={label}>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">{label}</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">{sorted.length} resultado(s)</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Ordenar por:</span>
              {[
                { value: "compat", label: "Melhor compatibilidade" },
                { value: "nota", label: "Melhor avaliação" },
                { value: "dist", label: "Menor distância" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
                    sortBy === value ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {sorted.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all">
                <div className="flex gap-5">
                  {/* Avatar */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${colorMap[t.cor]}`}>
                    {t.foto}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-800">{t.nome}</h3>
                          {t.verificado && (
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                              ✓ Perfil verificado
                            </span>
                          )}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.compat >= 90 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                            {t.compat}% compatível
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{t.formacao}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full inline-block mr-1 ${t.disponivel ? "bg-green-400" : "bg-slate-300"}`} />
                        <span className={`text-xs font-medium ${t.disponivel ? "text-green-600" : "text-slate-400"}`}>
                          {t.disponivel ? "Disponível" : "Indisponível"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 mt-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Stars nota={t.nota} />
                        <span className="text-sm font-semibold text-slate-700">{t.nota}</span>
                      </div>
                      <span className="text-sm text-slate-500">📚 {t.experiencia} anos de experiência</span>
                      <span className="text-sm text-slate-500">📍 {t.distancia}</span>
                      <span className="text-sm text-slate-500">🔄 {t.subs} substituições</span>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => navigate(`/professor/${t.id}`)}
                        className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-xl transition-all"
                      >
                        Ver perfil
                      </button>
                      {t.disponivel && (
                        <button
                          onClick={() => { setInvitedId(t.id); navigate("/confirmacao"); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                        >
                          Convidar para substituição
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
