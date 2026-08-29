const BASE_URL = "http://localhost:8000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type DocStatus = "Indexed" | "Processing" | "Pending Validation" | "Archived";
export type AccessLevel = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "SECRET";

export interface DocumentRow {
  id: string;
  titre: string;
  extension: string;
  department?: string;
  access_level: AccessLevel;
  taille?: number;
  created_at: string;
}

export interface UploadResponse {
  id: string;
  titre: string;
  extension: string;
  department?: string;
  access_level: AccessLevel;
  chunks_indexed: number;
  message: string;
}

export const documentApi = {
  upload: async (
    file: File,
    department?: string,
    access_level: AccessLevel = "PUBLIC",
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    if (department) formData.append("department", department);
    formData.append("access_level", access_level);

    const res = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Erreur d'upload");
    }
    return res.json();
  },

  list: async (): Promise<DocumentRow[]> => {
    const res = await fetch(`${BASE_URL}/api/documents/`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Erreur de récupération des documents");
    return res.json();
  },

  delete: async (doc_id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/documents/${doc_id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Erreur de suppression");
    }
  },
};
