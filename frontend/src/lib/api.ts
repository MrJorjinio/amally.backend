const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5194/api";

// Global 401 handler — clears expired auth
function handle401() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("amally_token");
    localStorage.removeItem("amally_user");
    window.dispatchEvent(new Event("auth-expired"));
  }
}

export interface PostDto {
  id: string;
  title: string;
  content: string;
  coverImageUrl: string | null;
  author: UserSummaryDto;
  categoryName: string;
  categorySlug: string;
  regionName: string;
  educationLevel: number;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserSummaryDto {
  id: string;
  username: string;
  fullName: string;
  profilePictureUrl: string | null;
}

export interface TopAuthorDto {
  author: UserSummaryDto;
  topPost: {
    id: string;
    title: string;
    coverImageUrl: string | null;
    likesCount: number;
    commentsCount: number;
  };
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface RegionDto {
  id: number;
  name: string;
}

// --- Auth ---

export async function login(emailOrUsername: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emailOrUsername, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Xatolik yuz berdi" }));
    throw new Error(err.error || "Noto'g'ri login yoki parol");
  }
  return res.json();
}

export async function register(username: string, fullName: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, fullName, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Xatolik yuz berdi" }));
    throw new Error(err.error || "Ro'yxatdan o'tishda xatolik");
  }
  return res.json();
}

// --- Posts ---

export async function getPosts(
  page = 1, pageSize = 20,
  categoryId?: number, regionId?: number, educationLevel?: number,
  token?: string | null,
): Promise<PaginatedResult<PostDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (categoryId) params.set("categoryId", String(categoryId));
  if (regionId) params.set("regionId", String(regionId));
  if (educationLevel !== undefined) params.set("educationLevel", String(educationLevel));

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/posts?${params}`, { headers, cache: "no-store" });
    if (!res.ok) return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
    return res.json();
  } catch {
    return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
  }
}

export async function searchPosts(query: string, page = 1, pageSize = 20, token?: string | null): Promise<PaginatedResult<PostDto>> {
  const params = new URLSearchParams({ q: query, page: String(page), pageSize: String(pageSize) });
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}/posts/search?${params}`, { headers, cache: "no-store" });
    if (!res.ok) return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
    return res.json();
  } catch {
    return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
  }
}

export async function getPost(id: string, token?: string | null): Promise<PostDto | null> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, { headers, cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function createPost(
  data: { title: string; content: string; categoryId: number; regionId: number; educationLevel: number; coverImageUrl?: string },
  token: string,
): Promise<PostDto> {
  const res = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Xatolik yuz berdi" }));
    // Handle ASP.NET validation errors format
    if (err.errors) {
      const messages = Object.values(err.errors).flat().join(". ");
      throw new Error(messages);
    }
    throw new Error(err.error || "Post yaratishda xatolik");
  }
  return res.json();
}

export async function toggleLike(postId: string, token: string): Promise<{ isLiked: boolean }> {
  const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (res.status === 401) { handle401(); throw new Error("Token muddati tugagan"); }
  if (!res.ok) throw new Error("Xatolik");
  return res.json();
}

export async function toggleBookmark(postId: string, token: string): Promise<{ isBookmarked: boolean }> {
  const res = await fetch(`${API_BASE}/posts/${postId}/bookmark`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (res.status === 401) { handle401(); throw new Error("Token muddati tugagan"); }
  if (!res.ok) throw new Error("Xatolik");
  return res.json();
}

export async function recordPostView(postId: string, token?: string | null): Promise<void> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    await fetch(`${API_BASE}/posts/${postId}/view`, { method: "POST", headers });
  } catch { /* silent */ }
}

export async function getHottestPosts(limit = 6): Promise<PostDto[]> {
  try {
    const res = await fetch(`${API_BASE}/posts/hottest?limit=${limit}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function getTopAuthors(limit = 50): Promise<TopAuthorDto[]> {
  try {
    const res = await fetch(`${API_BASE}/posts/top-authors?limit=${limit}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

// --- Categories & Regions ---

export async function getCategories(): Promise<CategoryDto[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export interface TrendingCategoryDto {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}

export async function getTrendingCategories(limit = 8): Promise<TrendingCategoryDto[]> {
  try {
    const res = await fetch(`${API_BASE}/categories/trending?limit=${limit}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function getRegions(): Promise<RegionDto[]> {
  try {
    const res = await fetch(`${API_BASE}/regions`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

// --- Upload ---

export async function uploadImage(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/upload/image`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Rasm yuklashda xatolik" }));
    throw new Error(err.error || "Rasm yuklashda xatolik");
  }
  const data = await res.json();
  return data.url;
}

// --- Comments ---

export interface CommentDto {
  id: string;
  content: string;
  author: UserSummaryDto;
  parentCommentId: string | null;
  likesCount: number;
  isLiked: boolean;
  replies: CommentDto[];
  createdAt: string;
  updatedAt: string | null;
}

export async function getComments(postId: string, token?: string | null): Promise<CommentDto[]> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, { headers, cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function toggleCommentLike(commentId: string, token: string): Promise<{ isLiked: boolean }> {
  const res = await fetch(`${API_BASE}/comments/${commentId}/like`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (res.status === 401) { handle401(); throw new Error("Token muddati tugagan"); }
  if (!res.ok) throw new Error("Xatolik");
  return res.json();
}

export async function createComment(postId: string, content: string, token: string, parentCommentId?: string): Promise<CommentDto> {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ content, parentCommentId: parentCommentId || null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Xatolik" }));
    throw new Error(err.errors ? Object.values(err.errors).flat().join(". ") : err.error || "Xatolik");
  }
  return res.json();
}

// --- Users ---

export interface UserProfileDto {
  id: string;
  username: string;
  fullName: string;
  profilePictureUrl: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  createdAt: string;
}

export interface UserCommentDto {
  id: string;
  content: string;
  likesCount: number;
  postId: string;
  postTitle: string;
  createdAt: string;
}

export async function updateProfile(data: { fullName?: string; bio?: string; profilePictureUrl?: string }, token: string): Promise<UserProfileDto> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (res.status === 401) { handle401(); throw new Error("Token muddati tugagan"); }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Xatolik" }));
    throw new Error(err.errors ? Object.values(err.errors as Record<string, string[]>).flat().join(". ") : err.error || "Profilni yangilashda xatolik");
  }
  return res.json();
}

export async function getUserProfileByUsername(username: string, token?: string | null): Promise<UserProfileDto | null> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE}/users/by-username/${username}`, { headers, cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function getUserPosts(userId: string, page = 1, pageSize = 20, token?: string | null): Promise<PaginatedResult<PostDto>> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/posts?page=${page}&pageSize=${pageSize}`, { headers, cache: "no-store" });
    if (!res.ok) return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
    return res.json();
  } catch {
    return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
  }
}

export async function getUserComments(userId: string, page = 1, pageSize = 20): Promise<PaginatedResult<UserCommentDto>> {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/comments?page=${page}&pageSize=${pageSize}`, { cache: "no-store" });
    if (!res.ok) return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
    return res.json();
  } catch {
    return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
  }
}

export async function getUserBookmarks(page = 1, pageSize = 20, token: string): Promise<PaginatedResult<PostDto>> {
  try {
    const res = await fetch(`${API_BASE}/users/me/bookmarks?page=${page}&pageSize=${pageSize}`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
    return res.json();
  } catch {
    return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
  }
}

export async function getUserSuggestions(limit = 5, token?: string | null): Promise<UserSummaryDto[]> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE}/users/suggestions?limit=${limit}`, { headers, cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export async function toggleFollow(userId: string, token: string): Promise<{ isFollowing: boolean }> {
  const res = await fetch(`${API_BASE}/users/${userId}/follow`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (res.status === 401) { handle401(); throw new Error("Token muddati tugagan"); }
  if (!res.ok) throw new Error("Xatolik");
  return res.json();
}

export async function getFeed(page = 1, pageSize = 20, token: string): Promise<PaginatedResult<PostDto>> {
  try {
    const res = await fetch(`${API_BASE}/posts/feed?page=${page}&pageSize=${pageSize}`, {
      headers: { "Authorization": `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
    return res.json();
  } catch {
    return { items: [], totalCount: 0, page, pageSize, totalPages: 0, hasMore: false };
  }
}
