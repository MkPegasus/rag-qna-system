import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Search, Trash2 } from "lucide-react";
import { useAuth, ROLE_PERMISSIONS } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";

const BASE_URL = "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface APIUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

const initials = (nom: string, prenom: string) => `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();

const ROLE_BADGE: Record<string, string> = {
  EMPLOYEE: "Employé",
  MANAGER: "Responsable",
  DOCUMENT_MANAGER: "Gest. doc.",
  ADMIN: "Administrateur",
};

interface NewUserForm {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: string;
}

const emptyForm: NewUserForm = {
  nom: "",
  prenom: "",
  email: "",
  password: "",
  role: "EMPLOYEE",
};

export function UsersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<APIUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // Modale
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewUserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Protection RBAC
  if (user && !ROLE_PERMISSIONS.canManageUsers(user.role)) {
    navigate({ to: "/dashboard" });
    return null;
  }

  useEffect(() => {
    fetch(`${BASE_URL}/api/users/`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    const res = await fetch(`${BASE_URL}/api/users/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      const err = await res.json();
      alert(err.detail || "Erreur de suppression");
    }
  };

  const handleCreate = async () => {
    setFormError(null);
    if (!form.nom || !form.prenom || !form.email || !form.password) {
      setFormError("Tous les champs sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erreur de création");
      }
      const created: APIUser = await res.json();
      setUsers((prev) => [created, ...prev]);
      setOpen(false);
      setForm(emptyForm);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      !q ||
      u.nom.toLowerCase().includes(q.toLowerCase()) ||
      u.prenom.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            Provisionnez les accès, attribuez les rôles et consultez les permissions.
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-primary to-cyan-accent text-white"
          onClick={() => {
            setForm(emptyForm);
            setFormError(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" /> Ajouter un utilisateur
        </Button>
      </div>

      <Card className="glass border-border">
        <CardContent className="p-4">
          <div className="relative mb-4 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher des utilisateurs..."
              className="pl-9"
            />
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-accent/40 hover:bg-accent/40">
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      Chargement…
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-accent text-white text-xs">
                              {initials(u.nom, u.prenom)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {u.prenom} {u.nom}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ROLE_BADGE[u.role] ?? u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modale d'ajout */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvel utilisateur</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {formError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Prénom</Label>
                <Input
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  placeholder="Darelle"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Kianpi"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="darelle@iuc.cm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mot de passe</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rôle</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employé</SelectItem>
                  <SelectItem value="MANAGER">Responsable</SelectItem>
                  <SelectItem value="DOCUMENT_MANAGER">Gestionnaire documentaire</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-cyan-accent text-white"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? "Création…" : "Créer l'utilisateur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
