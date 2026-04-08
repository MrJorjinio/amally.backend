import { AboutContent } from "@/components/about/AboutContent";
import { Navbar } from "@/components/Navbar";
import { getHottestPosts } from "@/lib/api";

export default async function AboutPage() {
  const posts = await getHottestPosts(4);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <AboutContent posts={posts} />
    </div>
  );
}
