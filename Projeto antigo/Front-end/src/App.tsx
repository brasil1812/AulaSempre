import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./store/AppContext";

import LandingPage from "./screens/LandingPage";
import LoginScreen from "./screens/LoginScreen";
import ProfileChoice from "./screens/ProfileChoice";

import InstitutionLayout from "./components/InstitutionLayout";
import InstitutionDashboard from "./screens/institution/Dashboard";
import CreateRequest from "./screens/institution/CreateRequest";
import MyRequests from "./screens/institution/MyRequests";
import SearchTeachers from "./screens/institution/SearchTeachers";
import TeacherDetail from "./screens/institution/TeacherDetail";

import TeacherLayout from "./components/TeacherLayout";
import TeacherDashboard from "./screens/teacher/TeacherDashboard";
import TeacherInvites from "./screens/teacher/TeacherInvites";
import TeacherConfirmed from "./screens/teacher/TeacherConfirmed";

import HistoryScreen from "./screens/HistoryScreen";
import NotificationsScreen from "./screens/NotificationsScreen";

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="text-4xl mb-3">🚧</div>
        <h2 className="text-lg font-bold text-slate-700">{title}</h2>
        <p className="text-slate-400 text-sm mt-1">Em desenvolvimento</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/entrar" element={<LoginScreen />} />
          <Route path="/demo" element={<ProfileChoice />} />
          <Route path="/recuperar-senha" element={<ProfileChoice />} />

          {/* Institution area */}
          <Route path="/instituicao" element={<InstitutionLayout />}>
            <Route index element={<InstitutionDashboard />} />
            <Route path="solicitar" element={<CreateRequest />} />
            <Route path="solicitacoes" element={<MyRequests />} />
            <Route path="professores" element={<SearchTeachers />} />
            <Route path="professor/:id" element={<TeacherDetail />} />
            <Route path="historico" element={<HistoryScreen />} />
            <Route path="notificacoes" element={<NotificationsScreen />} />
          </Route>

          {/* Teacher area */}
          <Route path="/professor" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="convites" element={<TeacherInvites />} />
            <Route path="confirmadas" element={<TeacherConfirmed />} />
            <Route path="historico" element={<Placeholder title="Histórico" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
