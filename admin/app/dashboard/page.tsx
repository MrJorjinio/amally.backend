"use client";

import { useEffect, useState, useRef } from "react";
import { Users, FileText, Clock, Eye, Heart, MessageCircle } from "lucide-react";
import { getStats, getUserGrowth, getTopPosts } from "@/lib/api";
import * as echarts from "echarts";

type Period = "daily" | "monthly" | "yearly";
type TopPeriod = "all" | "week" | "today";

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [growthPeriod, setGrowthPeriod] = useState<Period>("daily");
  const [growthData, setGrowthData] = useState<{ label: string; count: number }[]>([]);
  const [topPeriod, setTopPeriod] = useState<TopPeriod>("all");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => { getStats().then(setStats).catch(() => {}); }, []);
  useEffect(() => { getUserGrowth(growthPeriod).then(setGrowthData).catch(() => {}); }, [growthPeriod]);
  useEffect(() => { getTopPosts(topPeriod).then(setTopPosts).catch(() => {}); }, [topPeriod]);

  // Render chart
  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    if (growthData.length === 0) {
      chartInstance.current.clear();
      return;
    }
    chartInstance.current.setOption({
      grid: { left: 40, right: 16, top: 16, bottom: 28 },
      xAxis: {
        type: "category",
        data: growthData.map(d => d.label),
        axisLabel: { fontSize: 10, color: "#14141460" },
        axisLine: { lineStyle: { color: "#14141410" } },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLabel: { fontSize: 10, color: "#14141440" },
        splitLine: { lineStyle: { color: "#14141408" } },
      },
      series: [{
        data: growthData.map(d => d.count),
        type: "bar",
        barWidth: growthPeriod === "yearly" ? 40 : growthPeriod === "monthly" ? 24 : 10,
        itemStyle: { color: "#69824F", borderRadius: [4, 4, 0, 0] },
      }],
      tooltip: { trigger: "axis", textStyle: { fontSize: 12 } },
    });
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [growthData, growthPeriod]);

  if (!stats) return <div className="flex items-center justify-center h-64 text-[14px] text-[#141414]/30">Yuklanmoqda...</div>;

  const cards = [
    { label: "Jami foydalanuvchilar", value: stats.totalUsers, icon: Users },
    { label: "Jami postlar", value: stats.totalPosts, icon: FileText },
    { label: "Kutilayotgan", value: stats.pendingPosts, icon: Clock },
    { label: "Bugun postlar", value: stats.postsToday, icon: Eye },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-[22px] font-bold mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-black/[0.06] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-[#141414]/40 font-medium">{c.label}</span>
              <c.icon size={16} strokeWidth={1.5} className="text-[#69824F]/50" />
            </div>
            <p className="text-[32px] font-bold text-[#141414]/90">{c.value}</p>
          </div>
        ))}
      </div>

      {/* User growth chart */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold">Foydalanuvchilar o&apos;sishi</h2>
          <div className="flex gap-1">
            {(["daily", "monthly", "yearly"] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setGrowthPeriod(p)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  growthPeriod === p ? "bg-[#69824F] text-white" : "text-[#141414]/40 hover:bg-black/[0.03]"
                }`}
              >
                {p === "daily" ? "Kunlik" : p === "monthly" ? "Oylik" : "Yillik"}
              </button>
            ))}
          </div>
        </div>
        <div ref={chartRef} style={{ height: 260, width: "100%" }} />
      </div>

      {/* Top posts */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold">Top postlar</h2>
          <div className="flex gap-1">
            {(["all", "week", "today"] as TopPeriod[]).map(p => (
              <button
                key={p}
                onClick={() => setTopPeriod(p)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  topPeriod === p ? "bg-[#69824F] text-white" : "text-[#141414]/40 hover:bg-black/[0.03]"
                }`}
              >
                {p === "all" ? "Hammasi" : p === "week" ? "Hafta" : "Bugun"}
              </button>
            ))}
          </div>
        </div>
        {topPosts.length === 0 ? (
          <p className="text-[13px] text-[#141414]/25 py-8 text-center">Postlar topilmadi</p>
        ) : (
          <div className="space-y-1">
            {topPosts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/[0.01] transition-colors">
                <span className="text-[12px] font-semibold text-[#141414]/20 w-5 text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#141414] truncate">{p.title}</p>
                  <p className="text-[11px] text-[#141414]/30">{p.author} · {p.category}</p>
                </div>
                <div className="flex items-center gap-4 text-[#141414]/30 shrink-0">
                  <div className="flex items-center gap-1">
                    <Heart size={12} strokeWidth={1.5} />
                    <span className="text-[11px]">{p.likesCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle size={12} strokeWidth={1.5} />
                    <span className="text-[11px]">{p.commentsCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={12} strokeWidth={1.5} />
                    <span className="text-[11px]">{p.viewsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
