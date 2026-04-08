"use client";

import { TrendingUp, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getTrendingCategories, TrendingCategoryDto } from "@/lib/api";

export function TrendingCategories() {
  const [items, setItems] = useState<TrendingCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingCategories(8).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const trending = items.filter(c => c.postCount > 0);

  if (loading) {
    return (
      <div className="border border-black/[0.06] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} strokeWidth={1.5} className="text-[#69824f]" />
          <h3 className="text-[14px] font-semibold text-[#141414]">Kategoriyalar</h3>
        </div>
        <div className="flex justify-center py-4">
          <Loader2 size={16} className="animate-spin text-[#69824f]/30" />
        </div>
      </div>
    );
  }

  if (trending.length === 0) return null;

  return (
    <div className="border border-black/[0.06] rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={15} strokeWidth={1.5} className="text-[#141414]/40" />
        <h3 className="text-[14px] font-semibold text-[#141414]">Kategoriyalar</h3>
      </div>
      <div className="space-y-2">
        {trending.map((cat) => (
          <div key={cat.slug} className="flex items-center justify-between py-1.5 cursor-pointer group">
            <span className="text-[13px] text-[#141414]/55 group-hover:text-[#69824f] transition-colors">
              {cat.name}
            </span>
            <span className="text-[11px] text-[#141414]/25">
              {cat.postCount} post
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
