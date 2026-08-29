import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { Navbar } from "@/components/Navbar/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          <div className="animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
