import { MediaContentType, ImageVariantOptions } from "@/types/media";

export const DEFAULT_PLACEHOLDERS: Record<string, string> = {
  poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600",
  backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
  banner: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
  photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
  profile: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400",
  logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
  thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400",
  trailer: "",
  ad_creative: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
  promo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200",
  asset: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600",
};

/**
 * Resolves a public URL for a media path in Supabase Storage.
 * Safe for use in both Client and Server Components.
 */
export function getPublicMediaUrl(path: string | null | undefined, bucket: string = "flex-system"): string {
  if (!path) return DEFAULT_PLACEHOLDERS.asset;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!supabaseUrl) return path;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Image optimization helper for Next.js Image component specs.
 * Safe for use in both Client and Server Components.
 */
export function getOptimizedMediaProps(
  urlOrPath: string | null | undefined,
  fallbackType: MediaContentType = "poster",
  options: ImageVariantOptions = {}
) {
  const src = urlOrPath && urlOrPath.startsWith("http")
    ? urlOrPath
    : getPublicMediaUrl(urlOrPath, "flex-system") || DEFAULT_PLACEHOLDERS[fallbackType];

  let width = options.width || 600;
  let height = options.height || 900;

  if (options.preset === "backdrop" || fallbackType === "backdrop") {
    width = options.width || 1200;
    height = options.height || 675;
  } else if (options.preset === "banner" || fallbackType === "banner") {
    width = options.width || 1200;
    height = options.height || 400;
  } else if (options.preset === "square" || fallbackType === "profile" || fallbackType === "logo") {
    width = options.width || 400;
    height = options.height || 400;
  }

  return {
    src,
    width,
    height,
    alt: fallbackType,
  };
}
