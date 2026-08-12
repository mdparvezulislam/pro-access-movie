import { ProviderType } from "@/types/import";
import { MetadataProvider } from "./provider-interface";
import { TmdbProvider } from "./tmdb-provider";
import { DemoProvider } from "./demo-provider";

class ProviderRegistry {
  private providers: Map<ProviderType, MetadataProvider> = new Map();

  constructor() {
    this.register(new TmdbProvider());
    this.register(new DemoProvider());
  }

  public register(provider: MetadataProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: ProviderType = "tmdb"): MetadataProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Provider '${id}' is not registered.`);
    }

    // If TMDB is requested but unconfigured, fall back gracefully to DemoProvider
    if (id === "tmdb" && !provider.isConfigured()) {
      return this.providers.get("demo") || provider;
    }

    return provider;
  }

  public listProviders(): { id: ProviderType; name: string; description: string; isConfigured: boolean }[] {
    return Array.from(this.providers.values()).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      isConfigured: p.isConfigured(),
    }));
  }
}

export const providerRegistry = new ProviderRegistry();
