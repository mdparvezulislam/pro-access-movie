// Feature module: Content
export * from "@/types/content";
export * from "@/lib/validation/content";

/**
 * Filter function to ensure draft and archived items are strictly excluded from public consumption
 */
export function filterPublicContent<T extends { state: string }>(items: T[]): T[] {
  return items.filter((item) => item.state === "published");
}
