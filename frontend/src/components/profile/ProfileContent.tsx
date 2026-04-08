"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Eye, Bookmark, Share2, Loader2, Camera, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserProfileByUsername, getUserPosts, getUserComments, getUserBookmarks, toggleFollow,
  toggleLike, toggleBookmark, updateProfile, uploadImage,
  UserProfileDto, PostDto, UserCommentDto,
} from "@/lib/api";

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

const GRADIENTS = [
  "from-emerald-100 to-green-50", "from-lime-100 to-emerald-50", "from-teal-100 to-green-50",
  "from-green-100 to-lime-50", "from-emerald-100 to-teal-50", "from-lime-100 to-green-50",
];

type Tab = "posts" | "comments" | "bookmarks";

export function ProfileContent({ paramsPromise }: { paramsPromise: Promise<{ username: string }> }) {
  const { username } = use(paramsPromise);
  const router = useRouter();
  const { token, isLoggedIn, openAuth, user: authUser, isReady } = useAuth();

  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("posts");
  const [following, setFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Posts state
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState<UserCommentDto[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Bookmarks state (own profile only)
  const [bookmarks, setBookmarks] = useState<PostDto[]>([]);
  const [bookmarksPage, setBookmarksPage] = useState(1);
  const [bookmarksHasMore, setBookmarksHasMore] = useState(false);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  // Fetch profile
  useEffect(() => {
    if (!isReady) return;
    (async () => {
      const p = await getUserProfileByUsername(username, token);
      if (p) {
        setProfile(p);
        setFollowing(p.isFollowing);
      }
      setLoading(false);
    })();
  }, [username, token, isReady]);

  // Fetch posts when profile loads or tab switches
  useEffect(() => {
    if (!profile || tab !== "posts") return;
    if (posts.length > 0) return; // already loaded
    setPostsLoading(true);
    getUserPosts(profile.id, 1, 20, token).then(r => {
      setPosts(r.items);
      setPostsHasMore(r.hasMore);
      setPostsPage(1);
      setPostsLoading(false);
    });
  }, [profile, tab, token, posts.length]);

  // Fetch comments when tab switches
  useEffect(() => {
    if (!profile || tab !== "comments") return;
    if (comments.length > 0) return;
    setCommentsLoading(true);
    getUserComments(profile.id, 1, 20).then(r => {
      setComments(r.items);
      setCommentsHasMore(r.hasMore);
      setCommentsPage(1);
      setCommentsLoading(false);
    });
  }, [profile, tab, comments.length]);

  // Fetch bookmarks when tab switches (own profile only)
  useEffect(() => {
    if (!profile || tab !== "bookmarks" || !token) return;
    if (bookmarks.length > 0) return;
    setBookmarksLoading(true);
    getUserBookmarks(1, 20, token).then(r => {
      setBookmarks(r.items);
      setBookmarksHasMore(r.hasMore);
      setBookmarksPage(1);
      setBookmarksLoading(false);
    });
  }, [profile, tab, token, bookmarks.length]);

  const loadMorePosts = async () => {
    if (!profile || postsLoading) return;
    setPostsLoading(true);
    const r = await getUserPosts(profile.id, postsPage + 1, 20, token);
    setPosts(prev => [...prev, ...r.items]);
    setPostsHasMore(r.hasMore);
    setPostsPage(p => p + 1);
    setPostsLoading(false);
  };

  const loadMoreBookmarks = async () => {
    if (!token || bookmarksLoading) return;
    setBookmarksLoading(true);
    const r = await getUserBookmarks(bookmarksPage + 1, 20, token);
    setBookmarks(prev => [...prev, ...r.items]);
    setBookmarksHasMore(r.hasMore);
    setBookmarksPage(p => p + 1);
    setBookmarksLoading(false);
  };

  const loadMoreComments = async () => {
    if (!profile || commentsLoading) return;
    setCommentsLoading(true);
    const r = await getUserComments(profile.id, commentsPage + 1, 20);
    setComments(prev => [...prev, ...r.items]);
    setCommentsHasMore(r.hasMore);
    setCommentsPage(p => p + 1);
    setCommentsLoading(false);
  };

  const handleFollow = async () => {
    if (!isLoggedIn) { openAuth(); return; }
    if (!profile) return;
    setFollowing(!following);
    setProfile(p => p ? { ...p, followersCount: p.followersCount + (following ? -1 : 1) } : p);
    try { await toggleFollow(profile.id, token!); }
    catch {
      setFollowing(following);
      setProfile(p => p ? { ...p, followersCount: p.followersCount + (following ? 1 : -1) } : p);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#69824f]/30" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-[16px] text-[#141414]/40">Foydalanuvchi topilmadi</p>
        <button onClick={() => router.back()} className="text-[14px] text-[#141414]/60 hover:text-[#141414] transition-colors">
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const initials = profile?.fullName.split(" ").map(w => w[0]).join("").slice(0, 2) || "";
  const isOwnProfile = authUser?.id === profile?.id;


  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <button onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-black/[0.03] text-[#141414]/50 hover:text-[#141414] transition-colors">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <span className="text-[15px] font-semibold text-[#141414]">{profile.fullName}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Profile header */}
        <div className="pt-8 pb-6 flex gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full overflow-hidden relative shrink-0 bg-[#141414]/[0.04]">
            {profile.profilePictureUrl ? (
              <Image src={profile.profilePictureUrl} alt={profile.fullName} fill className="object-cover" sizes="80px" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[22px] font-semibold text-[#141414]/30">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-[20px] font-bold text-[#141414] leading-tight">{profile.fullName}</h1>
            <p className="text-[14px] text-[#141414]/35 mt-0.5">@{profile.username}</p>
            {profile.bio && (
              <p className="text-[14px] text-[#141414]/60 leading-relaxed mt-2">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[13px] text-[#141414]/50">
                <span className="font-semibold text-[#141414]">{profile.followingCount}</span> kuzatmoqda
              </span>
              <span className="text-[13px] text-[#141414]/50">
                <span className="font-semibold text-[#141414]">{profile.followersCount}</span> kuzatuvchi
              </span>
            </div>
            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="mt-3 px-5 py-1.5 rounded-full text-[13px] font-medium border border-black/[0.08] text-[#141414]/60 hover:text-[#141414] hover:border-black/[0.15] transition-colors"
              >
                Profilni tahrirlash
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={`mt-3 px-5 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  following
                    ? "border border-black/[0.08] text-[#141414]/60 hover:border-red-200 hover:text-red-400"
                    : "bg-[#69824f] text-white hover:bg-[#69824f]/90"
                }`}
              >
                {following ? "Kuzatilmoqda" : "Kuzatish"}
              </button>
            )}
          </div>
        </div>

      {/* Edit profile modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={(updated) => {
            setProfile(updated);
            setShowEditModal(false);
            // Update auth context user too
            if (authUser) {
              const savedUser = { ...authUser, fullName: updated.fullName, profilePictureUrl: updated.profilePictureUrl };
              localStorage.setItem("amally_user", JSON.stringify(savedUser));
            }
          }}
        />
      )}

        {/* Tabs */}
        <div className="border-b border-black/[0.04] flex">
          {(["posts", "comments", ...(isOwnProfile ? ["bookmarks"] : [])] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-[14px] font-medium text-center transition-colors relative ${
                tab === t ? "text-[#141414]" : "text-[#141414]/35 hover:text-[#141414]/60"
              }`}
            >
              {t === "posts" ? "Postlar" : t === "comments" ? "Izohlar" : "Saqlangan"}
              {tab === t && <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-[#69824f] rounded-full" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="py-4" style={{ minHeight: "50vh" }}>
          {tab === "posts" && (
            <PostsTab
              posts={posts}
              loading={postsLoading && posts.length === 0}
              hasMore={postsHasMore}
              loadingMore={postsLoading && posts.length > 0}
              onLoadMore={loadMorePosts}
            />
          )}
          {tab === "comments" && (
            <CommentsTab
              comments={comments}
              loading={commentsLoading && comments.length === 0}
              hasMore={commentsHasMore}
              loadingMore={commentsLoading && comments.length > 0}
              onLoadMore={loadMoreComments}
            />
          )}
          {tab === "bookmarks" && (
            <PostsTab
              posts={bookmarks}
              loading={bookmarksLoading && bookmarks.length === 0}
              hasMore={bookmarksHasMore}
              loadingMore={bookmarksLoading && bookmarks.length > 0}
              onLoadMore={loadMoreBookmarks}
              emptyText="Saqlangan postlar yo'q"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Posts Tab ─── */

function PostsTab({ posts, loading, hasMore, loadingMore, onLoadMore, emptyText }: {
  posts: PostDto[]; loading: boolean; hasMore: boolean; loadingMore: boolean; onLoadMore: () => void; emptyText?: string;
}) {
  if (loading) return <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-[#69824f]/30" /></div>;
  if (posts.length === 0) return <p className="text-center text-[14px] text-[#141414]/25 py-16">{emptyText || "Hali postlar yo'q"}</p>;

  return (
    <div className="space-y-4 pb-8">
      {posts.map((post, i) => <ProfilePostCard key={post.id} post={post} gradientIndex={i} />)}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button onClick={onLoadMore} disabled={loadingMore}
            className="text-[13px] text-[#141414]/40 hover:text-[#69824f] transition-colors disabled:opacity-50">
            {loadingMore ? <Loader2 size={16} className="animate-spin" /> : "Ko'proq ko'rish"}
          </button>
        </div>
      )}
    </div>
  );
}

function ProfilePostCard({ post, gradientIndex }: { post: PostDto; gradientIndex: number }) {
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
        <img src={post.coverImageUrl} alt={post.title} className="w-full h-48 object-cover" />
      ) : (
        <div className={`w-full h-36 bg-gradient-to-br ${gradient}`} />
      )}

      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-1.5 text-[12px] text-[#141414]/35">
          <span>{post.regionName}</span><span>·</span>
          <span>{timeAgo(post.createdAt)}</span><span>·</span>
          <span className="text-[#141414]/25">{post.categoryName}</span>
        </div>
        <h3 className="text-[14px] sm:text-[15px] font-semibold text-[#141414] leading-snug mt-1.5 line-clamp-1 sm:line-clamp-2 break-words">{post.title}</h3>
        <p className="mt-1.5 text-[14px] text-[#141414]/55 leading-relaxed line-clamp-3">{post.content}</p>
      </div>

      <div className="px-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button onClick={handleLike} className="flex items-center gap-1.5 group">
            <Heart size={17} strokeWidth={1.5} className={`transition-colors ${liked ? "fill-[#69824f] text-[#69824f]" : "text-[#141414]/30 group-hover:text-[#69824f]/60"}`} />
            <span className={`text-[13px] ${liked ? "text-[#69824f]" : "text-[#141414]/35"}`}>{likeCount}</span>
          </button>
          <button onClick={(e) => { e.stopPropagation(); router.push(`/post/${post.id}`); }} className="flex items-center gap-1.5 group">
            <MessageCircle size={17} strokeWidth={1.5} className="text-[#141414]/30 group-hover:text-[#69824f]/60 transition-colors" />
            <span className="text-[13px] text-[#141414]/35">{post.commentsCount}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <Eye size={16} strokeWidth={1.5} className="text-[#141414]/30" />
            <span className="text-[13px] text-[#141414]/35">{post.viewsCount}</span>
          </div>
          <button onClick={(e) => {
            e.stopPropagation();
            const url = `${window.location.origin}/post/${post.id}`;
            if (navigator.share) navigator.share({ title: post.title, url });
            else navigator.clipboard.writeText(url);
          }} className="group">
            <Share2 size={16} strokeWidth={1.5} className="text-[#141414]/30 group-hover:text-[#69824f]/60 transition-colors" />
          </button>
        </div>
        <button onClick={handleBookmark} className="group">
          <Bookmark size={17} strokeWidth={1.5} className={`transition-colors ${bookmarked ? "fill-[#69824f] text-[#69824f]" : "text-[#141414]/30 group-hover:text-[#69824f]/60"}`} />
        </button>
      </div>
    </article>
  );
}

/* ─── Comments Tab ─── */

function CommentsTab({ comments, loading, hasMore, loadingMore, onLoadMore }: {
  comments: UserCommentDto[]; loading: boolean; hasMore: boolean; loadingMore: boolean; onLoadMore: () => void;
}) {
  if (loading) return <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-[#69824f]/30" /></div>;
  if (comments.length === 0) return <p className="text-center text-[14px] text-[#141414]/25 py-16">Hali izohlar yo&apos;q</p>;

  return (
    <div className="space-y-1 pb-8">
      {comments.map(c => <ProfileCommentCard key={c.id} comment={c} />)}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button onClick={onLoadMore} disabled={loadingMore}
            className="text-[13px] text-[#141414]/40 hover:text-[#69824f] transition-colors disabled:opacity-50">
            {loadingMore ? <Loader2 size={16} className="animate-spin" /> : "Ko'proq ko'rish"}
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileCommentCard({ comment }: { comment: UserCommentDto }) {
  return (
    <Link href={`/post/${comment.postId}`}
      className="block px-4 py-3.5 rounded-xl hover:bg-black/[0.02] transition-colors">
      <div className="flex items-center gap-2 text-[12px] text-[#141414]/30">
        <MessageCircle size={13} strokeWidth={1.5} />
        <span className="truncate">{comment.postTitle}</span>
        <span>·</span>
        <span className="shrink-0">{timeAgo(comment.createdAt)}</span>
      </div>
      <p className="mt-1.5 text-[14px] text-[#141414]/65 leading-relaxed line-clamp-2">{comment.content}</p>
      {comment.likesCount > 0 && (
        <div className="mt-2 flex items-center gap-1 text-[#141414]/25">
          <Heart size={12} strokeWidth={1.5} />
          <span className="text-[11px]">{comment.likesCount}</span>
        </div>
      )}
    </Link>
  );
}

function EditProfileModal({ profile, onClose, onSave }: {
  profile: UserProfileDto;
  onClose: () => void;
  onSave: (updated: UserProfileDto) => void;
}) {
  const { token } = useAuth();
  const [fullName, setFullName] = useState(profile.fullName);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.profilePictureUrl || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Rasm 5MB dan oshmasligi kerak"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!fullName.trim()) { setError("Ism bo'sh bo'lishi mumkin emas"); return; }
    setSaving(true);
    setError("");
    try {
      let picUrl = avatarUrl;
      if (avatarFile && token) {
        picUrl = await uploadImage(avatarFile, token);
      }
      const updated = await updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim() || undefined,
        profilePictureUrl: picUrl || undefined,
      }, token!);
      onSave(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatarPreview || avatarUrl;
  const initials = fullName.split(" ").map(w => w[0]).join("").slice(0, 2);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[3px] z-[500]" onClick={onClose} />
      <div className="fixed inset-0 z-[501] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-[420px] overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 className="text-[18px] font-semibold text-[#141414]">Profilni tahrirlash</h2>
            <button onClick={onClose} className="p-2 rounded-full text-[#141414]/25 hover:text-[#141414]/50 hover:bg-black/[0.03] transition-colors">
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[#141414]/[0.04]">
                  {displayAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[24px] font-semibold text-[#141414]/30">
                      {initials}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#69824f] text-white flex items-center justify-center hover:bg-[#576d42] transition-colors shadow-sm"
                >
                  <Camera size={14} strokeWidth={2} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-[12px] text-[#141414]/40 mb-1 block">To&apos;liq ism</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] text-[14px] text-[#141414] outline-none focus:border-black/[0.16] transition-colors"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-[12px] text-[#141414]/40 mb-1 block">Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="O'zingiz haqingizda qisqacha..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] text-[14px] text-[#141414] placeholder:text-[#141414]/25 outline-none focus:border-black/[0.16] transition-colors resize-none"
              />
              <p className="text-[11px] text-[#141414]/20 text-right mt-1">{bio.length}/500</p>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-xl bg-red-50 text-[12px] text-red-500">{error}</div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !fullName.trim()}
              className="w-full py-3 rounded-full bg-[#69824f] text-white text-[14px] font-medium hover:bg-[#576d42] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
