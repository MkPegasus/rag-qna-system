const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface Source {
  filename: string;
  page?: number;
  text_preview: string;
  score?: number;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  response_time_ms?: number;
  createdAt: string;
}

export interface AskResponse {
  question: string;
  answer: string;
  sources: Source[];
  response_time_ms: number;
  conversation_id: string;
}

export interface Conversation {
  id: string;
  date_debut: string;
  messages: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  contenu: string;
  role: "user" | "assistant";
  sources_json?: string;
  created_at: string;
}

export const chatApi = {
  ask: async (question: string, conversation_id?: string): Promise<AskResponse> => {
    const res = await fetch(`${BASE_URL}/api/chat/ask`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ question, conversation_id }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Erreur lors de la requête");
    }
    return res.json();
  },

  getHistory: async (): Promise<Conversation[]> => {
    const res = await fetch(`${BASE_URL}/api/chat/history`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Erreur de récupération de l'historique");
    return res.json();
  },

  getConversation: async (conversation_id: string): Promise<Conversation> => {
    const res = await fetch(`${BASE_URL}/api/chat/history/${conversation_id}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Conversation introuvable");
    return res.json();
  },
};
