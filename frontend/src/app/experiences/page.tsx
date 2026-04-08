import { ExperiencesNavbar } from "@/components/ExperiencesNavbar";
import { ExperiencesContent } from "@/components/experiences/ExperiencesContent";
import { FiltersProvider } from "@/context/FiltersContext";
import { getHottestPosts, getCategories, getRegions } from "@/lib/api";

export default async function ExperiencesPage() {
  const [hottestPosts, categories, regions] = await Promise.all([
    getHottestPosts(5),
    getCategories(),
    getRegions(),
  ]);

  return (
    <FiltersProvider>
      <div className="min-h-screen bg-white">
        <ExperiencesNavbar />
        <div className="pt-[88px] lg:pt-28">
          <ExperiencesContent
            categories={categories}
            regions={regions}
            hottestPosts={hottestPosts}
          />
        </div>
      </div>
    </FiltersProvider>
  );
}
