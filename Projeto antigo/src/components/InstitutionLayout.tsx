import { Outlet } from "react-router-dom";
import InstitutionSidebar from "./InstitutionSidebar";
import DemoBar from "./DemoBar";

export default function InstitutionLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <DemoBar />
      <div className="flex flex-1 overflow-hidden">
        <InstitutionSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
