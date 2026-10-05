import { useState } from "react";
import { useNavigate } from "react-router-dom";

const reviews = [
  { escola: "Colégio Santa Maria", nota: 5, texto: "Professor extremamente pontual e comprometido. Os alunos adoraram a aula!", data: "15/08/2026", avatar: "SM" },
  { escola: "Instituto Educacional Paulo Freire", nota: 5, texto: "Ótima didática, domínio total do conteúdo. Recomendo muito.", data: "02/08/2026", avatar: "PF" },
  { escola: "Escola Estadual Dom Pedro II", nota: 4, texto: "Muito bom profissional. Chegou alguns minutos após o horário, mas a aula foi excelente.", data: "20/07/2026", avatar: "DP" },
];

function Stars({ nota, size = 14 }: { nota: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= Math.round(nota) ? "#F59E0B" : "#E2E8F0"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-32">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
        <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-700 w-6">{value.toFixed(1)}</span>
    </div>
  );
}

export default function TeacherProfileScreen() {
  const navigate = useNavigate();
  const [favorito, setFavorito] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate("/buscar")} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-6">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L7.414 8l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Voltar aos resultados
      </button>

      <div className="grid grid-cols-3 gap-6">
        {/* Left col */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-blue-700 mx-auto mb-4">
              CM
            </div>
            <h1 className="text-lg font-bold text-slate-800">Carlos Mendes</h1>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">✓ Perfil verificado</span>
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
              <Stars nota={4.9} size={16} />
              <span className="text-lg font-bold text-slate-800">4.9</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">34 avaliações</p>

            <div className="bg-green-50 rounded-xl py-2 px-4 mt-4">
              <div className="w-2 h-2 bg-green-400 rounded-full inline-block mr-1" />
              <span className="text-sm text-green-700 font-medium">Disponível agora</span>
            </div>

            <div className="border-t border-slate-100 mt-5 pt-5 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Substituições</span>
                <span className="font-semibold">34</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Localização</span>
                <span className="font-semibold">~2,3 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Experiência</span>
                <span className="font-semibold">8 anos</span>
              </div>
            </div>

            <div className="space-y-2 mt-5">
              <button
                onClick={() => navigate("/confirmacao")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                Convidar para esta substituição
              </button>
              <button
                onClick={() => setFavorito(!favorito)}
                className={`w-full border-2 font-semibold py-2.5 rounded-xl transition-all text-sm ${
                  favorito
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {favorito ? "★ Nos favoritos" : "☆ Adicionar aos favoritos"}
              </button>
            </div>
          </div>

          {/* Certificados */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Certificados</h3>
            <div className="space-y-2">
              {["Licenciatura em Matemática – USP", "Curso de Didática Avançada", "Inglês instrumental"].map((c) => (
                <div key={c} className="flex items-start gap-2">
                  <span className="text-green-500 text-sm mt-0.5">✓</span>
                  <span className="text-xs text-slate-600">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="col-span-2 space-y-5">
          {/* Bio */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-3">Sobre</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Professor de Matemática com 8 anos de experiência no Ensino Fundamental II e Ensino Médio. Especializado em preparação para vestibular e ENEM. Tenho metodologia dinâmica e adaptável, com foco na aprendizagem significativa e no engajamento dos alunos. Disponível para substituições de curto e longo prazo.
            </p>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Formação e especialidades</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Formação acadêmica</p>
                <p className="text-sm text-slate-700">Licenciatura em Matemática</p>
                <p className="text-xs text-slate-400">Universidade de São Paulo – USP, 2016</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Disciplinas</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Matemática", "Estatística", "Física (básico)"].map((d) => (
                    <span key={d} className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-lg">{d}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Níveis de ensino</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Fund. II", "Ensino Médio"].map((n) => (
                    <span key={n} className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-1 rounded-lg">{n}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Disponibilidade</p>
                <p className="text-sm text-slate-700">Segunda a sexta</p>
                <p className="text-xs text-slate-400">07:00 – 19:00</p>
              </div>
            </div>
          </div>

          {/* Avaliações */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Avaliações de instituições</h2>
            <div className="space-y-2 mb-5">
              <RatingBar label="Pontualidade" value={5.0} />
              <RatingBar label="Didática" value={4.9} />
              <RatingBar label="Profissionalismo" value={4.9} />
              <RatingBar label="Domínio do conteúdo" value={5.0} />
            </div>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                        {r.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{r.escola}</p>
                        <Stars nota={r.nota} size={12} />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{r.data}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
