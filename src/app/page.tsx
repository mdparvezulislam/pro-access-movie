import { Navbar } from "@/components/common/navbar";
import { HeroBanner } from "@/components/common/hero-banner";
import { ContentRail } from "@/components/common/content-rail";
import { Footer } from "@/components/common/footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-6">
        <HeroBanner />

        <div className="space-y-6">
          <ContentRail
            title="Trending Now"
            subtitle="Most watched titles across Bangladesh today"
          />

          <ContentRail
            title="Bengali Exclusive"
            subtitle="Original series & high-definition classics"
          />

          <ContentRail
            title="Top Action Blockbusters"
            subtitle="Adrenaline-fueled cinema streaming now"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
