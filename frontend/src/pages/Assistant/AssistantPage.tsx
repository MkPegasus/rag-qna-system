import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Send,
  Mic,
  Paperclip,
  FileText,
  ShieldCheck,
  ChevronRight,
  Brain,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { chatApi, type Source } from "@/services/chatApi";

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  response_time_ms?: number;
  createdAt: string;
}

const suggestions = [
  {
    t: "Résumer les politiques de l'entreprise",
    h: "Obtenez une synthèse concise des dernières politiques RH et de conformité.",
  },
  {
    t: "Trouver les procédures RH",
    h: "Recherchez les procédures d'intégration, de congé et d'avantages.",
  },
  {
    t: "Expliquer le workflow de reporting financier",
    h: "Parcourez la clôture trimestrielle et la chaîne d'approbation.",
  },
  {
    t: "Récupérer les documents de conformité",
    h: "Accédez à la dernière documentation SOC 2 et RGPD.",
  },
];

export function AssistantPage() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>();

  // Charge une conversation depuis ConversationsPage
  useEffect(() => {
    const raw = sessionStorage.getItem("load_conversation");
    if (!raw) return;
    sessionStorage.removeItem("load_conversation");

    const data = JSON.parse(raw);
    const msgs = Array.isArray(data) ? data : (data.messages ?? []);
    const convId = Array.isArray(data) ? undefined : data.id;

    if (convId) setConversationId(convId);

    const loaded: UIMessage[] = msgs.map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.contenu,
      sources: m.sources_json ? JSON.parse(m.sources_json) : undefined,
      createdAt: m.created_at,
    }));
    setMessages(loaded);
  }, []);

  // ← send est ici, au niveau du composant, pas dans le useEffect
  const send = async (q?: string) => {
    const text = (q ?? input).trim();
    if (!text) return;
    setInput("");
    setBusy(true);
    setError(null);

    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);

    try {
      const res = await chatApi.ask(text, conversationId);
      setConversationId(res.conversation_id);

      const assistantMsg: UIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.answer,
        sources: res.sources,
        response_time_ms: res.response_time_ms,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la requête");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-accent" /> Assistant IA d'entreprise
          </h1>
          <p className="text-sm text-muted-foreground">
            Ancré dans les connaissances vérifiées de votre organisation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-success/40 text-success">
            <ShieldCheck className="h-3 w-3 mr-1" /> RLS actif
          </Badge>
          <Badge variant="outline">Groq · LlamaIndex · ChromaDB</Badge>
        </div>
      </div>

      <Card className="glass-strong border-border flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <div className="h-full grid place-items-center">
              <div className="max-w-2xl text-center">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-accent grid place-items-center shadow-glow">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <h2 className="mt-5 text-xl font-semibold">
                  Comment puis-je vous aider aujourd'hui ?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Chaque réponse est sourcée et respecte vos politiques d'accès.
                </p>
                <div className="mt-6 grid sm:grid-cols-2 gap-3 text-left">
                  {suggestions.map((s) => (
                    <button
                      key={s.t}
                      onClick={() => send(s.t)}
                      className="glass rounded-xl p-4 hover:border-cyan-accent/40 transition group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{s.t}</div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-cyan-accent transition" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{s.h}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
              {m.role === "user" ? (
                <div className="max-w-2xl rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground text-sm shadow">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-3xl space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-cyan-accent grid place-items-center">
                      <Brain className="h-3.5 w-3.5 text-white" />
                    </div>
                    Assistant KnowRAG
                    {m.response_time_ms && (
                      <Badge variant="outline" className="border-success/40 text-success ml-1">
                        {m.response_time_ms}ms
                      </Badge>
                    )}
                  </div>
                  <div className="glass rounded-2xl p-4 text-sm leading-relaxed">{m.content}</div>

                  {m.sources && m.sources.length > 0 && (
                    <div className="glass rounded-2xl p-4">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                        <ShieldCheck className="h-3.5 w-3.5 text-cyan-accent" /> Sources utilisées
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {m.sources.map((s, i) => (
                          <div key={i} className="rounded-lg border border-border bg-card/50 p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 text-cyan-accent shrink-0" />
                                <div className="text-sm font-medium truncate">{s.filename}</div>
                              </div>
                              {s.score && (
                                <Badge variant="secondary" className="text-[10px]">
                                  {Math.round(s.score * 100)}%
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              « {s.text_preview} »
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => navigator.clipboard.writeText(m.content)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {busy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-cyan-accent animate-pulse" />
              Récupération depuis l'index vectoriel…
            </div>
          )}
        </CardContent>

        <div className="border-t border-border p-3">
          <div className="glass rounded-2xl p-2 flex items-end gap-2">
            <Button size="icon" variant="ghost" className="h-9 w-9">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="Posez n'importe quelle question sur les connaissances de votre entreprise…"
              className="min-h-[44px] max-h-40 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
            <Button size="icon" variant="ghost" className="h-9 w-9">
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => send()}
              disabled={busy || !input.trim()}
              className="h-9 px-4 bg-gradient-to-r from-primary to-cyan-accent text-white"
            >
              <Send className="h-4 w-4 mr-1.5" /> Envoyer
            </Button>
          </div>
          <div className="text-[10px] text-muted-foreground text-center mt-2">
            Les réponses peuvent référencer des documents confidentiels. Vérifiez avant tout partage
            externe.
          </div>
        </div>
      </Card>
    </div>
  );
}
