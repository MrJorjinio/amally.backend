"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Plus } from "lucide-react";
import { CommentDto, toggleCommentLike } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CommentInput } from "./CommentInput";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hozirgina";
  if (mins < 60) return `${mins}d`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}s`;
  const days = Math.floor(hours / 24);
  return `${days}k`;
}

const COLLAPSE_THRESHOLD = 3;
const MAX_DEPTH = 4;

function countAllReplies(comment: CommentDto): number {
  const replies = comment.replies || [];
  return replies.length + replies.reduce((sum, r) => sum + countAllReplies(r), 0);
}

function sortByLikes(comments: CommentDto[]): CommentDto[] {
  return [...comments].sort((a, b) => b.likesCount - a.likesCount);
}

export function CommentThread({ comment, postId, onReplyAdded, depth = 0 }: {
  comment: CommentDto; postId: string; onReplyAdded: (c: CommentDto) => void; depth?: number;
}) {
  const { token, isLoggedIn, openAuth } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [hov, setHov] = useState(false);
  const [depthExpanded, setDepthExpanded] = useState(false);
  const [liked, setLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likesCount);
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const lastCurveRef = useRef<HTMLDivElement>(null);

  const replies = sortByLikes(comment.replies || []);
  const has = replies.length > 0;
  const vis = showAll ? replies : replies.slice(0, COLLAPSE_THRESHOLD);
  const extra = replies.length - COLLAPSE_THRESHOLD;
  const hasMore = !showAll && extra > 0;
  const atMaxDepth = depth >= MAX_DEPTH && has && !depthExpanded;
  const showKids = has && !collapsed && !atMaxDepth;
  const ini = comment.author.fullName.split(" ").map(w => w[0]).join("").slice(0, 2);
  const total = vis.length + (hasMore ? 1 : 0);
  const col = hov ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.08)";

  // Measure exact line height so it stops where the last curve bends
  useLayoutEffect(() => {
    if (!showKids || !lineRef.current || !lastCurveRef.current) return;
    const lineTop = lineRef.current.getBoundingClientRect().top;
    const curveTop = lastCurveRef.current.getBoundingClientRect().top;
    lineRef.current.style.height = `${Math.max(4, curveTop - lineTop + 10)}px`;
  });

  const handleLike = async () => {
    if (!isLoggedIn) { openAuth(); return; }
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    try {
      await toggleCommentLike(comment.id, token!);
    } catch {
      setLiked(liked);
      setLikeCount(likeCount);
    }
  };

  const goParent = () => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    ref.current?.classList.add("highlight-comment");
    setTimeout(() => ref.current?.classList.remove("highlight-comment"), 1500);
  };

  return (
    <div ref={ref} style={{ paddingTop: depth === 0 ? 12 : 0 }}>
      <div className="flex gap-[10px]">
        {/* LEFT COL: avatar + measured line */}
        <div className="flex flex-col items-center shrink-0" style={{ width: 32 }}>
          {comment.author.profilePictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.author.profilePictureUrl} alt={comment.author.fullName} className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#141414]/[0.05] flex items-center justify-center text-[10px] font-semibold text-[#141414]/40 shrink-0">{ini}</div>
          )}
          {showKids && (
            <div
              ref={lineRef}
              className="cursor-pointer mt-[2px]"
              style={{ width: 2, minHeight: 4, borderRadius: 1, backgroundColor: col, transition: "background-color 0.15s" }}
              onMouseEnter={() => setHov(true)}
              onMouseLeave={() => setHov(false)}
              onClick={goParent}
            />
          )}
        </div>

        {/* RIGHT COL */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap h-8">
            <Link href={`/profile/${comment.author.username}`} className="text-[13px] font-semibold text-[#141414] hover:text-[#69824f] hover:underline">{comment.author.fullName}</Link>
            <Link href={`/profile/${comment.author.username}`} className="text-[11px] text-[#141414]/25 hover:text-[#141414]/40">@{comment.author.username}</Link>
            <span className="text-[11px] text-[#141414]/20">· {timeAgo(comment.createdAt)}</span>
          </div>

          {!collapsed ? (
            <>
              <p className="text-[14px] text-[#141414]/65 leading-relaxed mt-0.5">{comment.content}</p>
              <div className="flex items-center gap-4 mt-2 mb-1">
                <button onClick={handleLike} className="flex items-center gap-1 transition-colors">
                  <Heart size={14} strokeWidth={1.5} className={liked ? "fill-[#69824f] text-[#69824f]" : "text-[#141414]/25 hover:text-[#69824f]/60"} />
                  {likeCount > 0 && <span className={`text-[11px] ${liked ? "text-[#69824f]" : "text-[#141414]/25"}`}>{likeCount}</span>}
                </button>
                <button onClick={() => setShowReply(!showReply)}
                  className="flex items-center gap-1 text-[11px] text-[#141414]/25 hover:text-[#69824f] transition-colors">
                  <MessageCircle size={13} strokeWidth={1.5} /> Javob
                </button>
              </div>
              {showReply && (
                <div className="mb-2">
                  <CommentInput postId={postId} parentId={comment.id}
                    onCommentAdded={(c) => { onReplyAdded(c); setShowReply(false); }}
                    onCancel={() => setShowReply(false)}
                    placeholder={`@${comment.author.fullName} ga javob...`} compact />
                </div>
              )}

              {atMaxDepth && (
                <div className="mt-2">
                  <button onClick={() => setDepthExpanded(true)}
                    className="flex items-center gap-2 text-[12px] text-[#141414]/30 hover:text-[#141414]/50 transition-colors">
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0">
                      <Plus size={11} strokeWidth={2} /></span>
                    {countAllReplies(comment)} ta javob ko&apos;rish
                  </button>
                </div>
              )}

              {/* CHILDREN */}
              {showKids && vis.map((r, i) => {
                const isLast = i === total - 1;
                return (
                  <div key={r.id} className="relative" style={{ marginLeft: -42, paddingLeft: 42, marginTop: 4 }}>
                    <div
                      ref={isLast ? lastCurveRef : undefined}
                      className="absolute pointer-events-none"
                      style={{
                        left: 15, top: 0, width: 22, height: 20,
                        borderBottom: `2px solid ${col}`,
                        borderBottomLeftRadius: 12,
                        transition: "border-color 0.15s",
                      }}
                    />
                    <div
                      className="absolute cursor-pointer"
                      style={{ left: 13, top: 0, width: 10, height: 20 }}
                      onMouseEnter={() => setHov(true)}
                      onMouseLeave={() => setHov(false)}
                      onClick={(e) => { e.stopPropagation(); goParent(); }}
                    />
                    <CommentThread comment={r} postId={postId} onReplyAdded={onReplyAdded} depth={depth + 1} />
                  </div>
                );
              })}

              {showKids && hasMore && (
                <div className="relative" style={{ marginLeft: -42, paddingLeft: 42, marginTop: 4 }}>
                  <div
                    ref={lastCurveRef}
                    className="absolute pointer-events-none"
                    style={{
                      left: 15, top: 0, width: 22, height: 16,
                      borderBottom: `2px solid ${col}`,
                      borderBottomLeftRadius: 12,
                      transition: "border-color 0.15s",
                    }}
                  />
                  <div className="pt-1 pb-1">
                    <button onClick={() => setShowAll(true)}
                      className="flex items-center gap-2 text-[12px] text-[#141414]/30 hover:text-[#141414]/50 transition-colors">
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0">
                        <Plus size={11} strokeWidth={2} /></span>
                      Yana {extra} ta javob ko&apos;rish
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            has && (
              <div className="relative mt-1 mb-1" style={{ marginLeft: -42, paddingLeft: 42 }}>
                {/* Bending line from avatar to collapsed button */}
                <div className="absolute pointer-events-none" style={{
                  left: 15, top: -6, width: 22, height: 18,
                  borderBottom: `2px solid rgba(0,0,0,0.08)`,
                  borderBottomLeftRadius: 12,
                  transition: "border-color 0.15s",
                }} />
                <button onClick={() => setCollapsed(false)}
                  className="flex items-center gap-2 text-[12px] text-[#141414]/30 hover:text-[#141414]/50 transition-colors">
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0">
                    <Plus size={11} strokeWidth={2} /></span>
                  {replies.length} ta javob ko&apos;rish
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
