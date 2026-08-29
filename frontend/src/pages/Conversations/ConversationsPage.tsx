import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessagesSquare, Clock, MessageCircle } from "lucide-react";
import { chatApi, type Conversation } from "@/services/chatApi";
import { useNavigate } from "@tanstack/react-router";

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    chatApi
      .getHistory()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = async (conv: Conversation) => {
    setLoadingId(conv.id);
    try {
      // Appelle GET /api/chat/history/{conversation_id}
      const full = await chatApi.getConversation(conv.id);
      // Stocke la conversation complète pour AssistantPage
      sessionStorage.setItem("load_conversation", JSON.stringify(full));
      navigate({ to: "/assistant" });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conversations</h1>
        <p className="text-sm text-muted-foreground">
          Vos sessions précédentes avec l'assistant, entièrement consultables.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement…</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucune conversation pour le moment. Commencez par poser une question à l'assistant !
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {conversations.map((c) => {
            const firstUserMsg = c.messages?.find((m) => m.role === "user");
            const preview = firstUserMsg
              ? firstUserMsg.contenu.slice(0, 80) + (firstUserMsg.contenu.length > 80 ? "…" : "")
              : `Conversation du ${new Date(c.date_debut).toLocaleDateString("fr-FR")}`;

            return (
              <Card
                key={c.id}
                className="glass border-border hover:border-cyan-accent/40 transition cursor-pointer"
                onClick={() => handleOpen(c)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-accent grid place-items-center">
                        {loadingId === c.id ? (
                          <div className="h-4 w-4 rounded-full border-2 border-cyan-accent border-t-transparent animate-spin" />
                        ) : (
                          <MessagesSquare className="h-4 w-4 text-cyan-accent" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{preview}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(c.date_debut).toLocaleDateString("fr-FR")}
                          <MessageCircle className="h-3 w-3 ml-1" />
                          {c.messages?.length ?? 0} messages
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      RAG
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
