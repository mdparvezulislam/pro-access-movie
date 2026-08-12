import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { EmptyState } from "@/components/common/empty-state";
import { Film } from "lucide-react";

export const metadata = {
  title: "Genres",
  description: "Browse movies and series by genre on PRO ACCESS MOVIE.",
};

export default function GenresPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Genres</h1>
          <p className="text-sm text-text-secondary">
            Explore movies, series, and exclusives categorized by genre.
          </p>
        </div>

        <EmptyState
          title="Genre Catalog Initializing"
          description="Genres are being indexed. Once media content is attached, genres will render dynamically."
          icon={<Film className="h-10 w-10 text-red-500" />}
          actionLabel="Explore Movies"
          actionHref="/movies"
        />
      </main>

      <Footer />
    </div>
  );
}
