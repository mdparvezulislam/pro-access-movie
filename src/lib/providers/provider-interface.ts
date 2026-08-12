import {
  ProviderType,
  ContentType,
  ProviderSearchResult,
  NormalizedMovieData,
  NormalizedSeriesData,
} from "@/types/import";

export interface MetadataProvider {
  id: ProviderType;
  name: string;
  description: string;
  isConfigured(): boolean;

  search(
    query: string,
    type?: ContentType | "all"
  ): Promise<ProviderSearchResult[]>;

  getMovieDetails(externalId: string | number): Promise<NormalizedMovieData>;

  getSeriesDetails(externalId: string | number): Promise<NormalizedSeriesData>;
}
