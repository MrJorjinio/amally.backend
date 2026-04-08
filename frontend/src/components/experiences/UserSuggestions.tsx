"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserSuggestions, toggleFollow, UserSummaryDto } from "@/lib/api";

export function UserSuggestions() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserSuggestions(5, token).then(u => { setUsers(u); setLoading(false); });
  }, [token]);

  if (loading) {
    return (
      <div className="border border-black/[0.06] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={15} strokeWidth={1.5} className="text-[#69824f]" />
          <h3 className="text-[14px] font-semibold text-[#141414]">Obuna bo&apos;ling</h3>
        </div>
        <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-[#69824f]/30" /></div>
      </div>
    );
  }

  const handleFollowed = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  if (users.length === 0) return null;

  return (
    <div className="border border-black/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus size={15} strokeWidth={1.5} className="text-[#141414]/40" />
        <h3 className="text-[14px] font-semibold text-[#141414]">Obuna bo&apos;ling</h3>
      </div>
      <div className="space-y-3">
        {users.map((user) => (
          <UserRow key={user.id} user={user} onFollowed={handleFollowed} />
        ))}
      </div>
    </div>
  );
}

function UserRow({ user, onFollowed }: { user: UserSummaryDto; onFollowed: (id: string) => void }) {
  const { token, isLoggedIn, openAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!isLoggedIn) { openAuth(); return; }
    setLoading(true);
    try {
      await toggleFollow(user.id, token!);
      onFollowed(user.id);
    } catch { setLoading(false); }
  };

  return (
    <div className="flex items-center gap-3">
      <Link href={`/profile/${user.username}`} className="w-9 h-9 rounded-full bg-[#141414]/[0.04] flex items-center justify-center text-[12px] font-semibold text-[#141414]/40 shrink-0">
        {user.fullName.split(" ").map(w => w[0]).join("").slice(0, 2)}
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${user.username}`} className="text-[13px] font-medium text-[#141414] truncate block hover:text-[#69824f] hover:underline">{user.fullName}</Link>
        <p className="text-[11px] text-[#141414]/30">@{user.username}</p>
      </div>
      <button
        onClick={handleFollow}
        disabled={loading}
        className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#69824f] text-white hover:bg-[#576d42] transition-all disabled:opacity-50"
      >
        Obuna bo&apos;lish
      </button>
    </div>
  );
}
