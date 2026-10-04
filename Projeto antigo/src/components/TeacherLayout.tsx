import { Outlet } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar";
import DemoBar from "./DemoBar";

export default function TeacherLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <DemoBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
