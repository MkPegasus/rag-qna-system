import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, ShieldCheck, AlertTriangle, KeyRound, Eye, CheckCircle2 } from "lucide-react";

const events = [
  {
    t: "Connexion",
    who: "alex.morgan@acme.com",
    where: "192.168.4.21 · Paris, FR",
    when: "il y a 2 min",
    tone: "success",
  },
  {
    t: "Attribution de permission",
    who: "priya.n@acme.com → Gestionnaire documentaire",
    where: "Modification RBAC",
    when: "il y a 18 min",
    tone: "info",
  },
  {
    t: "Échecs de connexion (×3)",
    who: "inconnu@acme.com",
    where: "Nœud de sortie TOR",
    when: "il y a 1 h",
    tone: "danger",
  },
  {
    t: "Document consulté",
    who: "james.carter@acme.com",
    where: "Rapport_Financier_T1.docx",
    when: "il y a 1 h",
    tone: "info",
  },
  {
    t: "MFA activée",
    who: "sarah.chen@acme.com",
    where: "TOTP",
    when: "Aujourd'hui",
    tone: "success",
  },
  {
    t: "Politique mise à jour",
    who: "alex.morgan@acme.com",
    where: "Règles de confidentialité",
    when: "Hier",
    tone: "warn",
  },
];

const toneClass: Record<string, string> = {
  success: "border-success/40 text-success bg-success/10",
  info: "border-cyan-accent/40 text-cyan-accent bg-cyan-accent/10",
  warn: "border-warning/40 text-warning bg-warning/10",
  danger: "border-destructive/40 text-destructive bg-destructive/10",
};

export function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Centre de sécurité et d'audit</h1>
        <p className="text-sm text-muted-foreground">
          Visibilité continue sur les accès, l'identité et la gouvernance documentaire.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass-strong border-border lg:col-span-1 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-success/20 blur-3xl" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" /> Score de sécurité
            </div>
            <div className="mt-4 flex items-end gap-2">
              <div className="text-5xl font-semibold tracking-tight">94</div>
              <div className="text-sm text-success mb-2">/ 100 · Excellent</div>
            </div>
            <Progress value={94} className="h-2 mt-4" />
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {[
                { i: CheckCircle2, t: "MFA obligatoire", tone: "text-success" },
                { i: CheckCircle2, t: "SSO actif", tone: "text-success" },
                { i: CheckCircle2, t: "Chiffrement AES-256", tone: "text-success" },
                { i: AlertTriangle, t: "3 comptes dormants", tone: "text-warning" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <r.i className={`h-4 w-4 ${r.tone}`} /> {r.t}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-accent" /> Accès et événements récents
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {events.map((e, i) => (
              <div key={i} className="py-3 flex items-center gap-3">
                <Badge variant="outline" className={toneClass[e.tone]}>
                  {e.t}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{e.who}</div>
                  <div className="text-xs text-muted-foreground truncate">{e.where}</div>
                </div>
                <div className="text-xs text-muted-foreground">{e.when}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            t: "Événements d'authentification",
            v: "1 284",
            s: "dernières 24 h",
            i: KeyRound,
            tone: "text-cyan-accent",
          },
          {
            t: "Accès aux documents",
            v: "8 921",
            s: "dernières 24 h",
            i: Eye,
            tone: "text-primary",
          },
          { t: "Alertes suspectes", v: "2", s: "ouvertes", i: AlertTriangle, tone: "text-warning" },
        ].map((c) => (
          <Card key={c.t} className="glass border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl bg-accent grid place-items-center ${c.tone}`}>
                <c.i className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{c.t}</div>
                <div className="text-2xl font-semibold">{c.v}</div>
                <div className="text-xs text-muted-foreground">{c.s}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
