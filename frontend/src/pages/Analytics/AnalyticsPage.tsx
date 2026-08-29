import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { FileText, Database, Users, MessageSquare, Clock, Gauge } from "lucide-react";

const daily = Array.from({ length: 30 }).map((_, i) => ({ d: `${i + 1}`, q: 80 + Math.round(Math.sin(i / 3) * 30 + i * 4) }));
const topDocs = [
  { name: "Politique_RH", q: 482 }, { name: "Manuel", q: 367 }, { name: "Conformité", q: 298 },
  { name: "Rapport_T1", q: 211 }, { name: "Playbook_Ventes", q: 184 },
];
const dept = [
  { name: "Ingénierie", value: 32 }, { name: "Ventes", value: 24 }, { name: "Finance", value: 18 },
  { name: "RH", value: 14 }, { name: "Juridique", value: 12 },
];
const colors = ["oklch(0.555 0.22 264)", "oklch(0.745 0.135 210)", "oklch(0.72 0.18 145)", "oklch(0.78 0.16 75)", "oklch(0.65 0.2 320)"];
const adoption = Array.from({ length: 12 }).map((_, i) => ({ m: `M${i + 1}`, rate: 20 + i * 6 + Math.round(Math.random() * 4) }));

export function AnalyticsPage() {
  const kpis = [
    { label: "Total des documents", value: "12 480", icon: FileText },
    { label: "Fragments indexés", value: "1,84 M", icon: Database },
    { label: "Utilisateurs actifs", value: "1 247", icon: Users },
    { label: "Questions aujourd'hui", value: "3 891", icon: MessageSquare },
    { label: "Temps de réponse moyen", value: "1,28 s", icon: Clock },
    { label: "Précision de recherche", value: "94,2 %", icon: Gauge },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytique</h1>
        <p className="text-sm text-muted-foreground">Vue exécutive de l'adoption des connaissances et des performances IA.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className="glass border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="text-[11px] text-muted-foreground">{k.label}</div>
                <k.icon className="h-4 w-4 text-cyan-accent" />
              </div>
              <div className="mt-2 text-xl font-semibold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle className="text-base">Requêtes quotidiennes</CardTitle><p className="text-xs text-muted-foreground">30 derniers jours</p></div>
            <Badge variant="outline" className="border-cyan-accent/40 text-cyan-accent">+22 % MoM</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily}>
                  <defs>
                    <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.555 0.22 264)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.555 0.22 264)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                  <XAxis dataKey="d" stroke="oklch(0.7 0.02 256)" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="oklch(0.7 0.02 256)" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.245 0.038 264)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="q" stroke="oklch(0.555 0.22 264)" fill="url(#ga)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader><CardTitle className="text-base">Utilisation par département</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dept} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} paddingAngle={3}>
                    {dept.map((_, i) => <Cell key={i} fill={colors[i]} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(0.245 0.038 264)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader><CardTitle className="text-base">Documents les plus consultés</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDocs} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" horizontal={false} />
                  <XAxis type="number" stroke="oklch(0.7 0.02 256)" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="oklch(0.7 0.02 256)" fontSize={11} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ background: "oklch(0.245 0.038 264)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="q" radius={[0, 6, 6, 0]} fill="oklch(0.745 0.135 210)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Taux d'adoption de l'IA</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adoption}>
                  <defs>
                    <linearGradient id="gc" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.745 0.135 210)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.745 0.135 210)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                  <XAxis dataKey="m" stroke="oklch(0.7 0.02 256)" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="oklch(0.7 0.02 256)" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.245 0.038 264)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="rate" stroke="oklch(0.745 0.135 210)" fill="url(#gc)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
