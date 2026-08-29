import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth, ROLE_LABEL } from "@/contexts/AuthContext";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  FileText,
  Database,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Brain,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const trendData = Array.from({ length: 14 }).map((_, i) => ({
  d: `J${i + 1}`,
  queries: 120 + Math.round(Math.sin(i / 2) * 40 + i * 8),
  accuracy: 78 + Math.round(Math.cos(i / 3) * 6 + i * 0.4),
}));

export function DashboardPage() {
  const { user } = useAuth();
  // ← user.name remplacé par user.prenom
  const name = user?.prenom ?? "";

  const kpis = [
    {
      label: "Documents indexés",
      value: "12 480",
      delta: "+4,2 %",
      icon: FileText,
      tone: "text-cyan-accent",
    },
    {
      label: "Fragments de connaissances",
      value: "1,84 M",
      delta: "+12 k aujourd'hui",
      icon: Database,
      tone: "text-primary",
    },
    {
      label: "Utilisateurs actifs (24 h)",
      value: "342",
      delta: "+18",
      icon: Users,
      tone: "text-success",
    },
    {
      label: "Temps de réponse moyen",
      value: "1,28 s",
      delta: "-120 ms",
      icon: Clock,
      tone: "text-warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-cyan-accent/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge variant="outline" className="mb-3 border-cyan-accent/40 text-cyan-accent">
              {user && ROLE_LABEL[user.role]}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Bon retour, {name}.
            </h1>
            <p className="text-muted-foreground mt-1.5 max-w-xl">
              Votre index de connaissances est en bonne santé. 8 nouveaux documents attendent une
              validation dans 3 départements.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-cyan-accent text-white shadow-glow"
            >
              <Link to="/assistant">
                <Sparkles className="h-4 w-4 mr-1.5" /> Interroger l'assistant
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/documents">Parcourir les documents</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="glass border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <k.icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">{k.value}</div>
              <div className="mt-1 text-xs flex items-center gap-1 text-success">
                <ArrowUpRight className="h-3 w-3" /> {k.delta}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass lg:col-span-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Volume de requêtes et précision</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                14 derniers jours · réponses augmentées par recherche
              </p>
            </div>
            <Badge variant="outline">En direct</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.555 0.22 264)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.555 0.22 264)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.745 0.135 210)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.745 0.135 210)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                  <XAxis
                    dataKey="d"
                    stroke="oklch(0.7 0.02 256)"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="oklch(0.7 0.02 256)"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.245 0.038 264)",
                      border: "1px solid oklch(1 0 0 / 0.1)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="queries"
                    stroke="oklch(0.555 0.22 264)"
                    fill="url(#g1)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="oklch(0.745 0.135 210)"
                    fill="url(#g2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-cyan-accent" /> Santé du pipeline RAG
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Précision de la recherche", value: 94, tone: "bg-success" },
              { label: "Débit d'embeddings", value: 81, tone: "bg-cyan-accent" },
              { label: "Latence base vectorielle", value: 76, tone: "bg-primary" },
              { label: "Couverture des politiques", value: 88, tone: "bg-warning" },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium">{r.value}%</span>
                </div>
                <Progress value={r.value} className="h-1.5" />
              </div>
            ))}
            <div className="pt-2 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Tous les systèmes nominaux ·
              dernier contrôle il y a 2 min
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-base">Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {[
              {
                i: CheckCircle2,
                t: "Rapport_Financier_T1.docx indexé (842 fragments)",
                w: "il y a 2 min",
                tone: "text-success",
              },
              {
                i: Sparkles,
                t: "Sarah Chen a demandé : « Quelle est la politique de congé parental ? »",
                w: "il y a 11 min",
                tone: "text-cyan-accent",
              },
              {
                i: AlertCircle,
                t: "Memo_Strategie_Conseil.pdf signalé : Direction uniquement",
                w: "il y a 32 min",
                tone: "text-warning",
              },
              {
                i: FileText,
                t: "Cadre_Conformite_v3.pdf téléversé par Marcus Reed",
                w: "il y a 1 h",
                tone: "text-primary",
              },
              {
                i: Users,
                t: "3 utilisateurs ont rejoint l'espace Finance",
                w: "il y a 2 h",
                tone: "text-cyan-accent",
              },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className={`h-8 w-8 rounded-lg bg-accent grid place-items-center ${row.tone}`}>
                  <row.i className="h-4 w-4" />
                </div>
                <div className="flex-1 text-sm">{row.t}</div>
                <div className="text-xs text-muted-foreground">{row.w}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-base">Documents les plus consultés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Politique_RH_2026.pdf", q: 482 },
              { name: "Manuel_Employe.pdf", q: 367 },
              { name: "Cadre_Conformite_v3.pdf", q: 298 },
              { name: "Rapport_Financier_T1.docx", q: 211 },
              { name: "Playbook_Commercial_2025.pdf", q: 184 },
            ].map((d) => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate">{d.name}</span>
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3" /> {d.q}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-accent"
                    style={{ width: `${(d.q / 482) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
