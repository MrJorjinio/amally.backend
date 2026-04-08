"use client";

import { useEffect, useState } from "react";
import { Check, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { getPosts, approvePost, rejectPost } from "@/lib/api";

export default function ApprovalsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const pageSize = 20;

  const fetchPending = () => {
    getPosts(page, pageSize, "pending").then(r => { setPosts(r.items); setTotal(r.totalCount); });
  };

  useEffect(fetchPending, [page]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleApprove = async (id: string) => {
    await approvePost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setTotal(t => t - 1);
  };

  const handleReject = async (id: string) => {
    await rejectPost(id);
    setPosts(prev => prev.filter(p => p.id !== id));
    setTotal(t => t - 1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold">Tasdiqlash</h1>
        <span className="text-[13px] text-[#141414]/40">{total} ta kutilayotgan</span>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-16 text-center">
          <p className="text-[14px] text-[#141414]/30">Kutilayotgan postlar yo&apos;q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(p => {
            const isOpen = expanded.has(p.id);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-black/[0.005] transition-colors"
                  onClick={() => toggleExpand(p.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-semibold text-[#141414]">{p.title}</h3>
                        {isOpen
                          ? <ChevronUp size={14} className="text-[#141414]/25 shrink-0" />
                          : <ChevronDown size={14} className="text-[#141414]/25 shrink-0" />
                        }
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[12px] text-[#141414]/35">
                        <span className="font-medium text-[#141414]/50">{p.author}</span>
                        <span>·</span>
                        <span>{p.category}</span>
                        <span>·</span>
                        <span>{p.region}</span>
                        <span>·</span>
                        <span>{new Date(p.createdAt).toLocaleDateString("uz")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[12px] font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <Check size={14} strokeWidth={2} />
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => handleReject(p.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-400 text-[12px] font-medium hover:bg-red-100 transition-colors"
                      >
                        <X size={14} strokeWidth={2} />
                        Rad etish
                      </button>
                    </div>
                  </div>
                </div>

                {isOpen && p.content && (
                  <div className="px-5 pb-5 pt-0 border-t border-black/[0.04]">
                    <p className="text-[14px] text-[#141414]/60 leading-relaxed whitespace-pre-wrap pt-4">{p.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
