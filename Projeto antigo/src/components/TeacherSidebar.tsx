import { NavLink } from "react-router-dom";
import { useApp } from "../store/AppContext";

const navItems = [
  { to: "/professor", label: "Início", end: true, icon: HomeIcon },
  { to: "/professor/convites", label: "Convites recebidos", icon: MailIcon },
  { to: "/professor/confirmadas", label: "Confirmadas", icon: CheckIcon },
  { to: "/professor/historico", label: "Histórico", icon: HistoryIcon },
];

export default function TeacherSidebar() {
  const { currentTeacher, requests } = useApp();
  const newInvites = requests.filter(
    (r) => r.status === "aguardando" && r.professorConvidadoId === currentTeacher.id
  ).length;

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm flex-shrink-0">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm leading-none block">AulaSempre</span>
            <span className="text-xs text-slate-400 leading-none">Área do Professor</span>
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
                isActive ? "bg-green-50 text-green-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={isActive ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"} />
                <span className="flex-1">{label}</span>
                {label === "Convites recebidos" && newInvites > 0 && (
                  <span className="bg-green-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {newInvites}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-bold text-sm">
            {currentTeacher.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{currentTeacher.nome}</p>
            <p className="text-xs text-slate-400">{currentTeacher.disciplinas[0]}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HomeIcon({ className = "" }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>;
}
function MailIcon({ className = "" }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>;
}
function CheckIcon({ className = "" }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
}
function HistoryIcon({ className = "" }) {
  return <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
}
