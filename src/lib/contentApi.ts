const BASE_URL = import.meta.env.VITE_CONTENT_API_URL || "/api";
const TOKEN_KEY = "content_admin_token";

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

export const contentApi = {
  login: (username: string, password: string) =>
    request<{ token: string }>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  getContent: (key: string) => request<unknown>(`/content/${key}`),
  saveContent: (key: string, value: unknown) =>
    request<{ ok: true }>(`/content/${key}`, { method: "PUT", body: JSON.stringify(value) }),

  getProducts: (slugs?: string[]) =>
    request<any[]>(`/products${slugs?.length ? `?slugs=${slugs.join(",")}` : ""}`),
  getProduct: (slug: string) => request<any>(`/products/${slug}`),
  saveProduct: (slug: string, patch: { name?: string; description?: string; price?: number; metadata?: unknown }) =>
    request<any>(`/products/${slug}`, { method: "PUT", body: JSON.stringify(patch) }),

  upload: async (file: File): Promise<{ url: string }> => {
    const token = getAdminToken();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/uploads`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Error ${res.status}`);
    }
    const { url } = await res.json();
    return { url: resolveAssetUrl(url) };
  },
};

// Uploaded file URLs come back as server-relative paths (e.g. "/uploads/x.jpg"). Resolve them
// against the API's own origin, since in dev the API can run on a different port than Vite.
function resolveAssetUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url;
  try {
    const apiOrigin = new URL(BASE_URL, window.location.origin).origin;
    return `${apiOrigin}${url}`;
  } catch {
    return url;
  }
}
