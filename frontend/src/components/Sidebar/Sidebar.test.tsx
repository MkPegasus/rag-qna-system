import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "./Sidebar";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, className }: any) => (
    <a href={to} className={typeof className === "function" ? className({}) : className}>
      {children}
    </a>
  ),
  useRouterState: () => "/dashboard",
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u4", name: "Alex", email: "a@a.com", role: "admin", department: "IT" },
  }),
}));

describe("Sidebar - traduction française", () => {
  it("affiche les libellés de navigation en français pour un admin", () => {
    render(<Sidebar />);
    const expected = [
      "Tableau de bord",
      "Assistant IA",
      "Conversations",
      "Documents",
      "Centre d'ingestion",
      "Analytique",
      "Gestion des utilisateurs",
      "Sécurité & Audit",
      "Paramètres système",
      "Profil",
      "Espace de travail",
    ];
    for (const label of expected) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("ne contient aucun libellé anglais de navigation", () => {
    render(<Sidebar />);
    const html = document.body.innerHTML;
    const forbidden = [
      "Dashboard",
      "AI Assistant",
      "Ingestion Center",
      "Analytics",
      "User Management",
      "Security & Audit",
      "System Settings",
      "Profile",
      "Workspace",
    ];
    for (const word of forbidden) {
      expect(html).not.toMatch(new RegExp(`\\b${word}\\b`));
    }
  });
});
