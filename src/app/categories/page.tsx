import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { getCategories } from "@/lib/content/categories";
import { getFeaturedCollections } from "@/lib/content/collections";
import { LayoutGrid, Layers } from "lucide-react";

export default async function CategoriesPage() {
  const [categories, collections] = await Promise.all([
    getCategories(),
    getFeaturedCollections(),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <LayoutGrid className="h-7 w-7 text-red-500" />
            <span>Categories & Collections</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Explore curated movie collections, genres, and thematic categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Content Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-surface-base border border-border hover:bg-surface-raised transition-all cursor-pointer group"
              >
                <h3 className="font-extrabold text-base text-text-primary group-hover:text-red-500 transition-colors">
                  {c.name}
                </h3>
                {c.description && (
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{c.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Featured Collections */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Layers className="h-5 w-5 text-red-500" />
            <span>Featured Collections</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((col) => (
              <div
                key={col.id}
                className="p-6 rounded-2xl bg-gradient-to-br from-card via-surface-base to-surface-raised border border-border space-y-2"
              >
                <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-[10px] font-bold text-red-400 uppercase">
                  Curated Collection
                </span>
                <h3 className="text-lg font-extrabold text-text-primary">{col.title}</h3>
                {col.description && (
                  <p className="text-xs text-text-secondary">{col.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
