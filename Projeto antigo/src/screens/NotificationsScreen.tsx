import { useState } from "react";

const initial = [
  { id: 1, text: "Carlos Mendes aceitou sua solicitação de substituição de Matemática para o 9º A.", time: "há 10 min", read: false, icon: "✅", tipo: "confirmacao" },
  { id: 2, text: "Novo professor compatível encontrado para Física – 2º Médio A. Veja o perfil agora.", time: "há 45 min", read: false, icon: "🔔", tipo: "match" },
  { id: 3, text: "Sua substituição de Ciências começa em 2 horas. Professor: Roberto Lima.", time: "há 1h", read: false, icon: "⏰", tipo: "lembrete" },
  { id: 4, text: "Avalie a substituição de Português realizada ontem por Ana Figueiredo.", time: "há 3h", read: true, icon: "⭐", tipo: "avaliacao" },
  { id: 5, text: "Ana Figueiredo confirmou a substituição de Português para o 7º B.", time: "há 5h", read: true, icon: "✅", tipo: "confirmacao" },
  { id: 6, text: "Lembrete: você tem 2 solicitações abertas sem professor confirmado.", time: "há 8h", read: true, icon: "⚠️", tipo: "alerta" },
  { id: 7, text: "Novo professor compatível encontrado para Biologia – 3º Médio B.", time: "Ontem, 16:30", read: true, icon: "🔔", tipo: "match" },
  { id: 8, text: "Resumo semanal: 5 substituições realizadas com sucesso. Excelente semana!", time: "Ontem, 08:00", read: true, icon: "📊", tipo: "relatorio" },
];

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState(initial);

  const markRead = (id: number) => setNotifs((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));
  const markAllRead = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));

  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notificações</h1>
          <p className="text-sm text-slate-500 mt-1">
            {unread > 0 ? <><span className="text-blue-600 font-semibold">{unread} não lidas</span> · </> : "Tudo em dia · "}
            {notifs.length} no total
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-blue-600 font-medium hover:underline"
          >
            Marcar todas como lidas
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifs.map((n) => (
          <div
            key={n.id}
            className={`flex gap-4 p-4 rounded-2xl border transition-all ${
              n.read ? "bg-white border-slate-100" : "bg-blue-50 border-blue-100"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm leading-relaxed ${n.read ? "text-slate-600" : "text-slate-800 font-medium"}`}>
                {n.text}
              </p>
              <p className="text-xs text-slate-400 mt-1">{n.time}</p>
            </div>
            <div className="flex items-start gap-2 flex-shrink-0">
              {!n.read && (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-xs text-slate-400 hover:text-slate-600 whitespace-nowrap"
                  >
                    Marcar como lida
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
