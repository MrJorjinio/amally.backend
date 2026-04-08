"use client";

import { Heart, MessageCircle, Bookmark, Share2, Loader2, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPosts, searchPosts, toggleLike, toggleBookmark, PostDto } from "@/lib/api";

const GRADIENTS = [
  "from-emerald-100 to-green-50", "from-lime-100 to-emerald-50", "from-teal-100 to-green-50",
  "from-green-100 to-lime-50", "from-emerald-100 to-teal-50", "from-lime-100 to-green-50",
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hozirgina";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

interface SearchFilters {
  query: string;
  categories: Set<string>;
  regions: Set<string>;
  levels: Set<string>;
}

interface PostFeedProps {
  filters?: SearchFilters;
  refreshKey?: number;
  allCategories?: { id: number; name: string }[];
  allRegions?: { id: number; name: string }[];
}

export function PostFeed({ filters, refreshKey, allCategories, allRegions }: PostFeedProps) {
  const { token, isReady } = useAuth();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    try {
      const query = filters?.query?.trim();
      const hasTextSearch = !!query;

      // Resolve filter names to IDs
      const catId = filters?.categories.size === 1
        ? allCategories?.find(c => filters.categories.has(c.name))?.id
        : undefined;
      const regId = filters?.regions.size === 1
        ? allRegions?.find(r => filters.regions.has(r.name))?.id
        : undefined;

      let result;
      if (hasTextSearch) {
        result = await searchPosts(query, pageNum, 20, token);
      } else {
        result = await getPosts(pageNum, 20, catId, regId, undefined, token);
      }

      // Client-side filter for multi-select (API only supports single category/region)
      let items = result.items;
      if (filters && !hasTextSearch) {
        if (filters.categories.size > 1) {
          items = items.filter(p => filters.categories.has(p.categoryName));
        }
        if (filters.regions.size > 1) {
          items = items.filter(p => filters.regions.has(p.regionName));
        }
      }

      if (append) setPosts(prev => [...prev, ...items]);
      else setPosts(items);
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch { /* silent */ }
    finally { setLoading(false); setLoadingMore(false); }
  }, [filters, token, allCategories, allRegions]);

  useEffect(() => { if (isReady) fetchPosts(1); }, [fetchPosts, refreshKey, isReady]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchPosts(page + 1, true);
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchPosts]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#69824f]/30" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[15px] text-[#141414]/30">
          {filters?.query?.trim() ? "Hech narsa topilmadi" : "Hali postlar yo'q. Birinchi bo'ling!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {posts.map((post, i) => (
        <FeedCard key={post.id} post={post} gradientIndex={i} />
      ))}
      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />
      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 size={18} className="animate-spin text-[#69824f]/30" />
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <p className="text-center text-[12px] text-[#141414]/20 py-4">Barcha postlar ko&apos;rsatildi</p>
      )}
    </div>
  );
}

function FeedCard({ post, gradientIndex }: { post: PostDto; gradientIndex: number }) {
  const router = useRouter();
  const { token, isLoggedIn, openAuth } = useAuth();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) { openAuth(); return; }
    setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try { await toggleLike(post.id, token!); } catch { setLiked(liked); setLikeCount(likeCount); }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) { openAuth(); return; }
    setBookmarked(!bookmarked);
    try { await toggleBookmark(post.id, token!); } catch { setBookmarked(bookmarked); }
  };

  return (
    <article
      onClick={() => router.push(`/post/${post.id}`)}
      className="border border-black/[0.06] rounded-2xl overflow-hidden hover:border-black/[0.08] transition-colors cursor-pointer"
    >
      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageUrl} alt={post.title} className="w-full h-36 sm:h-48 object-cover" />
      ) : (
        <div className={`w-full h-28 sm:h-36 bg-gradient-to-br ${gradient}`} />
      )}

      <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-2 sm:pb-3 flex items-center gap-2.5 sm:gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden relative shrink-0 bg-[#141414]/[0.04]">
          {post.author.profilePictureUrl ? (
            <Image src={post.author.profilePictureUrl} alt={post.author.fullName} fill className="object-cover" sizes="40px" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[12px] sm:text-[13px] font-semibold text-[#141414]/40">
              {post.author.fullName.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Link href={`/profile/${post.author.username}`} onClick={e => e.stopPropagation()} className="text-[13px] sm:text-[14px] font-semibold text-[#141414] truncate hover:text-[#69824f] hover:underline">{post.author.fullName}</Link>
            <Link href={`/profile/${post.author.username}`} onClick={e => e.stopPropagation()} className="text-[11px] sm:text-[12px] text-[#141414]/30 hover:text-[#141414]/50 shrink-0">@{post.author.username}</Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] text-[#141414]/35 truncate">
            <span>{post.regionName}</span><span>·</span>
            <span>{timeAgo(post.createdAt)}</span><span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-[#141414]/25">{post.categoryName}</span>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-5 pb-2 sm:pb-3">
        <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#141414] leading-snug line-clamp-1 sm:line-clamp-2 break-words overflow-hidden">{post.title}</h3>
        <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-[14px] text-[#141414]/55 leading-relaxed line-clamp-2 sm:line-clamp-3 break-words">{post.content}</p>
      </div>

      <div className="px-3 sm:px-5 pb-3 sm:pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-5">
          <button onClick={handleLike} className="flex items-center gap-1 sm:gap-1.5 group">
            <Heart size={16} strokeWidth={1.5} className={`transition-colors ${liked ? "fill-[#69824f] text-[#69824f]" : "text-[#141414]/30 group-hover:text-[#69824f]/60"}`} />
            <span className={`text-[12px] sm:text-[13px] ${liked ? "text-[#69824f]" : "text-[#141414]/35"}`}>{likeCount}</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); router.push(`/post/${post.id}`); }} className="flex items-center gap-1 sm:gap-1.5 group">
            <MessageCircle size={16} strokeWidth={1.5} className="text-[#141414]/30 group-hover:text-[#69824f]/60 transition-colors" />
            <span className="text-[12px] sm:text-[13px] text-[#141414]/35">{post.commentsCount}</span>
          </button>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Eye size={15} strokeWidth={1.5} className="text-[#141414]/30" />
            <span className="text-[12px] sm:text-[13px] text-[#141414]/35">{post.viewsCount}</span>
          </div>
          <button onClick={(e) => {
            e.stopPropagation();
            const url = `${window.location.origin}/post/${post.id}`;
            if (navigator.share) navigator.share({ title: post.title, url });
            else navigator.clipboard.writeText(url);
          }} className="group hidden sm:block">
            <Share2 size={16} strokeWidth={1.5} className="text-[#141414]/30 group-hover:text-[#69824f]/60 transition-colors" />
          </button>
        </div>
        <button onClick={handleBookmark} className="group">
          <Bookmark size={16} strokeWidth={1.5} className={`transition-colors ${bookmarked ? "fill-[#69824f] text-[#69824f]" : "text-[#141414]/30 group-hover:text-[#69824f]/60"}`} />
        </button>
      </div>
    </article>
  );
}
