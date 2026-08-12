import {
  ProviderType,
  ContentType,
  ProviderSearchResult,
  NormalizedMovieData,
  NormalizedSeriesData,
} from "@/types/import";
import { MetadataProvider } from "./provider-interface";

const DEMO_MOVIES: NormalizedMovieData[] = [
  {
    provider: "demo",
    external_id: "demo_hawa_2022",
    external_ids: { tmdb_id: 955342, imdb_id: "tt12345678" },
    title: "Hawa",
    title_bn: "হাওয়া",
    original_title: "Hawa",
    slug: "hawa-2022",
    overview: "A group of fishermen find a mysterious young girl in their catch in the middle of the deep sea. Greed and lust overcome the fishermen as bad omens begin to surround their ship.",
    overview_bn: "গভীর সমুদ্রে একদল জেলের ট্রলারে ধরা পড়ে রহস্যময় এক তরুণী। তাকে নিয়ে জেলেদের লোভ, লালসা ও লালসার জালে জড়িয়ে পড়ে পুরো ট্রলার।",
    release_year: 2022,
    release_date: "2022-07-29",
    duration_minutes: 131,
    rating: 8.2,
    vote_count: 14500,
    content_rating: "13+",
    original_language: "bn",
    country: "BD",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    poster_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
    backdrop_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
    genres: ["Drama", "Mystery", "Thriller"],
    cast: [
      { name: "Chanchal Chowdhury", character: "Chan Majhi", profile_path: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400" },
      { name: "Nazifa Tushi", character: "Gulti", profile_path: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" },
      { name: "Sariful Razz", character: "Ibrahim", profile_path: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400" },
    ],
    crew: [
      { name: "Mejbaur Rahman Sumon", job: "Director", department: "Directing" },
    ],
  },
  {
    provider: "demo",
    external_id: "demo_surangma_2023",
    external_ids: { tmdb_id: 1098234, imdb_id: "tt87654321" },
    title: "Surangma",
    title_bn: "সুরঙ্গ",
    original_title: "Surangma",
    slug: "surangma-2023",
    overview: "A devoted mechanic risks everything to dig a secret underground tunnel to rob a bank and win back the love of his life.",
    overview_bn: "ভালোবাসার মান রক্ষা করতে এবং ব্যাংকের টাকা চুরি করতে এক মিস্ত্রি দীর্ঘ এক গোপন সুরঙ্গ খনন করে।",
    release_year: 2023,
    release_date: "2023-06-29",
    duration_minutes: 150,
    rating: 8.5,
    vote_count: 21000,
    content_rating: "13+",
    original_language: "bn",
    country: "BD",
    trailer_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    poster_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600",
    backdrop_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200",
    genres: ["Crime", "Thriller", "Romance"],
    cast: [
      { name: "Afran Nisho", character: "Masud", profile_path: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400" },
      { name: "Tama Mirza", character: "Moyna", profile_path: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400" },
    ],
    crew: [
      { name: "Raihan Rafi", job: "Director", department: "Directing" },
    ],
  },
  {
    provider: "demo",
    external_id: "demo_inception_2010",
    external_ids: { tmdb_id: 27205, imdb_id: "tt1375666" },
    title: "Inception",
    title_bn: "ইনসেপশন",
    original_title: "Inception",
    slug: "inception-2010",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to have his criminal history erased.",
    overview_bn: "মানুষের স্বপ্নের ভেতর ঢুকে তথ্য চুরি করা এক অভিজ্ঞ চোরের গল্প।",
    release_year: 2010,
    release_date: "2010-07-16",
    duration_minutes: 148,
    rating: 8.8,
    vote_count: 340000,
    content_rating: "13+",
    original_language: "en",
    country: "US",
    poster_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
    backdrop_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
    genres: ["Action", "Sci-Fi", "Adventure"],
    cast: [
      { name: "Leonardo DiCaprio", character: "Dom Cobb" },
      { name: "Joseph Gordon-Levitt", character: "Arthur" },
    ],
    crew: [
      { name: "Christopher Nolan", job: "Director", department: "Directing" },
    ],
  },
];

const DEMO_SERIES: NormalizedSeriesData[] = [
  {
    provider: "demo",
    external_id: "demo_karagar_2022",
    external_ids: { tmdb_id: 205643, imdb_id: "tt21894560" },
    title: "Karagar",
    title_bn: "কারাগার",
    original_title: "Karagar",
    slug: "karagar-2022",
    overview: "Cell No. 50 of Akashnagar Central Jail has been locked for 50 years. Suddenly, a mute prisoner appears inside cell 50, claiming he has been incarcerated for 250 years.",
    overview_bn: "আকাশনগর কেন্দ্রীয় কারাগারের ৫০ নম্বর কক্ষ ৫০ বছর ধরে বন্ধ ছিল। হঠাৎ একদিন সেখানে দেখা যায় এক নতুন কয়েদিকে। সে দাবি করে সে ২৫০ বছর ধরে বন্দী!",
    release_year: 2022,
    first_air_date: "2022-08-19",
    rating: 8.9,
    vote_count: 18900,
    content_rating: "16+",
    original_language: "bn",
    country: "BD",
    poster_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600",
    backdrop_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200",
    genres: ["Mystery", "Thriller", "Drama"],
    cast: [
      { name: "Chanchal Chowdhury", character: "The Prisoner" },
      { name: "Intekhab Dinar", character: "Jailor Mostaq" },
    ],
    crew: [
      { name: "Syed Ahmed Shawki", job: "Director", department: "Directing" },
    ],
    seasons: [
      {
        season_number: 1,
        title: "Season 1",
        overview: "The mysterious arrival of prisoner 50.",
        poster_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600",
        episodes: [
          { episode_number: 1, title: "The Prisoner of Cell 50", overview: "A mysterious man appears in cell 50.", duration_minutes: 32 },
          { episode_number: 2, title: "The Trial of Time", overview: "Investigating the prisoner's claims.", duration_minutes: 35 },
          { episode_number: 3, title: "Unspoken Secrets", overview: "The mystery deepens.", duration_minutes: 30 },
        ],
      },
      {
        season_number: 2,
        title: "Season 2",
        overview: "The resolution of the mystery.",
        poster_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
        episodes: [
          { episode_number: 1, title: "Return to Akashnagar", overview: "Reopening old cases.", duration_minutes: 40 },
          { episode_number: 2, title: "The Final Truth", overview: "The truth is revealed.", duration_minutes: 45 },
        ],
      },
    ],
  },
  {
    provider: "demo",
    external_id: "demo_breaking_bad_2008",
    external_ids: { tmdb_id: 1396, imdb_id: "tt0903747" },
    title: "Breaking Bad",
    title_bn: "ব্রেকিং ব্যাড",
    original_title: "Breaking Bad",
    slug: "breaking-bad-2008",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
    overview_bn: "ক্যান্সারে আক্রান্ত এক রসায়নের শিক্ষক তার পরিবারের ভবিষ্যতের জন্য মেথ চুরির পথ বেছে নেয়।",
    release_year: 2008,
    first_air_date: "2008-01-20",
    rating: 9.5,
    vote_count: 520000,
    content_rating: "18+",
    original_language: "en",
    country: "US",
    poster_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
    backdrop_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
    genres: ["Crime", "Drama", "Thriller"],
    cast: [
      { name: "Bryan Cranston", character: "Walter White" },
      { name: "Aaron Paul", character: "Jesse Pinkman" },
    ],
    crew: [
      { name: "Vince Gilligan", job: "Creator", department: "Directing" },
    ],
    seasons: [
      {
        season_number: 1,
        title: "Season 1",
        overview: "Walter White begins his transformation.",
        poster_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
        episodes: [
          { episode_number: 1, title: "Pilot", overview: "Walter White is diagnosed with cancer.", duration_minutes: 58 },
          { episode_number: 2, title: "Cat's in the Bag...", overview: "Disposing of the evidence.", duration_minutes: 48 },
        ],
      },
    ],
  },
];

export class DemoProvider implements MetadataProvider {
  id: ProviderType = "demo";
  name = "Demo / Mock Catalog";
  description = "Pre-normalized Bengali and Global catalog for offline testing and verification.";

  isConfigured(): boolean {
    return true;
  }

  async search(query: string, type: ContentType | "all" = "all"): Promise<ProviderSearchResult[]> {
    const q = query.toLowerCase().trim();
    const results: ProviderSearchResult[] = [];

    if (type === "movie" || type === "all") {
      for (const m of DEMO_MOVIES) {
        if (
          !q ||
          m.title.toLowerCase().includes(q) ||
          m.title_bn?.toLowerCase().includes(q) ||
          m.overview.toLowerCase().includes(q)
        ) {
          results.push({
            external_id: m.external_id,
            provider: "demo",
            type: "movie",
            tmdb_id: m.external_ids.tmdb_id,
            imdb_id: m.external_ids.imdb_id,
            title: m.title,
            title_bn: m.title_bn,
            original_title: m.original_title,
            overview: m.overview,
            overview_bn: m.overview_bn,
            release_year: m.release_year,
            poster_url: m.poster_url,
            backdrop_url: m.backdrop_url,
            vote_average: m.rating,
            genres: m.genres,
          });
        }
      }
    }

    if (type === "series" || type === "all") {
      for (const s of DEMO_SERIES) {
        if (
          !q ||
          s.title.toLowerCase().includes(q) ||
          s.title_bn?.toLowerCase().includes(q) ||
          s.overview.toLowerCase().includes(q)
        ) {
          results.push({
            external_id: s.external_id,
            provider: "demo",
            type: "series",
            tmdb_id: s.external_ids.tmdb_id,
            imdb_id: s.external_ids.imdb_id,
            title: s.title,
            title_bn: s.title_bn,
            original_title: s.original_title,
            overview: s.overview,
            overview_bn: s.overview_bn,
            release_year: s.release_year,
            poster_url: s.poster_url,
            backdrop_url: s.backdrop_url,
            vote_average: s.rating,
            genres: s.genres,
          });
        }
      }
    }

    return results;
  }

  async getMovieDetails(externalId: string | number): Promise<NormalizedMovieData> {
    const strId = String(externalId);
    const item = DEMO_MOVIES.find(
      (m) => m.external_id === strId || m.external_ids.tmdb_id === Number(strId)
    );
    if (!item) {
      throw new Error(`Demo movie with ID ${externalId} not found.`);
    }
    return item;
  }

  async getSeriesDetails(externalId: string | number): Promise<NormalizedSeriesData> {
    const strId = String(externalId);
    const item = DEMO_SERIES.find(
      (s) => s.external_id === strId || s.external_ids.tmdb_id === Number(strId)
    );
    if (!item) {
      throw new Error(`Demo TV series with ID ${externalId} not found.`);
    }
    return item;
  }
}
