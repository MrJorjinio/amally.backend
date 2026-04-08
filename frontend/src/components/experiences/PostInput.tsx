"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ImagePlus, Send, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { createPost, uploadImage, getCategories, getRegions, CategoryDto, RegionDto } from "@/lib/api";

const EDUCATION_LEVELS = [
  { value: 0, label: "Barchasi" },
  { value: 1, label: "Maktabgacha" },
  { value: 2, label: "Boshlang'ich" },
  { value: 3, label: "O'rta" },
  { value: 4, label: "Oliy maktab" },
  { value: 5, label: "Universitet" },
  { value: 6, label: "Kurslar" },
];

interface PostInputProps {
  categories: CategoryDto[];
  regions: RegionDto[];
  onPostCreated?: () => void;
}

export function PostInput({ categories: initialCategories, regions: initialRegions, onPostCreated }: PostInputProps) {
  const { token, isLoggedIn, openAuth } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [educationLevel, setEducationLevel] = useState<number>(0);
  const [openPicker, setOpenPicker] = useState<"category" | "region" | "level" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryDto[]>(initialCategories);
  const [regions, setRegions] = useState<RegionDto[]>(initialRegions);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch client-side if server-side data was empty
  useEffect(() => {
    if (categories.length === 0) getCategories().then(c => { if (c.length > 0) setCategories(c); });
    if (regions.length === 0) getRegions().then(r => { if (r.length > 0) setRegions(r); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
  }, []);

  useEffect(() => { autoResize(); }, [content, autoResize]);

  const selectedCategory = categories.find(c => c.id === categoryId);
  const selectedRegion = regions.find(r => r.id === regionId);
  const selectedLevel = EDUCATION_LEVELS.find(l => l.value === educationLevel && l.value !== 0);
  const hasFilters = categoryId || regionId || educationLevel > 0;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Rasm hajmi 5MB dan oshmasligi kerak"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) { openAuth("login"); return; }
    if (!title.trim() || !content.trim() || !categoryId || !regionId) {
      setError("Sarlavha, matn, kategoriya va hududni tanlang");
      return;
    }
    if (title.trim().length < 5) { setError("Sarlavha kamida 5 ta belgidan iborat bo'lishi kerak"); return; }
    if (content.trim().length < 20) { setError("Matn kamida 20 ta belgidan iborat bo'lishi kerak"); return; }
    setError("");
    setLoading(true);
    try {
      let coverImageUrl: string | undefined;
      if (imageFile) coverImageUrl = await uploadImage(imageFile, token!);
      await createPost({ title, content, categoryId, regionId, educationLevel, coverImageUrl }, token!);
      setTitle(""); setContent(""); setCategoryId(null); setRegionId(null); setEducationLevel(0); setOpenPicker(null);
      removeImage();
      onPostCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally { setLoading(false); }
  };

  return (
    <div className="border border-black/[0.06] rounded-2xl overflow-hidden mb-4 sm:mb-5">
      {/* Image preview — above everything */}
      {imagePreview && (
        <div className="relative w-full h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          <button onClick={removeImage}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
            <X size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

      <div className="p-4 sm:p-5">
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sarlavha..."
        className="w-full text-[15px] sm:text-[16px] font-semibold text-[#141414] placeholder:text-[#141414]/25 outline-none mb-2" />
      <textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tajribangizni ulashing..." rows={2}
        className="w-full resize-none text-[14px] sm:text-[15px] text-[#141414] placeholder:text-[#141414]/30 outline-none leading-relaxed overflow-hidden" />

      {error && <div className="mt-2 px-3 py-2 rounded-xl bg-red-50 text-[12px] text-red-500">{error}</div>}

      {hasFilters && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedCategory && <Pill label={selectedCategory.name} onRemove={() => setCategoryId(null)} />}
          {selectedRegion && <Pill label={selectedRegion.name} onRemove={() => setRegionId(null)} />}
          {selectedLevel && <Pill label={selectedLevel.label} onRemove={() => setEducationLevel(0)} />}
        </div>
      )}

      {openPicker && (
        <div className="mt-3 pt-3 border-t border-black/[0.04] flex flex-wrap gap-1.5">
          {openPicker === "category" && categories.map(c => (
            <Opt key={c.id} label={c.name} selected={categoryId === c.id} onClick={() => { setCategoryId(c.id); setOpenPicker(null); }} />
          ))}
          {openPicker === "region" && regions.map(r => (
            <Opt key={r.id} label={r.name} selected={regionId === r.id} onClick={() => { setRegionId(r.id); setOpenPicker(null); }} />
          ))}
          {openPicker === "level" && EDUCATION_LEVELS.map(l => (
            <Opt key={l.value} label={l.label} selected={educationLevel === l.value} onClick={() => { setEducationLevel(l.value); setOpenPicker(null); }} />
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-black/[0.04]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide min-w-0">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg hover:bg-black/[0.03] transition-colors text-[#141414]/35 hover:text-[#141414]/55 shrink-0">
              <ImagePlus size={17} strokeWidth={1.5} />
            </button>
            <Toggle label="Kategoriya" active={openPicker === "category"} has={!!categoryId} onClick={() => setOpenPicker(openPicker === "category" ? null : "category")} />
            <Toggle label="Hudud" active={openPicker === "region"} has={!!regionId} onClick={() => setOpenPicker(openPicker === "region" ? null : "region")} />
            <Toggle label="Daraja" active={openPicker === "level"} has={educationLevel > 0} onClick={() => setOpenPicker(openPicker === "level" ? null : "level")} />
          </div>
          <button onClick={handleSubmit} disabled={loading || !title.trim() || !content.trim()}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-[#69824f] text-white text-[12px] sm:text-[13px] font-medium hover:bg-[#576d42] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><span className="hidden sm:inline">Joylash</span><Send size={13} strokeWidth={2} /></>}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

function Toggle({ label, active, has, onClick }: { label: string; active: boolean; has: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${active ? "bg-[#69824f] text-white" : has ? "bg-[#141414]/[0.06] text-[#141414]/60" : "text-[#141414]/35 hover:bg-black/[0.03] hover:text-[#141414]/50"}`}>{label}</button>;
}

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#141414]/[0.04] text-[11px] font-medium text-[#141414]/60">{label}<button onClick={onRemove} className="hover:text-[#141414] transition-colors"><X size={11} strokeWidth={2} /></button></span>;
}

function Opt({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${selected ? "bg-[#69824f] text-white" : "border border-black/[0.06] text-[#141414]/50 hover:border-black/[0.12] hover:text-[#141414]/70"}`}>{label}</button>;
}
