import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, ROLE_LABEL } from "@/contexts/AuthContext";
import { Mail, MapPin, Briefcase } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  const initials = user.name.split(" ").map(n => n[0]).slice(0, 2).join("");

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <Card className="glass-strong border-border relative overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary/30 via-cyan-accent/20 to-primary/30 grid-bg" />
        <CardContent className="-mt-12 pb-6 px-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-elevated">
                <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-accent text-white text-2xl font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="pb-2">
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {user.department}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Siège Paris</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="border-cyan-accent/40 text-cyan-accent">{ROLE_LABEL[user.role]}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass border-border">
          <CardHeader><CardTitle className="text-base">Informations personnelles</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Nom complet</Label><Input defaultValue={user.name} /></div>
            <div className="space-y-1.5"><Label>E-mail</Label><Input defaultValue={user.email} /></div>
            <div className="space-y-1.5"><Label>Département</Label><Input defaultValue={user.department} /></div>
            <div className="space-y-1.5"><Label>Fuseau horaire</Label><Input defaultValue="Europe/Paris (UTC+1)" /></div>
            <Button className="bg-gradient-to-r from-primary to-cyan-accent text-white">Enregistrer les modifications</Button>
          </CardContent>
        </Card>
        <Card className="glass border-border">
          <CardHeader><CardTitle className="text-base">Activité</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            {[
              { k: "Questions posées", v: "248" },
              { k: "Documents lus", v: "112" },
              { k: "Conversations", v: "34" },
              { k: "Membre depuis", v: "Mars 2025" },
            ].map((r) => (
              <div key={r.k} className="flex justify-between border-b border-border last:border-0 pb-2 last:pb-0">
                <span className="text-muted-foreground">{r.k}</span>
                <span className="font-medium">{r.v}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
