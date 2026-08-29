import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type UserProfile } from "../services/authApi";

// Mapping rôles backend → rôles frontend
export type Role = "employee" | "department_manager" | "document_manager" | "admin";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Convertit le rôle backend (ADMIN) en rôle frontend (admin)
function mapRole(backendRole: UserProfile["role"]): Role {
  const map: Record<UserProfile["role"], Role> = {
    EMPLOYEE: "employee",
    MANAGER: "department_manager",
    DOCUMENT_MANAGER: "document_manager",
    ADMIN: "admin",
  };
  return map[backendRole] ?? "employee";
}

function mapUser(profile: UserProfile): User {
  return {
    id: profile.id,
    nom: profile.nom,
    prenom: profile.prenom,
    email: profile.email,
    role: mapRole(profile.role),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au démarrage : si un token existe, récupère le profil
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    authApi
      .me()
      .then((profile) => setUser(mapUser(profile)))
      .catch(() => {
        // Token expiré ou invalide
        localStorage.removeItem("token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    // 1. Obtenir le token
    const { access_token } = await authApi.login(email, password);
    localStorage.setItem("token", access_token);

    // 2. Récupérer le profil complet
    const profile = await authApi.me();
    setUser(mapUser(profile));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const ROLE_LABEL: Record<Role, string> = {
  employee: "Employé",
  department_manager: "Responsable de département",
  document_manager: "Gestionnaire documentaire",
  admin: "Administrateur système",
};

// Utilitaire pour vérifier les permissions
export const ROLE_PERMISSIONS = {
  canUploadDocuments: (role: Role) => ["document_manager", "admin"].includes(role),
  canDeleteDocuments: (role: Role) => ["document_manager", "admin"].includes(role),
  canManageUsers: (role: Role) => role === "admin",
  canViewAuditLogs: (role: Role) => role === "admin",
  canViewAllDocuments: (role: Role) => ["document_manager", "admin"].includes(role),
};
