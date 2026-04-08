"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Bookmark, Share2, Loader2, MessageCircle, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getPost, getComments, toggleLike, toggleBookmark, recordPostView, PostDto, CommentDto } from "@/lib/api";
import { CommentThread } from "./CommentThread";
import { CommentInput } from "./CommentInput";

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

export function PostDetailContent({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = use(paramsPromise);
  const router = useRouter();
  const { token, isLoggedIn, openAuth, isReady } = useAuth();
  const [post, setPost] = useState<PostDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const viewRecorded = useRef(false);

  useEffect(() => {
    if (!isReady) return;
    (async () => {
      const [p, c] = await Promise.all([
        getPost(id, token),
        getComments(id, token),
      ]);
      if (p) {
        setPost(p);
        setLiked(p.isLiked);
        setLikeCount(p.likesCount);
        setBookmarked(p.isBookmarked);
        setCommentCount(p.commentsCount);
      }
      setComments(c);
      setLoading(false);

      // Record view once per page visit
      if (!viewRecorded.current) {
        viewRecorded.current = true;
        recordPostView(id, token);
      }
    })();
  }, [id, token, isReady]);

  const handleLike = async () => {
    if (!isLoggedIn) { openAuth(); return; }
    setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try { await toggleLike(id, token!); } catch { setLiked(liked); setLikeCount(likeCount); }
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) { openAuth(); return; }
    setBookmarked(!bookmarked);
    try { await toggleBookmark(id, token!); } catch { setBookmarked(bookmarked); }
  };

  const handleNewComment = (c: CommentDto) => {
    setComments(prev => [...prev, c]);
    setCommentCount(n => n + 1);
  };

  const handleReplyAdded = (newComment: CommentDto) => {
    setComments(prev => {
      const addReply = (list: CommentDto[]): CommentDto[] =>
        list.map(item => item.id === newComment.parentCommentId
          ? { ...item, replies: [...(item.replies || []), newComment] }
          : { ...item, replies: addReply(item.replies || []) });
      return addReply(prev);
    });
    setCommentCount(n => n + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#69824f]/30" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-[16px] text-[#141414]/40">Post topilmadi</p>
        <button onClick={() => router.back()} className="text-[14px] text-[#141414]/60 hover:text-[#141414] transition-colors">
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const initials = post.author.fullName.split(" ").map(w => w[0]).join("").slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <button onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-black/[0.03] text-[#141414]/50 hover:text-[#141414] transition-colors">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <span className="text-[15px] font-semibold text-[#141414]">Post</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        {/* Author */}
        <div className="pt-5 sm:pt-6 pb-3 sm:pb-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#141414]/[0.04] flex items-center justify-center text-[13px] sm:text-[14px] font-semibold text-[#141414]/40 shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <Link href={`/profile/${post.author.username}`} className="text-[14px] sm:text-[15px] font-semibold text-[#141414] hover:text-[#69824f] hover:underline truncate block">{post.author.fullName}</Link>
            <p className="text-[12px] sm:text-[13px] text-[#141414]/35 truncate"><Link href={`/profile/${post.author.username}`} className="hover:text-[#141414]/50">@{post.author.username}</Link> · {post.regionName} · {timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* Banner */}
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt={post.title} className="w-full rounded-xl sm:rounded-2xl object-cover max-h-60 sm:max-h-80 mb-4 sm:mb-5" />
        )}

        {/* Title */}
        <h1 className="text-[20px] sm:text-[26px] font-bold text-[#141414] leading-tight tracking-tight">
          {post.title}
        </h1>

        {/* Content */}
        <p className="mt-3 sm:mt-4 text-[14px] sm:text-[16px] text-[#141414]/65 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>

        {/* Meta */}
        <div className="mt-5 flex items-center gap-2 text-[12px] text-[#141414]/30">
          <span className="px-2.5 py-1 rounded-full bg-black/[0.03]">{post.categoryName}</span>
        </div>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-black/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={handleLike} className="flex items-center gap-1.5 sm:gap-2 group">
              <Heart size={18} strokeWidth={1.5} className={`transition-colors ${liked ? "fill-[#69824f] text-[#69824f]" : "text-[#141414]/30 group-hover:text-[#69824f]/60"}`} />
              <span className={`text-[13px] sm:text-[14px] ${liked ? "text-[#69824f]" : "text-[#141414]/40"}`}>{likeCount}</span>
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[#141414]/30">
              <MessageCircle size={18} strokeWidth={1.5} />
              <span className="text-[13px] sm:text-[14px] text-[#141414]/40">{commentCount}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[#141414]/30">
              <Eye size={18} strokeWidth={1.5} />
              <span className="text-[13px] sm:text-[14px] text-[#141414]/40">{post.viewsCount}</span>
            </div>
            <button onClick={() => {
              const url = window.location.href;
              if (navigator.share) navigator.share({ title: post.title, url });
              else navigator.clipboard.writeText(url);
            }} className="group">
              <Share2 size={17} strokeWidth={1.5} className="text-[#141414]/30 group-hover:text-[#69824f]/60 transition-colors" />
            </button>
          </div>
          <button onClick={handleBookmark} className="group">
            <Bookmark size={18} strokeWidth={1.5} className={`transition-colors ${bookmarked ? "fill-[#69824f] text-[#69824f]" : "text-[#141414]/30 group-hover:text-[#69824f]/60"}`} />
          </button>
        </div>

        {/* Comment input */}
        <div className="mt-6 pt-5 border-t border-black/[0.04]">
          <CommentInput postId={id} onCommentAdded={handleNewComment} />
        </div>

        {/* Comments */}
        <div className="mt-6 space-y-1">
          {comments.filter(c => !c.parentCommentId).length === 0 ? (
            <p className="text-[13px] text-[#141414]/25 text-center py-8">Birinchi izoh qoldiring</p>
          ) : (
            comments.filter(c => !c.parentCommentId)
              .sort((a, b) => b.likesCount - a.likesCount)
              .map(c => (
                <CommentThread key={c.id} comment={c} postId={id} onReplyAdded={handleReplyAdded} />
              ))
          )}
        </div>
      </div>
    </div>
  );
}
