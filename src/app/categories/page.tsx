import Link from "next/link";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { LayoutGrid, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = [
    { id: "c1", name: "Bengali Cinema", nameBn: "বাংলা সিনেমা", backdrop: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop", count: 12 },
    { id: "c2", name: "Action & Heist", nameBn: "অ্যাকশন ও সুরঙ্গ", backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop", count: 18 },
    { id: "c3", name: "Crime Thrillers", nameBn: "ক্রাইম থ্রিলার", backdrop: "https://images.unsplash.com/photo-1518676599626-5cd8c2d3f853?q=80&w=800&auto=format&fit=crop", count: 14 },
    { id: "c4", name: "Original Web Series", nameBn: "অরিজিনাল ওয়েব সিরিজ", backdrop: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop", count: 8 },
  ];

  const collections = [
    { title: "Dhaka Underworld Classics", titleBn: "ঢাকার অন্ধকার জগতের থ্রিলার", description: "Top-rated Bengali crime dramas including Surongo, Toofan, and Mohanagar.", count: "6 Titles" },
    { title: "Mystery & Prison Thrillers", titleBn: "রহস্য ও কারাগারের গল্প", description: "Deep mystery thrillers led by Karaghar, Taqdeer, and Hawa.", count: "5 Titles" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
            <LayoutGrid className="h-7 w-7 text-red-500" />
            <span>Categories & Collections</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Explore curated movie collections, genres, and thematic categories
          </p>
        </div>

        {/* Categories Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-text-primary">Content Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/genres?name=${encodeURIComponent(c.name)}`}
                className="group relative rounded-3xl overflow-hidden aspect-[16/9] border border-border bg-black shadow-xl hover:border-red-600/60 transition-all duration-300 block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.backdrop}
                  alt={c.name}
                  className="w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 space-y-1 z-10">
                  <span className="text-[10px] font-mono font-bold text-red-400 uppercase">{c.count} TITLES</span>
                  <h3 className="text-base font-extrabold text-white group-hover:text-red-400 transition">{c.name}</h3>
                  <p className="text-xs text-neutral-300 font-bengali">{c.nameBn}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Collections */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-extrabold text-text-primary flex items-center gap-2">
            <Layers className="h-5 w-5 text-red-500" />
            <span>Featured Curated Collections</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map((col, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-surface-raised border border-border space-y-3 shadow-xl hover:border-red-600/50 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-red-600/20 border border-red-500/30 text-[10px] font-mono font-bold text-red-400 uppercase">
                    Curated Spotlight
                  </span>
                  <span className="text-xs font-mono text-text-muted">{col.count}</span>
                </div>
                <h3 className="text-lg font-black text-text-primary">{col.title}</h3>
                <p className="text-xs font-bold text-red-400 font-bengali">{col.titleBn}</p>
                <p className="text-xs text-text-muted leading-relaxed">{col.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
