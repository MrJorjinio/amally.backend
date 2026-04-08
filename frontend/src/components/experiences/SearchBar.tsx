"use client";

import { Search, X, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { getCategories, getRegions } from "@/lib/api";

const FALLBACK_CATEGORIES = [
  "Student Engagement", "Classroom Management", "Teaching Methods",
  "Lesson Planning", "Assessment & Grading", "Technology in Education",
  "Special Education", "Parent Communication", "Professional Development",
  "Curriculum Design", "Motivation & Inspiration", "First Year Teaching",
  "Remote Teaching", "Inclusive Education", "STEM Education",
];

const FALLBACK_REGIONS = [
  "Toshkent shahri", "Toshkent viloyati", "Samarqand", "Buxoro",
  "Farg'ona", "Andijon", "Namangan", "Qashqadaryo", "Surxondaryo",
  "Sirdaryo", "Jizzax", "Navoiy", "Xorazm", "Qoraqalpog'iston",
];

const EDUCATION_LEVELS = [
  "Barchasi", "Maktabgacha", "Boshlang'ich", "O'rta", "Oliy maktab", "Universitet", "Kurslar",
];

type FilterTab = "category" | "region" | "level";

interface SearchFilters {
  query: string;
  categories: Set<string>;
  regions: Set<string>;
  levels: Set<string>;
}

export function SearchBar({ onFiltersChange }: { onFiltersChange?: (f: SearchFilters) => void; onSearch?: (q: string) => void }) {
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(FALLBACK_CATEGORIES);
  const [regionOptions, setRegionOptions] = useState<string[]>(FALLBACK_REGIONS);
  const [categories, setCategories] = useState<Set<string>>(new Set());

  // Fetch real options client-side
  useEffect(() => {
    getCategories().then(c => { if (c.length > 0) setCategoryOptions(c.map(x => x.name)); });
    getRegions().then(r => { if (r.length > 0) setRegionOptions(r.map(x => x.name)); });
  }, []);
  const [regions, setRegions] = useState<Set<string>>(new Set());
  const [levels, setLevels] = useState<Set<string>>(new Set());

  const hasFilters = categories.size > 0 || regions.size > 0 || levels.size > 0;

  const emitFilters = useCallback((q: string, cats: Set<string>, regs: Set<string>, lvls: Set<string>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFiltersChange?.({ query: q, categories: cats, regions: regs, levels: lvls });
    }, 300);
  }, [onFiltersChange]);

  const clearAll = () => {
    setCategories(new Set());
    setRegions(new Set());
    setLevels(new Set());
    setDirty(true);
  };

  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void, val: string) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    setFn(next);
  };

  const getActiveOptions = () => {
    if (activeTab === "category") return categoryOptions;
    if (activeTab === "region") return regionOptions;
    if (activeTab === "level") return EDUCATION_LEVELS;
    return [];
  };

  const getActiveSet = () => {
    if (activeTab === "category") return categories;
    if (activeTab === "region") return regions;
    if (activeTab === "level") return levels;
    return new Set<string>();
  };

  const [dirty, setDirty] = useState(false);

  const handleToggle = (val: string) => {
    if (activeTab === "category") { const n = new Set(categories); if (n.has(val)) n.delete(val); else n.add(val); setCategories(n); }
    else if (activeTab === "region") { const n = new Set(regions); if (n.has(val)) n.delete(val); else n.add(val); setRegions(n); }
    else if (activeTab === "level") { const n = new Set(levels); if (n.has(val)) n.delete(val); else n.add(val); setLevels(n); }
    setDirty(true);
  };

  const applyFilters = () => {
    emitFilters(query, categories, regions, levels);
    setDirty(false);
  };

  const countFor = (tab: FilterTab) => {
    if (tab === "category") return categories.size;
    if (tab === "region") return regions.size;
    return levels.size;
  };

  const allChips = [
    ...Array.from(categories).map((c) => ({ label: c, remove: () => { toggle(categories, setCategories, c); setDirty(true); } })),
    ...Array.from(regions).map((r) => ({ label: r, remove: () => { toggle(regions, setRegions, r); setDirty(true); } })),
    ...Array.from(levels).map((l) => ({ label: l, remove: () => { toggle(levels, setLevels, l); setDirty(true); } })),
  ];

  return (
    <div className="border border-black/[0.06] rounded-2xl p-4">
      {/* Search input */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#f8f8f7]">
        <Search size={16} strokeWidth={1.5} className="text-[#141414]/30 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            emitFilters(e.target.value, categories, regions, levels);
          }}
          placeholder="Tajribalarni qidirish..."
          className="flex-1 bg-transparent text-[13px] text-[#141414] placeholder:text-[#141414]/30 outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(""); emitFilters("", categories, regions, levels); }} className="text-[#141414]/25 hover:text-[#141414]/50">
            <X size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mt-3 flex items-center gap-1.5 h-8">
        {(["category", "region", "level"] as FilterTab[]).map((tab) => {
          const label = tab === "category" ? "Kategoriya" : tab === "region" ? "Hudud" : "Daraja";
          const count = countFor(tab);
          const isOpen = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(isOpen ? null : tab)}
              className={`h-8 px-3 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                isOpen
                  ? "bg-[#69824f] text-white"
                  : count > 0
                    ? "bg-[#141414]/[0.06] text-[#141414]/60"
                    : "text-[#141414]/35 hover:bg-black/[0.03] hover:text-[#141414]/50"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold ${
                  isOpen ? "bg-white/20 text-white" : "bg-[#141414]/10 text-[#141414]/50"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-full text-[#141414]/25 hover:bg-red-50 hover:text-red-400 transition-colors"
            title="Tozalash"
          >
            <RotateCcw size={13} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Filter hint — aligned with first tab's text */}
      {!hasFilters && !activeTab && (
        <p className="mt-1.5 pl-3 text-[11px] text-[#141414]/20">Filter tanlang...</p>
      )}

      {/* Selected chips */}
      {allChips.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {allChips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141414]/[0.04] text-[11px] font-medium text-[#141414]/55"
            >
              {chip.label}
              <button onClick={chip.remove} className="hover:text-[#141414] transition-colors">
                <X size={10} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Expanded filter options */}
      {activeTab && (
        <div className="mt-2 pt-2 border-t border-black/[0.04] flex flex-wrap gap-1.5">
          {getActiveOptions().map((opt) => {
            const selected = getActiveSet().has(opt);
            return (
              <button
                key={opt}
                onClick={() => handleToggle(opt)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  selected
                    ? "bg-[#69824f] text-white"
                    : "border border-black/[0.05] text-[#141414]/45 hover:border-black/[0.1] hover:text-[#141414]/65"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Apply button — only shows when filters changed */}
      {dirty && (
        <button
          onClick={applyFilters}
          className="mt-3 w-full py-2.5 rounded-xl bg-[#69824f] text-white text-[13px] font-medium hover:bg-[#576d42] transition-colors"
        >
          Qo&apos;llash{hasFilters ? ` (${categories.size + regions.size + levels.size})` : ""}
        </button>
      )}
    </div>
  );
}
