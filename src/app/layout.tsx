import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "PRO ACCESS MOVIE — Premium Streaming Platform",
    template: "%s | PRO ACCESS MOVIE",
  },
  description: "Bangladesh-focused premium streaming platform for movies, series, and exclusive content.",
  metadataBase: new URL("https://proaccessmovie.com"),
  keywords: "streaming, movies, TV series, Bengali cinema, cinema, PRO ACCESS MOVIE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${hindSiliguri.variable} dark antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-red-600 selection:text-white pb-16 md:pb-0">
        <ThemeProvider>
          {children}
          <MobileBottomNav />
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
