import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";

export default function DemoBar() {
  const { role, setRole, resetData, currentTeacher, currentInstitution } = useApp();
  const navigate = useNavigate();

  const switchTo = () => {
    if (role === "instituicao") {
      setRole("professor");
      navigate("/professor");
    } else {
      setRole("instituicao");
      navigate("/instituicao");
    }
  };

  const handleReset = () => {
    if (confirm("Restaurar dados iniciais? Todas as alterações serão perdidas.")) {
      resetData();
      window.location.reload();
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between gap-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
        <span className="text-slate-400">Demonstração acadêmica</span>
        <span className="text-slate-600">·</span>
        <span>
          Perfil atual:{" "}
          <strong className="text-white">
            {role === "instituicao" ? currentInstitution.nome : currentTeacher.nome}
          </strong>
          <span className="text-slate-400 ml-1">({role === "instituicao" ? "instituição" : "professor"})</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={switchTo}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-lg transition-all text-xs"
        >
          Alternar para {role === "instituicao" ? "professor" : "instituição"}
        </button>
        <button
          onClick={handleReset}
          className="text-slate-400 hover:text-white transition-colors text-xs"
        >
          Restaurar dados
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-slate-400 hover:text-white transition-colors text-xs"
        >
          Página inicial
        </button>
      </div>
    </div>
  );
}
