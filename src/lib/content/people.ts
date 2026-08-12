import "server-only";
import { createServerClient } from "@/lib/supabase/server";
import { Person, CastMember, CrewMember } from "@/types/content";

export async function getPersonBySlug(slug: string): Promise<Person | null> {
  if (!slug) return null;
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error(`Error fetching person with slug '${slug}':`, error);
    return null;
  }

  return (data as Person) || null;
}

export async function getPersonCredits(personId: string): Promise<{
  cast: CastMember[];
  crew: CrewMember[];
}> {
  const supabase = await createServerClient();

  const [castRes, crewRes] = await Promise.all([
    supabase
      .from("cast")
      .select("*")
      .eq("person_id", personId)
      .order("ordering", { ascending: true }),
    supabase
      .from("crew")
      .select("*")
      .eq("person_id", personId)
      .order("ordering", { ascending: true }),
  ]);

  return {
    cast: (castRes.data || []) as CastMember[],
    crew: (crewRes.data || []) as CrewMember[],
  };
}
