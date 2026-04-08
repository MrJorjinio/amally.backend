import { Flame } from "lucide-react";
import Link from "next/link";
import { PostDto } from "@/lib/api";

const MOCK_HOT: { id: string; title: string; author: string; engagement: number }[] = [
  { id: "1", title: "5-sinf o'quvchilarini darsga qiziqtirishning 7 ta usuli", author: "Aziza Sultonova", engagement: 50 },
  { id: "2", title: "Sinf boshqaruvi: tajribali o'qituvchining maslahatlari", author: "Farxod Mirzayev", engagement: 50 },
  { id: "3", title: "Raqamli texnologiyalarni darsda qo'llash", author: "Nodira Rahimova", engagement: 71 },
  { id: "4", title: "Ingliz tili darslarida kommunikativ yondashuv", author: "Zarina Abdullayeva", engagement: 68 },
  { id: "5", title: "Maxsus ehtiyojli bolalar bilan ishlash", author: "Laziz Tursunov", engagement: 79 },
];

export function HottestWeek({ posts }: { posts: PostDto[] }) {
  const items = posts.length > 0
    ? posts.map((p) => ({
        id: p.id,
        title: p.title,
        author: p.author.fullName,
        engagement: p.likesCount + p.commentsCount,
      }))
    : MOCK_HOT;

  return (
    <div className="border border-black/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={15} strokeWidth={1.5} className="text-[#69824f]" />
        <h3 className="text-[14px] font-semibold text-[#141414]">Hafta eng yaxshilari</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <Link key={item.id} href={`/post/${item.id}`} className="flex gap-3 cursor-pointer group no-underline">
            <span className="text-[13px] font-semibold text-[#141414]/20 w-5 shrink-0 pt-0.5">{i + 1}</span>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#141414]/70 leading-snug line-clamp-2 group-hover:text-[#69824f] transition-colors">
                {item.title}
              </p>
              <p className="mt-0.5 text-[11px] text-[#141414]/30">{item.author} · {item.engagement} ta javob</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
