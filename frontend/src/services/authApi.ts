const BASE_URL = "http://localhost:8000";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "DOCUMENT_MANAGER" | "ADMIN";
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Erreur de connexion");
    }
    return res.json();
  },

  register: async (data: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<UserProfile> => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Erreur d'inscription");
    }
    return res.json();
  },

  me: async (): Promise<UserProfile> => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Session expirée");
    return res.json();
  },

  signOut: async () => {
    localStorage.removeItem("token");
    return { ok: true };
  },
};
