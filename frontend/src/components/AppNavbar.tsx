"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, LogOut, X, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useFilters } from "@/context/FiltersContext";
import { getCategories, getRegions } from "@/lib/api";

const FALLBACK_CATEGORIES = [
  "Student Engagement", "Classroom Management", "Teaching Methods",
  "Lesson Planning", "Assessment & Grading", "Technology in Education",
];

const FALLBACK_REGIONS = [
  "Toshkent shahri", "Toshkent viloyati", "Samarqand", "Buxoro",
  "Farg'ona", "Andijon", "Namangan",
];

const EDUCATION_LEVELS = [
  "Barchasi", "Maktabgacha", "Boshlang'ich", "O'rta", "Oliy maktab", "Universitet", "Kurslar",
];

type FilterTab = "category" | "region" | "level";

export function AppNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("category");
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [regions, setRegions] = useState<Set<string>>(new Set());
  const [levels, setLevels] = useState<Set<string>>(new Set());
  const [categoryOptions, setCategoryOptions] = useState<string[]>(FALLBACK_CATEGORIES);
  const [regionOptions, setRegionOptions] = useState<string[]>(FALLBACK_REGIONS);
  const { user, logout } = useAuth();
  const { setFilters, updateQuery } = useFilters();
  const router = useRouter();

  useEffect(() => {
    getCategories().then(c => { if (c.length > 0) setCategoryOptions(c.map(x => x.name)); });
    getRegions().then(r => { if (r.length > 0) setRegionOptions(r.map(x => x.name)); });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showFilters) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showFilters]);

  const initials = user?.fullName
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const toggle = (set: Set<string>, setFn: (s: Set<string>) => void, val: string) => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val); else next.add(val);
    setFn(next);
  };

  const filterCount = categories.size + regions.size + levels.size;

  const clearAll = () => {
    setCategories(new Set()); setRegions(new Set()); setLevels(new Set());
    setFilters({ query, categories: new Set(), regions: new Set(), levels: new Set() });
  };

  const getOptions = () => {
    if (activeTab === "category") return categoryOptions;
    if (activeTab === "region") return regionOptions;
    return EDUCATION_LEVELS;
  };

  const getSet = () => {
    if (activeTab === "category") return categories;
    if (activeTab === "region") return regions;
    return levels;
  };

  const handleToggle = (val: string) => {
    if (activeTab === "category") toggle(categories, setCategories, val);
    else if (activeTab === "region") toggle(regions, setRegions, val);
    else toggle(levels, setLevels, val);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-3 px-3">
        <nav
          className={`
            flex items-center gap-2.5 w-full max-w-3xl px-3 py-2.5 rounded-full
            border transition-all duration-300 ease-out border-black/[0.06]
            ${scrolled
              ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              : "bg-white/50 backdrop-blur-md"
            }
          `}
        >
          {/* Left — profile pic */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-transparent hover:ring-black/[0.06] transition-all"
            >
              {user?.profilePictureUrl ? (
                <Image src={user.profilePictureUrl} alt={user.fullName} fill className="object-cover" sizes="36px" unoptimized />
              ) : (
                <div className="w-full h-full bg-[#141414]/[0.06] flex items-center justify-center text-[12px] font-semibold text-[#141414]/50">
                  {initials}
                </div>
              )}
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden z-20">
                  <div className="px-4 py-3 border-b border-black/[0.04]">
                    <p className="text-[14px] font-semibold text-[#141414] truncate">{user?.fullName}</p>
                    <p className="text-[12px] text-[#141414]/35 truncate">@{user?.username}</p>
                  </div>
                  <div className="py-1">
                    <Link href={`/profile/${user?.username}`} onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#141414]/60 hover:bg-[#69824f]/[0.04] hover:text-[#69824f] transition-colors">
                      Profilim
                    </Link>
                    <Link href="/" onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#141414]/60 hover:bg-[#69824f]/[0.04] hover:text-[#69824f] transition-colors">
                      Bosh sahifa
                    </Link>
                    <Link href="/about" onClick={() => setShowMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#141414]/60 hover:bg-[#69824f]/[0.04] hover:text-[#69824f] transition-colors">
                      About
                    </Link>
                    <button onClick={() => { logout(); setShowMenu(false); router.push("/"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-400/70 hover:bg-red-50/50 hover:text-red-500 transition-colors">
                      <LogOut size={14} strokeWidth={1.5} />
                      Chiqish
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Center — search bar */}
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-black/[0.03]">
            <Search size={15} strokeWidth={1.5} className="text-[#141414]/25 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); updateQuery(e.target.value); }}
              placeholder="Qidirish..."
              className="flex-1 bg-transparent text-[13px] text-[#141414] placeholder:text-[#141414]/25 outline-none"
            />
          </div>

          {/* Right — filters */}
          <button
            onClick={() => setShowFilters(true)}
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#141414]/30 hover:text-[#141414]/60 hover:bg-black/[0.03] transition-colors shrink-0"
          >
            <SlidersHorizontal size={18} strokeWidth={1.5} />
            {filterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#69824f] text-white text-[9px] font-bold flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </button>
        </nav>
      </header>

      {/* Filter bottom sheet */}
      <div
        className={`fixed inset-0 z-[200] transition-opacity duration-300 ${
          showFilters ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/25" onClick={() => setShowFilters(false)} />
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ease-out ${
            showFilters ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "85vh" }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-black/[0.08]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3">
            <h3 className="text-[17px] font-semibold text-[#141414]">Filterlar</h3>
            <div className="flex items-center gap-2">
              {filterCount > 0 && (
                <button onClick={clearAll} className="p-2 rounded-full text-[#141414]/25 hover:text-red-400 hover:bg-red-50 transition-colors">
                  <RotateCcw size={16} strokeWidth={1.5} />
                </button>
              )}
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-full text-[#141414]/25 hover:text-[#141414]/50 hover:bg-black/[0.03] transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-5 pb-3">
            {(["category", "region", "level"] as FilterTab[]).map((tab) => {
              const label = tab === "category" ? "Kategoriya" : tab === "region" ? "Hudud" : "Daraja";
              const count = tab === "category" ? categories.size : tab === "region" ? regions.size : levels.size;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium text-center transition-all ${
                    activeTab === tab
                      ? "bg-[#69824f] text-white"
                      : "bg-black/[0.03] text-[#141414]/50"
                  }`}
                >
                  {label}{count > 0 ? ` (${count})` : ""}
                </button>
              );
            })}
          </div>

          {/* Options */}
          <div className="px-5 pb-8 overflow-y-auto" style={{ maxHeight: "calc(85vh - 160px)" }}>
            <div className="flex flex-wrap gap-2">
              {getOptions().map((opt) => {
                const selected = getSet().has(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => handleToggle(opt)}
                    className={`px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all ${
                      selected
                        ? "bg-[#69824f] text-white"
                        : "bg-black/[0.03] text-[#141414]/50 hover:text-[#141414]/70"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apply button */}
          <div className="px-5 pb-6 pt-2">
            <button
              onClick={() => {
                setFilters({ query, categories, regions, levels });
                setShowFilters(false);
              }}
              className="w-full py-3 rounded-full bg-[#69824f] text-white text-[14px] font-medium hover:bg-[#576d42] transition-colors"
            >
              Qo&apos;llash{filterCount > 0 ? ` (${filterCount})` : ""}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
