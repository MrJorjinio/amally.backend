"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPosts } from "@/lib/api";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function PostsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("all");
  const pageSize = 20;

  useEffect(() => {
    setPage(1);
  }, [status]);

  useEffect(() => {
    getPosts(page, pageSize, status).then(r => { setPosts(r.items); setTotal(r.totalCount); });
  }, [page, status]);

  const totalPages = Math.ceil(total / pageSize);

  const statusColor = (s: string) => {
    if (s === "Approved") return "bg-emerald-50 text-emerald-600";
    if (s === "Rejected") return "bg-red-50 text-red-400";
    return "bg-amber-50 text-amber-600";
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold">Postlar</h1>
        <div className="flex gap-1">
          {(["all", "approved", "pending", "rejected"] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                status === s ? "bg-[#69824F] text-white" : "text-[#141414]/40 hover:bg-black/[0.03]"
              }`}
            >
              {s === "all" ? "Hammasi" : s === "approved" ? "Tasdiqlangan" : s === "pending" ? "Kutilayotgan" : "Rad etilgan"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.04]">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#141414]/40 uppercase tracking-wider">Sarlavha</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#141414]/40 uppercase tracking-wider">Muallif</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#141414]/40 uppercase tracking-wider">Kategoriya</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#141414]/40 uppercase tracking-wider">Holat</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#141414]/40 uppercase tracking-wider">Sana</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-b border-black/[0.03] last:border-0 hover:bg-black/[0.01] transition-colors">
                <td className="px-5 py-3.5 text-[13px] font-medium text-[#141414] max-w-[240px] truncate">{p.title}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#141414]/50">{p.author}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#141414]/40">{p.category}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#141414]/35">{new Date(p.createdAt).toLocaleDateString("uz")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <p className="text-[13px] text-[#141414]/25 py-12 text-center">Postlar topilmadi</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg hover:bg-black/[0.03] disabled:opacity-30 transition-colors">
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <span className="text-[13px] text-[#141414]/50 px-3">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg hover:bg-black/[0.03] disabled:opacity-30 transition-colors">
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
