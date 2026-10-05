import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../store/AppContext";

export default function ProfileChoice() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setRole, resetData } = useApp();

  useEffect(() => {
    const p = params.get("perfil");
    if (p === "instituicao") { setRole("instituicao"); navigate("/instituicao"); }
    else if (p === "professor") { setRole("professor"); navigate("/professor"); }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white" />
              </svg>
            </div>
            <span className="font-bold text-2xl text-slate-800">Aula<span className="text-blue-600">Sempre</span></span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Demonstração</h1>
          <p className="text-slate-500 text-sm">Escolha com qual perfil deseja explorar o sistema</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => { setRole("instituicao"); navigate("/instituicao"); }}
            className="w-full bg-white border-2 border-slate-100 hover:border-blue-400 rounded-2xl p-6 text-left transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-600 rounded-xl flex items-center justify-center text-2xl transition-all">
                🏫
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">Sou uma instituição</h3>
                <p className="text-sm text-slate-500 mt-0.5">Acesse como Colégio Horizonte · Busque e contrate professores</p>
              </div>
              <svg className="ml-auto text-slate-300 group-hover:text-blue-600 transition-colors" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => { setRole("professor"); navigate("/professor"); }}
            className="w-full bg-white border-2 border-slate-100 hover:border-green-400 rounded-2xl p-6 text-left transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 group-hover:bg-green-600 rounded-xl flex items-center justify-center text-2xl transition-all">
                👩‍🏫
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-green-700 transition-colors">Sou professor</h3>
                <p className="text-sm text-slate-500 mt-0.5">Acesse como Ana Figueiredo · Receba e responda convites</p>
              </div>
              <svg className="ml-auto text-slate-300 group-hover:text-green-600 transition-colors" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Voltar à página inicial
          </button>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
          <p className="text-xs text-amber-700">
            🎓 Esta é uma versão de demonstração acadêmica com dados fictícios.
            Os dados são salvos localmente neste navegador.
          </p>
          <button
            onClick={() => { resetData(); window.location.reload(); }}
            className="text-xs text-amber-600 font-semibold hover:underline mt-2"
          >
            Restaurar dados iniciais
          </button>
        </div>
      </div>
    </div>
  );
}
