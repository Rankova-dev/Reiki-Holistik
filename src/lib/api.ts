const BASE_URL = import.meta.env.VITE_CONTENT_API_URL || "/api";
const TOKEN_KEY = "account_token";

export function getAccountToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccountToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccountToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// The server returns media URLs as server-relative paths (e.g. "/api/course-content/x/video").
// Resolve them against the API's own origin, since in dev the API can run on a different port
// than Vite (mirrors the same helper in contentApi.ts).
function resolveApiUrl(serverPath: string): string {
  if (/^https?:\/\//.test(serverPath)) return serverPath;
  try {
    const apiOrigin = new URL(BASE_URL, window.location.origin).origin;
    return `${apiOrigin}${serverPath}`;
  } catch {
    return serverPath;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccountToken();
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

export interface AccountUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "user" | "admin";
}

export const api = {
  // ---- account (auth) ----
  register: (email: string, password: string, name?: string) =>
    request<{ token: string; user: AccountUser }>("/account/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: AccountUser }>("/account/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  socialLogin: (provider: "google" | "apple", credential: string, name?: string | null) =>
    request<{ token: string }>("/account/social", {
      method: "POST",
      body: JSON.stringify({ provider, credential, name }),
    }),
  me: () => request<AccountUser>("/account/me"),
  updateMe: (patch: { name?: string; phone?: string }) =>
    request<AccountUser>("/account/me", { method: "PATCH", body: JSON.stringify(patch) }),
  adminUsersByIds: (ids: string[]) =>
    request<{ id: string; name: string | null; email: string }[]>(
      `/account/users?ids=${ids.join(",")}`
    ),

  // ---- payment requests ----
  createPaymentRequest: (payload: {
    product_id: string;
    pricing_option: string;
    amount: number;
    proof_url?: string | null;
    format?: string;
    contact_note?: string;
  }) => request<any>("/payment-requests", { method: "POST", body: JSON.stringify(payload) }),
  myPaymentRequests: () => request<any[]>("/payment-requests/mine"),
  allPaymentRequests: () => request<any[]>("/payment-requests"),
  updatePaymentRequestStatus: (id: string, status: "approved" | "rejected" | "pending") =>
    request<any>(`/payment-requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deletePaymentRequest: (id: string) => request<{ ok: true }>(`/payment-requests/${id}`, { method: "DELETE" }),

  // ---- purchases ----
  myPurchases: () => request<any[]>("/purchases/mine"),
  membershipEligible: () => request<{ eligible: boolean }>("/purchases/membership-eligible"),

  // ---- session credits ----
  mySessionCredits: () => request<any[]>("/session-credits/mine"),
  allSessionCredits: () => request<any[]>("/session-credits"),

  // ---- course content / library ----
  courseContent: (productIds: string[]) =>
    productIds.length ? request<any[]>(`/course-content?product_ids=${productIds.join(",")}`) : Promise.resolve([]),
  videoUrl: async (lessonId: string) => {
    const { url } = await request<{ url: string }>(`/course-content/${lessonId}/video-url`);
    return { url: resolveApiUrl(url) };
  },
  pdfUrl: async (lessonId: string) => {
    const { url } = await request<{ url: string }>(`/course-content/${lessonId}/pdf-url`);
    return { url: resolveApiUrl(url) };
  },
  myProgress: () => request<any[]>("/user-progress/mine"),
  markProgress: (courseContentId: string, completed: boolean) =>
    request<{ ok: true }>("/user-progress", {
      method: "PUT",
      body: JSON.stringify({ course_content_id: courseContentId, completed }),
    }),

  // ---- bookings ----
  myBookings: (all = false) => request<any[]>(`/bookings/mine${all ? "?all=true" : ""}`),
  myMonthlyLimit: (month?: string) => request<any[]>(`/bookings/monthly-limit${month ? `?month=${month}` : ""}`),

  // ---- group sessions ----
  groupSessions: () => request<any[]>("/group-sessions"),
  adminGroupSessions: () => request<any[]>("/group-sessions/admin"),
  createGroupSession: (payload: {
    course_id: string;
    title: string;
    proposed_datetime: string;
    duration_minutes?: number;
    format?: string;
    status?: string;
    admin_notes?: string;
  }) => request<any>("/group-sessions", { method: "POST", body: JSON.stringify(payload) }),
  updateGroupSession: (id: string, patch: Record<string, unknown>) =>
    request<any>(`/group-sessions/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteGroupSession: (id: string) => request<{ ok: true }>(`/group-sessions/${id}`, { method: "DELETE" }),
  sessionAttendance: (sessionId: string) => request<any[]>(`/group-sessions/${sessionId}/attendance`),
  myAttendance: () => request<any[]>("/group-sessions/attendance/mine"),
  attendedForCourse: (courseId: string) => request<any[]>(`/group-sessions/attended?course_id=${courseId}`),
  registerForSession: (id: string) => request<any>(`/group-sessions/${id}/register`, { method: "POST" }),
  cancelSessionRegistration: (id: string) => request<any>(`/group-sessions/${id}/cancel`, { method: "POST" }),
  toggleAttendance: (attendanceId: string, attended: boolean) =>
    request<any>(`/group-sessions/attendance/${attendanceId}`, { method: "PATCH", body: JSON.stringify({ attended }) }),

  // ---- payment proof uploads (multipart — bypasses the JSON request() helper) ----
  uploadPaymentProof: async (file: File): Promise<{ path: string }> => {
    const token = getAccountToken();
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/payment-proofs`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Error ${res.status}`);
    }
    return res.json();
  },

  // Payment proof images require the Authorization header (they're personal financial
  // documents, not publicly reachable), so an <img src> can't load them directly — fetch as a
  // blob and hand back an object URL instead. Caller is responsible for URL.revokeObjectURL().
  fetchPaymentProofBlobUrl: async (proofPath: string): Promise<string> => {
    const token = getAccountToken();
    const res = await fetch(`${BASE_URL}/payment-proofs/${proofPath}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error("No se pudo cargar el justificante");
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};
