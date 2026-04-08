"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, MessageCircle, Eye, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PostDto } from "@/lib/api";

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
  "from-emerald-100 to-green-50", "from-lime-100 to-emerald-50",
  "from-teal-100 to-green-50", "from-green-100 to-lime-50",
];

export function AboutContent({ posts }: { posts: PostDto[] }) {
  const router = useRouter();
  const { isLoggedIn, openAuth } = useAuth();

  const handleCta = () => {
    if (isLoggedIn) {
      router.push("/experiences");
    } else {
      openAuth("login");
    }
  };

  return (
    <div className="pt-[88px] sm:pt-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <section className="pt-12 pb-16 sm:pt-20 sm:pb-20">
          <h1 className="text-[28px] sm:text-[38px] font-bold text-[#141414] leading-tight tracking-tight">
            Nima bu ozi sizning Amally?
          </h1>
          <p className="mt-5 text-[15px] sm:text-[16px] text-[#141414]/55 leading-relaxed max-w-xl">
            Amally — tajribali o&apos;qituvchilar o&apos;zlarining isbotlangan o&apos;qitish usullari,
            darslik rejalari va sinf boshqaruvi bo&apos;yicha tajribalarini
            ulashadigan platforma. Bu yerda siz boshqa o&apos;qituvchilarning
            amaliy tajribalaridan o&apos;rganishingiz va o&apos;z tajribangizni
            ulashishingiz mumkin.
          </p>
          <p className="mt-4 text-[15px] sm:text-[16px] text-[#141414]/55 leading-relaxed max-w-xl">
            Maqsadimiz — O&apos;zbekistondagi har bir o&apos;qituvchiga
            eng yaxshi amaliyotlarni osongina topish va qo&apos;llash
            imkoniyatini berish.
          </p>
        </section>

        {/* Popular posts */}
        {posts.length > 0 && (
          <section className="pb-16">
            <h2 className="text-[18px] sm:text-[20px] font-semibold text-[#141414] mb-6">
              Eng mashhur tajribalar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="pb-20">
          <div className="border border-black/[0.06] rounded-2xl p-8 sm:p-10 text-center">
            <p className="text-[16px] sm:text-[18px] text-[#141414]/50 leading-relaxed">
              Hali sinab ko&apos;rmadingizmi?
            </p>
            <h3 className="mt-2 text-[22px] sm:text-[26px] font-bold text-[#141414] tracking-tight">
              Tajribalarni kashf eting
            </h3>
            <button
              onClick={handleCta}
              className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#69824f] text-white text-[14px] sm:text-[15px] font-medium hover:bg-[#576d42] transition-colors"
            >
              Tajribalarni ko&apos;rish
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function PostCard({ post, index }: { post: PostDto; index: number }) {
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Link
      href={`/post/${post.id}`}
      className="border border-black/[0.06] rounded-2xl overflow-hidden hover:border-black/[0.08] transition-colors block"
    >
      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageUrl} alt={post.title} className="w-full h-36 object-cover" />
      ) : (
        <div className={`w-full h-28 bg-gradient-to-br ${gradient}`} />
      )}

      <div className="px-4 pt-3 pb-2">
        <h3 className="text-[14px] font-semibold text-[#141414] leading-snug overflow-hidden text-ellipsis" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {post.title}
        </h3>
        <p className="mt-1 text-[12px] text-[#141414]/40 overflow-hidden text-ellipsis" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {post.content}
        </p>
      </div>

      <div className="px-4 pb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 text-[11px] text-[#141414]/30 min-w-0">
          <span className="font-medium text-[#141414]/50 truncate">{post.author.fullName}</span>
          <span className="shrink-0">·</span>
          <span className="shrink-0 whitespace-nowrap">{timeAgo(post.createdAt)}</span>
        </div>
        <div className="flex items-center gap-3 text-[#141414]/25 shrink-0">
          <div className="flex items-center gap-1">
            <Heart size={12} strokeWidth={1.5} />
            <span className="text-[10px]">{post.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={12} strokeWidth={1.5} />
            <span className="text-[10px]">{post.commentsCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={12} strokeWidth={1.5} />
            <span className="text-[10px]">{post.viewsCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
