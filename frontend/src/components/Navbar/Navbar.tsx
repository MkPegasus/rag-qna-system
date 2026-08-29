import { Bell, Search, Sun, Moon, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, ROLE_LABEL, type Role } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const initials = user
    ? `${user.prenom} ${user.nom}`
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "U";

  return (
    <header className="h-16 shrink-0 glass border-b border-border flex items-center gap-4 px-6 sticky top-0 z-30">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher documents, conversations, personnes..."
          className="pl-9 bg-input/40 border-border h-10"
        />
        <kbd className="hidden md:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Changer de thème">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-accent ring-2 ring-background" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-lg hover:bg-accent transition">
              <Avatar className="h-8 w-8 ring-2 ring-primary/30">
                <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-accent text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-sm font-medium">{user?.nom}</div>
                <div className="text-[10px] text-muted-foreground">
                  {user && ROLE_LABEL[user.role]}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="text-sm font-medium">{user?.nom}</div>
              <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
              <Badge variant="outline" className="mt-2 text-[10px]">
                {user?.department}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Changer de rôle (démo)
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
