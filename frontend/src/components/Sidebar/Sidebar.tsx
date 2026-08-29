import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Sparkles, MessagesSquare, FileText, BarChart3,
  Shield, Settings, User, Upload, Users, Brain,
} from "lucide-react";
import { useAuth, type Role } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }>; roles: Role[] };

const items: Item[] = [
  { to: "/dashboard",     label: "Tableau de bord",        icon: LayoutDashboard, roles: ["employee", "department_manager", "document_manager", "admin"] },
  { to: "/assistant",     label: "Assistant IA",           icon: Sparkles,        roles: ["employee", "department_manager", "document_manager", "admin"] },
  { to: "/conversations", label: "Conversations",          icon: MessagesSquare,  roles: ["employee", "department_manager", "document_manager", "admin"] },
  { to: "/documents",     label: "Documents",              icon: FileText,        roles: ["employee", "department_manager", "document_manager", "admin"] },
  { to: "/ingestion",     label: "Centre d'ingestion",     icon: Upload,          roles: ["document_manager", "admin"] },
  { to: "/analytics",     label: "Analytique",             icon: BarChart3,       roles: ["department_manager", "admin"] },
  { to: "/users",         label: "Gestion des utilisateurs", icon: Users,         roles: ["admin"] },
  { to: "/security",      label: "Sécurité & Audit",       icon: Shield,          roles: ["admin"] },
  { to: "/settings",      label: "Paramètres système",     icon: Settings,        roles: ["admin"] },
  { to: "/profile",       label: "Profil",                 icon: User,            roles: ["employee", "department_manager", "document_manager", "admin"] },
];

export function Sidebar() {
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!user) return null;
  const visible = items.filter((it) => it.roles.includes(user.role));

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col glass border-r border-sidebar-border bg-sidebar/80 text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
        <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-cyan-accent grid place-items-center shadow-glow">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm">KnowRAG</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Enterprise</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Espace de travail</div>
        {visible.map((it) => {
          const active = pathname === it.to || (it.to !== "/dashboard" && pathname.startsWith(it.to));
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border border-border"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              )}
            >
              <it.icon className={cn("h-4 w-4", active && "text-cyan-accent")} />
              <span>{it.label}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-accent" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <div className="glass rounded-lg p-3 text-xs">
          <div className="flex items-center gap-2 text-cyan-accent font-medium">
            <Shield className="h-3.5 w-3.5" /> SOC 2 Type II
          </div>
          <p className="mt-1 text-muted-foreground">Chiffrement de bout en bout · RLS activée</p>
        </div>
      </div>
    </aside>
  );
}
