import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocStatus, Confidentiality } from "@/services/documentApi";

const STATUS_LABEL: Record<DocStatus, string> = {
  Indexed: "Indexé",
  Processing: "En traitement",
  "Pending Validation": "En attente",
  Archived: "Archivé",
};

const CONF_LABEL: Record<Confidentiality, string> = {
  Public: "Public",
  Internal: "Interne",
  Confidential: "Confidentiel",
  "Executive Only": "Direction uniquement",
};

export function StatusBadge({ status }: { status: DocStatus }) {
  const map: Record<DocStatus, string> = {
    Indexed: "border-success/40 text-success bg-success/10",
    Processing: "border-cyan-accent/40 text-cyan-accent bg-cyan-accent/10",
    "Pending Validation": "border-warning/40 text-warning bg-warning/10",
    Archived: "border-muted-foreground/40 text-muted-foreground bg-muted/30",
  };
  return <Badge variant="outline" className={cn("font-medium", map[status])}>{STATUS_LABEL[status]}</Badge>;
}

export function ConfidentialityBadge({ level }: { level: Confidentiality }) {
  const map: Record<Confidentiality, string> = {
    Public: "border-border text-muted-foreground",
    Internal: "border-cyan-accent/40 text-cyan-accent",
    Confidential: "border-warning/40 text-warning",
    "Executive Only": "border-destructive/40 text-destructive",
  };
  return <Badge variant="outline" className={cn("font-medium", map[level])}>{CONF_LABEL[level]}</Badge>;
}
