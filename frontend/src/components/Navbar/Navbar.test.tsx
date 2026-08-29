import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "./Navbar";
import { ThemeProvider } from "@/contexts/ThemeContext";

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "u1", name: "Sarah Chen", email: "s@a.com", role: "admin", department: "IT" },
    logout: vi.fn(),
    setRole: vi.fn(),
  }),
  ROLE_LABEL: {
    employee: "Employé",
    department_manager: "Responsable de département",
    document_manager: "Gestionnaire documentaire",
    admin: "Administrateur système",
  },
}));

function renderNavbar() {
  return render(
    <ThemeProvider>
      <Navbar />
    </ThemeProvider>
  );
}

describe("Navbar - thème", () => {
  it("expose un bouton accessible pour changer de thème", () => {
    renderNavbar();
    expect(screen.getByRole("button", { name: /changer de thème/i })).toBeInTheDocument();
  });

  it("le clic sur le bouton thème met à jour la classe sur <html>", async () => {
    const user = userEvent.setup();
    renderNavbar();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    await user.click(screen.getByRole("button", { name: /changer de thème/i }));
    expect(document.documentElement.classList.contains("light")).toBe(true);
    await user.click(screen.getByRole("button", { name: /changer de thème/i }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("Navbar - traduction française", () => {
  it("affiche les libellés en français", () => {
    renderNavbar();
    expect(
      screen.getByPlaceholderText(/Rechercher documents, conversations, personnes/i)
    ).toBeInTheDocument();
  });

  it("n'affiche pas de libellés anglais connus", () => {
    renderNavbar();
    const html = document.body.innerHTML;
    expect(html).not.toMatch(/\bSearch documents\b/i);
    expect(html).not.toMatch(/\bSign out\b/i);
    expect(html).not.toMatch(/\bSwitch role\b/i);
  });
});
