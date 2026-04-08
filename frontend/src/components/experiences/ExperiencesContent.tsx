"use client";

import { useState, useCallback } from "react";
import { PostInput } from "./PostInput";
import { PostFeed } from "./PostFeed";
import { SearchBar } from "./SearchBar";
import { HottestWeek } from "./HottestWeek";
import { UserSuggestions } from "./UserSuggestions";
import { TrendingCategories } from "./TrendingCategories";
import { StickyScroll } from "./StickyScroll";
import { useFilters } from "@/context/FiltersContext";
import { CategoryDto, RegionDto, PostDto } from "@/lib/api";

export type { SearchFilters } from "@/context/FiltersContext";

interface ExperiencesContentProps {
  categories: CategoryDto[];
  regions: RegionDto[];
  hottestPosts: PostDto[];
}

export function ExperiencesContent({ categories, regions, hottestPosts }: ExperiencesContentProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { filters, setFilters } = useFilters();

  const handlePostCreated = () => setRefreshKey(k => k + 1);

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, [setFilters]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-8">
      <div className="flex-1 min-w-0 max-w-[640px]">
        <PostInput categories={categories} regions={regions} onPostCreated={handlePostCreated} />
        <PostFeed filters={filters} refreshKey={refreshKey} allCategories={categories} allRegions={regions} />
      </div>

      <aside className="hidden lg:block w-[340px] shrink-0">
        <StickyScroll>
          <SearchBar onFiltersChange={handleFiltersChange} />
          <HottestWeek posts={hottestPosts} />
          <UserSuggestions />
          <TrendingCategories />
        </StickyScroll>
      </aside>
    </div>
  );
}
