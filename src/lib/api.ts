const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
};

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("velora-admin-token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("velora-admin-token", token);
  else localStorage.removeItem("velora-admin-token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { formData?: FormData } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let body = options.body;
  if (options.formData) {
    body = options.formData;
  } else if (body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export { API_URL };
