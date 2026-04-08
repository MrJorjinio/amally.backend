const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5194/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

async function authFetch(url: string, opts: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string> || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { ...opts, headers, cache: "no-store" });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("admin_token");
    window.location.href = "/";
    throw new Error("Unauthorized");
  }
  return res;
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  localStorage.setItem("admin_token", data.token);
  return data;
}

export async function getStats() {
  const res = await authFetch(`${API}/admin/stats`);
  return res.json();
}

export async function getUserGrowth(period: string) {
  const res = await authFetch(`${API}/admin/user-growth?period=${period}`);
  return res.json();
}

export async function getTopPosts(period: string) {
  const res = await authFetch(`${API}/admin/top-posts?period=${period}`);
  return res.json();
}

export async function getUsers(page = 1, pageSize = 20) {
  const res = await authFetch(`${API}/admin/users?page=${page}&pageSize=${pageSize}`);
  return res.json();
}

export async function getPosts(page = 1, pageSize = 20, status = "all") {
  const res = await authFetch(`${API}/admin/posts?page=${page}&pageSize=${pageSize}&status=${status}`);
  return res.json();
}

export async function approvePost(id: string) {
  const res = await authFetch(`${API}/admin/posts/${id}/approve`, { method: "POST" });
  return res.json();
}

export async function rejectPost(id: string) {
  const res = await authFetch(`${API}/admin/posts/${id}/reject`, { method: "POST" });
  return res.json();
}
