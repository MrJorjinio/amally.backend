import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HottestPosts } from "@/components/HottestPosts";
import { Footer } from "@/components/Footer";
import { getHottestPosts, getTopAuthors } from "@/lib/api";

export default async function Home() {
  const [hottestPosts, topAuthors] = await Promise.all([
    getHottestPosts(6),
    getTopAuthors(50),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1">
        <Hero topAuthors={topAuthors} />
        <HottestPosts posts={hottestPosts} />
      </main>
      <Footer />
    </div>
  );
}
