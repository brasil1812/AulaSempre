import { useNavigate } from "react-router-dom";

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white" />
          <path d="M6 9L8.5 11.5L12.5 7" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className={`font-bold text-xl tracking-tight ${dark ? "text-white" : "text-slate-800"}`}>
        Aula<span className="text-blue-600">Sempre</span>
      </span>
    </div>
  );
}

const steps = [
  {
    num: "1",
    title: "Solicite a substituição",
    desc: "Informe disciplina, data, horário e nível de ensino. O sistema notifica professores disponíveis na sua região.",
    icon: "📋",
  },
  {
    num: "2",
    title: "Encontre o professor ideal",
    desc: "Veja perfis verificados, avaliações de outras escolas, experiência e compatibilidade com a sua necessidade.",
    icon: "🔍",
  },
  {
    num: "3",
    title: "Confirme e acompanhe",
    desc: "Envie o convite, receba a confirmação e acompanhe tudo pelo painel. Professor e escola recebem todos os detalhes.",
    icon: "✅",
  },
];

const institutionBenefits = [
  "Professores disponíveis na sua cidade",
  "Perfis verificados com avaliações reais",
  "Fluxo rápido — solicitação em menos de 3 minutos",
  "Histórico e avaliações de todas as substituições",
  "Sem cancelamento de aulas por falta de professor",
];

const teacherBenefits = [
  "Receba convites para substituições próximas a você",
  "Escolha aceitar ou recusar cada convite",
  "Acumule avaliações e fortaleça seu perfil",
  "Flexibilidade de horário e modalidade",
  "Renda extra sem compromisso fixo",
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/entrar")}
              className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors px-3 py-2"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Experimentar demonstração
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Plataforma de substituição para escolas privadas
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Imprevistos acontecem.<br />
              <span className="text-blue-100">As aulas podem continuar.</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
              O AulaSempre conecta escolas e faculdades privadas a professores qualificados e disponíveis para substituições temporárias — em minutos, não em horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/demo?perfil=instituicao")}
                className="bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-base"
              >
                Sou uma instituição
              </button>
              <button
                onClick={() => navigate("/demo?perfil=professor")}
                className="bg-blue-500/40 border-2 border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-500/60 transition-all text-base"
              >
                Sou professor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Como funciona</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Em três etapas simples, a escola resolve uma ausência inesperada e o professor encontra uma oportunidade.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg mb-5">
                  {s.num}
                </div>
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Para quem é o AulaSempre</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Instituição */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl">🏫</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Para instituições</h3>
                  <p className="text-sm text-slate-500">Escolas e faculdades privadas</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {institutionBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold mt-0.5">✓</span>
                    <span className="text-slate-700 text-sm">{b}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/demo?perfil=instituicao")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Sou uma instituição →
              </button>
            </div>

            {/* Professor */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-2xl">👩‍🏫</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Para professores</h3>
                  <p className="text-sm text-slate-500">Licenciados disponíveis para substituições</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {teacherBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-0.5">✓</span>
                    <span className="text-slate-700 text-sm">{b}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/demo?perfil=professor")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Sou professor →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-blue-700">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Explore a demonstração completa</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Sem cadastro. Navegue pelo protótipo completo com dados de exemplo e veja o fluxo de ponta a ponta.
          </p>
          <button
            onClick={() => navigate("/demo")}
            className="bg-white text-blue-700 font-bold px-10 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-base"
          >
            Experimentar demonstração
          </button>
          <p className="text-blue-200 text-xs mt-4">
            Dados fictícios. Nenhuma informação real é coletada.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-white">
              Aula<span className="text-blue-400">Sempre</span>
            </span>
          </div>
          <p className="text-sm">
            Protótipo acadêmico — versão de demonstração. Não há serviço real em operação.
          </p>
          <div className="flex gap-6 text-sm">
            <button onClick={() => navigate("/demo?perfil=instituicao")} className="hover:text-white transition-colors">Sou instituição</button>
            <button onClick={() => navigate("/demo?perfil=professor")} className="hover:text-white transition-colors">Sou professor</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
