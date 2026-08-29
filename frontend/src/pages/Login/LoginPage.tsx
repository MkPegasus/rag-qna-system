import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Brain, Lock, Mail, ShieldCheck, FileText, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex overflow-hidden grid-bg p-12 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-cyan-accent grid place-items-center shadow-glow">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold">KnowRAG</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Enterprise
            </div>
          </div>
        </div>

        <div className="relative flex-1 grid place-items-center">
          <svg viewBox="0 0 500 500" className="w-full max-w-lg">
            <defs>
              <radialGradient id="node" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="oklch(0.745 0.135 210)" />
                <stop offset="1" stopColor="oklch(0.555 0.22 264)" />
              </radialGradient>
            </defs>
            {[
              [250, 250, 80, 90],
              [120, 140, 30, 30],
              [380, 130, 26, 28],
              [400, 360, 32, 32],
              [110, 380, 28, 28],
              [250, 60, 20, 22],
              [60, 250, 22, 22],
              [440, 250, 22, 22],
              [250, 440, 24, 24],
            ].map(([x, y, r], i) => (
              <g key={i}>
                <line
                  x1={250}
                  y1={250}
                  x2={x}
                  y2={y}
                  stroke="oklch(1 0 0 / 0.15)"
                  strokeWidth="1"
                />
                <circle cx={x} cy={y} r={r} fill="url(#node)" opacity="0.85" />
              </g>
            ))}
            <circle
              cx={250}
              cy={250}
              r={100}
              fill="none"
              stroke="oklch(0.745 0.135 210 / 0.3)"
              strokeWidth="1"
            />
            <circle
              cx={250}
              cy={250}
              r={160}
              fill="none"
              stroke="oklch(0.745 0.135 210 / 0.15)"
              strokeWidth="1"
            />
          </svg>
          <div className="absolute top-8 left-4 glass rounded-xl p-3 flex items-center gap-2 animate-float-slow">
            <FileText className="h-4 w-4 text-cyan-accent" />
            <span className="text-xs">Politique_RH_2026.pdf</span>
          </div>
          <div className="absolute bottom-12 right-2 glass rounded-xl p-3 flex items-center gap-2 animate-float-slow [animation-delay:1s]">
            <Database className="h-4 w-4 text-cyan-accent" />
            <span className="text-xs">12 480 fragments indexés</span>
          </div>
          <div className="absolute top-1/3 right-0 glass rounded-xl p-3 flex items-center gap-2 animate-float-slow [animation-delay:2s]">
            <Sparkles className="h-4 w-4 text-cyan-accent" />
            <span className="text-xs">Confiance 94 %</span>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4 text-success" /> Architecture zéro confiance
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Toute recherche est filtrée par des politiques d'accès basées sur les rôles et auditée
            de bout en bout.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-cyan-accent grid place-items-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div className="font-semibold">KnowRAG Enterprise</div>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">Bienvenue</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Connectez-vous pour accéder à votre espace de connaissances d'entreprise.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail professionnel</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <a className="text-xs text-cyan-accent hover:underline" href="#">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-11"
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox defaultChecked /> Se souvenir de moi pendant 30 jours
            </label>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-primary to-cyan-accent hover:opacity-90 text-white font-medium shadow-glow"
            >
              {loading ? "Authentification..." : "Connexion sécurisée"}
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              Protégé par SSO · SAML 2.0 · MFA obligatoire
            </div>
          </form>

          <div className="mt-12 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>v2.6.0 · build 4821</span>
            <span>© 2026 KnowRAG Inc.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
