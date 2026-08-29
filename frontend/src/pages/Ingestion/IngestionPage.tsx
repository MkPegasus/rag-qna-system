import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { documentApi, type AccessLevel } from "@/services/documentApi";
import { useAuth, ROLE_PERMISSIONS } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";

interface UF {
  id: string;
  file: File;
  name: string;
  size: string;
  progress: number;
  status: "pending" | "uploading" | "indexed" | "error";
  error?: string;
}

export function IngestionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UF[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [department, setDepartment] = useState("hr");
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("INTERNAL");
  const [uploading, setUploading] = useState(false);

  // Protection RBAC
  if (user && !ROLE_PERMISSIONS.canUploadDocuments(user.role)) {
    navigate({ to: "/dashboard" });
    return null;
  }

  const addFiles = (fileList: FileList) => {
    const newFiles: UF[] = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} Ko`,
      progress: 0,
      status: "pending",
    }));
    setFiles((cur) => [...newFiles, ...cur]);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
  };

  const deptMap: Record<string, string> = {
    hr: "Ressources humaines",
    finance: "Finance",
    legal: "Juridique",
    eng: "Ingénierie",
  };

  const accessMap: Record<string, AccessLevel> = {
    public: "PUBLIC",
    internal: "INTERNAL",
    confidential: "CONFIDENTIAL",
    exec: "SECRET",
  };

  const handleUpload = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (!pending.length) return;
    setUploading(true);

    for (const uf of pending) {
      setFiles((cur) =>
        cur.map((f) => (f.id === uf.id ? { ...f, status: "uploading", progress: 30 } : f)),
      );
      try {
        await documentApi.upload(uf.file, deptMap[department], accessLevel);
        setFiles((cur) =>
          cur.map((f) => (f.id === uf.id ? { ...f, status: "indexed", progress: 100 } : f)),
        );
      } catch (err: any) {
        setFiles((cur) =>
          cur.map((f) => (f.id === uf.id ? { ...f, status: "error", error: err.message } : f)),
        );
      }
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Centre d'ingestion des documents</h1>
        <p className="text-sm text-muted-foreground">
          Téléversez, classifiez et indexez les documents dans la base de connaissances sécurisée.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass border-border lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`relative rounded-2xl border-2 border-dashed transition-all p-10 text-center ${dragOver ? "border-cyan-accent bg-cyan-accent/5" : "border-border"}`}
            >
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-accent grid place-items-center shadow-glow">
                <UploadCloud className="h-7 w-7 text-white" />
              </div>
              <h3 className="mt-4 font-semibold">Glissez-déposez vos documents ici</h3>
              <p className="text-sm text-muted-foreground mt-1">
                ou cliquez pour parcourir · PDF, DOCX, TXT · max. 50 Mo
              </p>
              <Button
                className="mt-4 bg-gradient-to-r from-primary to-cyan-accent text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                Choisir des fichiers
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            <div className="space-y-3">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-accent grid place-items-center">
                    <FileText className="h-4 w-4 text-cyan-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium truncate">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.size}</div>
                    </div>
                    {f.status === "uploading" && (
                      <Progress value={f.progress} className="h-1.5 mt-2" />
                    )}
                    {f.status === "indexed" && (
                      <div className="text-xs text-success flex items-center gap-1 mt-1.5">
                        <CheckCircle2 className="h-3 w-3" /> Indexé · chunked & vectorisé
                      </div>
                    )}
                    {f.status === "error" && (
                      <div className="text-xs text-destructive flex items-center gap-1 mt-1.5">
                        <AlertCircle className="h-3 w-3" /> {f.error}
                      </div>
                    )}
                    {f.status === "pending" && (
                      <div className="text-xs text-muted-foreground mt-1.5">En attente d'envoi</div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setFiles((cur) => cur.filter((c) => c.id !== f.id))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-base">Métadonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Département</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hr">Ressources humaines</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="legal">Juridique</SelectItem>
                  <SelectItem value="eng">Ingénierie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Confidentialité</Label>
              <RadioGroup
                defaultValue="internal"
                onValueChange={(v) => setAccessLevel(accessMap[v])}
                className="space-y-1.5"
              >
                {[
                  { v: "public", l: "Public", d: "Toute l'organisation" },
                  { v: "internal", l: "Interne", d: "Employés uniquement" },
                  { v: "confidential", l: "Confidentiel", d: "Département & approbateurs" },
                  { v: "exec", l: "Direction uniquement", d: "Équipe de direction" },
                ].map((o) => (
                  <label
                    key={o.v}
                    className="flex items-start gap-3 rounded-lg border border-border p-2.5 has-[:checked]:border-cyan-accent/60 has-[:checked]:bg-cyan-accent/5 cursor-pointer"
                  >
                    <RadioGroupItem value={o.v} className="mt-0.5" />
                    <div>
                      <div className="text-sm font-medium">{o.l}</div>
                      <div className="text-xs text-muted-foreground">{o.d}</div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-cyan-accent text-white"
                onClick={handleUpload}
                disabled={uploading || !files.some((f) => f.status === "pending")}
              >
                {uploading ? "Envoi en cours…" : "Valider & indexer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
