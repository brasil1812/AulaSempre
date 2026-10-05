import { NavLink } from "react-router-dom";
import { useApp } from "../store/AppContext";

const navItems = [
  { to: "/instituicao", label: "Início", end: true, icon: HomeIcon },
  { to: "/instituicao/solicitar", label: "Solicitar substituição", icon: PlusIcon },
  { to: "/instituicao/solicitacoes", label: "Minhas solicitações", icon: ClipboardIcon },
  { to: "/instituicao/professores", label: "Buscar professores", icon: SearchIcon },
  { to: "/instituicao/historico", label: "Histórico", icon: HistoryIcon },
  { to: "/instituicao/notificacoes", label: "Notificações", icon: BellIcon },
];

export default function InstitutionSidebar() {
  const { currentInstitution, requests } = useApp();
  const pendingCount = requests.filter((r) => r.status === "aguardando" || r.status === "aberta").length;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm flex-shrink-0">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm leading-none block">AulaSempre</span>
            <span className="text-xs text-slate-400 leading-none">Área da Instituição</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} />
                <span className="flex-1">{label}</span>
                {label === "Minhas solicitações" && pendingCount > 0 && (
                  <span className="bg-amber-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-sm">
            CH
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{currentInstitution.nome}</p>
            <p className="text-xs text-slate-400">Coordenação Pedagógica</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HomeIcon({ className = "" }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
}
function PlusIcon({ className = "" }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
}
function ClipboardIcon({ className = "" }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>;
}
function SearchIcon({ className = "" }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>;
}
function HistoryIcon({ className = "" }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
}
function BellIcon({ className = "" }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;
}
