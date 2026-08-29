import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cpu, Database, GitBranch, Layers, ShieldCheck } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres système</h1>
        <p className="text-sm text-muted-foreground">
          Architecture technique et configuration d'exécution.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Fournisseur IA", v: "Groq", i: Cpu, sub: "llama-3.1-70b-versatile" },
          { l: "Modèle d'embedding", v: "nomic-embed-text", i: Layers, sub: "768 dimensions" },
          { l: "Base vectorielle", v: "ChromaDB", i: Database, sub: "1,84 M vecteurs" },
          { l: "Orchestrateur", v: "LlamaIndex", i: GitBranch, sub: "v0.11.x" },
        ].map((c) => (
          <Card key={c.l} className="glass border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="text-xs text-muted-foreground">{c.l}</div>
                <c.i className="h-4 w-4 text-cyan-accent" />
              </div>
              <div className="mt-2 text-lg font-semibold">{c.v}</div>
              <div className="text-xs text-muted-foreground">{c.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-base">Configuration de la recherche</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between">
                <Label>Top-K récupération</Label>
                <Badge variant="outline">8</Badge>
              </div>
              <Slider defaultValue={[8]} max={20} min={1} step={1} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-1">
                Nombre de fragments à récupérer par requête.
              </p>
            </div>
            <div>
              <div className="flex justify-between">
                <Label>Taille des fragments</Label>
                <Badge variant="outline">1024 tokens</Badge>
              </div>
              <Slider defaultValue={[1024]} max={2048} min={256} step={128} className="mt-3" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label>Chevauchement des fragments</Label>
                <Badge variant="outline">128 tokens</Badge>
              </div>
              <Slider defaultValue={[128]} max={512} min={0} step={32} className="mt-3" />
            </div>
            <div className="space-y-1.5">
              <Label>Reclasseur</Label>
              <Select defaultValue="bge">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bge">BGE Reranker v2</SelectItem>
                  <SelectItem value="cohere">Cohere Rerank 3</SelectItem>
                  <SelectItem value="none">Aucun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" /> Politiques d'accès & authentification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              {
                t: "Imposer SSO (SAML 2.0)",
                d: "Bloquer les connexions par mot de passe pour les administrateurs.",
                on: true,
              },
              {
                t: "Authentification multi-facteurs",
                d: "Obligatoire pour tous les rôles.",
                on: true,
              },
              {
                t: "Sécurité au niveau ligne (RLS)",
                d: "Filtrer les fragments selon les permissions à la requête.",
                on: true,
              },
              {
                t: "Auditer les accès aux documents",
                d: "Journaliser chaque consultation dans un stockage immuable.",
                on: true,
              },
              {
                t: "Anonymiser les PII dans les réponses",
                d: "Détecter et masquer les données personnelles générées.",
                on: false,
              },
            ].map((p, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{p.t}</div>
                  <div className="text-xs text-muted-foreground">{p.d}</div>
                </div>
                <Switch defaultChecked={p.on} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label>Délai de session</Label>
                <Input defaultValue="30 min" />
              </div>
              <div className="space-y-1.5">
                <Label>Durée de vie du jeton</Label>
                <Input defaultValue="60 min" />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline">Réinitialiser</Button>
              <Button className="bg-gradient-to-r from-primary to-cyan-accent text-white">
                Enregistrer la configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
