"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getUsers } from "@/lib/api";

export default function UsersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    getUsers(page, pageSize).then(r => { setUsers(r.items); setTotal(r.totalCount); });
  }, [page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold">Foydalanuvchilar</h1>
        <span className="text-[13px] text-[#141414]/40">{total} ta</span>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.04]">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#141414]/40 uppercase tracking-wider">Foydalanuvchi</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#141414]/40 uppercase tracking-wider">Username</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#141414]/40 uppercase tracking-wider">Postlar</th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#141414]/40 uppercase tracking-wider">Qo&apos;shilgan</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-black/[0.03] last:border-0 hover:bg-black/[0.01] transition-colors">
                <td className="px-5 py-3.5">
                  <a href={`http://localhost:3000/profile/${u.username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    {u.profilePictureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.profilePictureUrl} alt={u.fullName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#141414]/[0.04] flex items-center justify-center text-[10px] font-semibold text-[#141414]/40 shrink-0">
                        {u.fullName.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="text-[13px] font-medium text-[#141414]">{u.fullName}</p>
                      <p className="text-[11px] text-[#141414]/30">{u.email}</p>
                    </div>
                  </a>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#141414]/50">
                  <a href={`http://localhost:3000/profile/${u.username}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#69824F] transition-colors">@{u.username}</a>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#141414]/50">{u.postsCount}</td>
                <td className="px-5 py-3.5 text-[13px] text-[#141414]/35">{new Date(u.createdAt).toLocaleDateString("uz")}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
