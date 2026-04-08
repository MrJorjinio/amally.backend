"use client";

import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PostDto } from "@/lib/api";

const GRADIENTS = [
  "from-emerald-100 to-green-50",
  "from-lime-100 to-emerald-50",
  "from-teal-100 to-green-50",
  "from-green-100 to-lime-50",
  "from-emerald-100 to-teal-50",
  "from-lime-100 to-green-50",
];

const MOCK_POSTS: PostDto[] = [
  { id: "1", title: "5-sinf o'quvchilarini darsga qiziqtirishning 7 ta usuli", content: "", coverImageUrl: null, author: { id: "1", username: "aziza", fullName: "Aziza Sultonova", profilePictureUrl: null }, categoryName: "Student Engagement", categorySlug: "student-engagement", regionName: "Toshkent", educationLevel: 3, likesCount: 42, commentsCount: 8, viewsCount: 0, isLiked: false, isBookmarked: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), updatedAt: null },
  { id: "2", title: "Sinf boshqaruvi: tajribali o'qituvchining maslahatlari", content: "", coverImageUrl: null, author: { id: "2", username: "farxod", fullName: "Farxod Mirzayev", profilePictureUrl: null }, categoryName: "Classroom Management", categorySlug: "classroom-management", regionName: "Samarqand", educationLevel: 4, likesCount: 38, commentsCount: 12, viewsCount: 0, isLiked: false, isBookmarked: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), updatedAt: null },
  { id: "3", title: "Raqamli texnologiyalarni darsda qo'llash tajribasi", content: "", coverImageUrl: null, author: { id: "3", username: "nodira", fullName: "Nodira Rahimova", profilePictureUrl: null }, categoryName: "Technology in Education", categorySlug: "technology-in-education", regionName: "Buxoro", educationLevel: 3, likesCount: 56, commentsCount: 15, viewsCount: 0, isLiked: false, isBookmarked: false, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: null },
  { id: "4", title: "Matematika darslarida o'yin elementlarini kiritish", content: "", coverImageUrl: null, author: { id: "4", username: "dilshod", fullName: "Dilshod Karimov", profilePictureUrl: null }, categoryName: "Teaching Methods", categorySlug: "teaching-methods", regionName: "Farg'ona", educationLevel: 3, likesCount: 29, commentsCount: 6, viewsCount: 0, isLiked: false, isBookmarked: false, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: null },
  { id: "5", title: "Ingliz tili darslarida kommunikativ yondashuv", content: "", coverImageUrl: null, author: { id: "5", username: "zarina", fullName: "Zarina Abdullayeva", profilePictureUrl: null }, categoryName: "Teaching Methods", categorySlug: "teaching-methods", regionName: "Namangan", educationLevel: 4, likesCount: 47, commentsCount: 21, viewsCount: 0, isLiked: false, isBookmarked: false, createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: null },
  { id: "6", title: "Maxsus ehtiyojli bolalar bilan ishlash usullari", content: "", coverImageUrl: null, author: { id: "6", username: "laziz", fullName: "Laziz Tursunov", profilePictureUrl: null }, categoryName: "Special Education", categorySlug: "special-education", regionName: "Andijon", educationLevel: 0, likesCount: 61, commentsCount: 18, viewsCount: 0, isLiked: false, isBookmarked: false, createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: null },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "hozirgina";
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export function HottestPosts({ posts }: { posts: PostDto[] }) {
  const data = posts.length > 0 ? posts : MOCK_POSTS;

  return (
    <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-[#141414]">
            Hottest Posts
          </h2>
          <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-[15px] text-[#141414]/40">
            Today&apos;s most engaging experiences
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {data.map((post, i) => (
            <PostCard key={post.id} post={post} gradientIndex={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PostCard({ post, gradientIndex }: { post: PostDto; gradientIndex: number }) {
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length];
  const router = useRouter();
  const { isLoggedIn, openAuth } = useAuth();

  const handleClick = () => {
    if (isLoggedIn) {
      router.push(`/post/${post.id}`);
    } else {
      openAuth("login");
    }
  };

  return (
    <article
      onClick={handleClick}
      className="
        group rounded-2xl overflow-hidden
        border border-black/[0.04]
        bg-white
        transition-all duration-300 ease-out
        hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)]
        hover:border-black/[0.06]
        cursor-pointer
      "
    >
      {/* Cover image */}
      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageUrl} alt={post.title} className="w-full h-36 sm:h-44 object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]" />
      ) : (
        <div
          className={`h-36 sm:h-44 bg-gradient-to-br ${gradient} transition-transform duration-500 ease-out group-hover:scale-[1.02]`}
        />
      )}

      <div className="p-4 sm:p-5">
        <h3 className="text-[14px] sm:text-[15px] font-semibold leading-snug text-[#141414] line-clamp-2">
          {post.title}
        </h3>

        <p className="mt-2 sm:mt-2.5 text-[12px] sm:text-[13px] text-[#141414]/35">
          {post.regionName} · {timeAgo(post.createdAt)}
        </p>

        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-black/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-[#141414]/40">
              <Heart size={13} strokeWidth={1.5} />
              {post.likesCount}
            </span>
            <span className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-[#141414]/40">
              <MessageCircle size={13} strokeWidth={1.5} />
              {post.commentsCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {post.author.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.profilePictureUrl} alt={post.author.fullName} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium text-[#141414]/50 bg-[#e8e4df]">
                {getInitials(post.author.fullName)}
              </div>
            )}
            <span className="text-[11px] sm:text-[12px] text-[#141414]/45 font-medium truncate max-w-[100px]">
              {post.author.fullName}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
