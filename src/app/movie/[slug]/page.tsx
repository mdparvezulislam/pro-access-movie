import { redirect } from "next/navigation";

interface MovieSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MovieSlugRedirectPage({ params }: MovieSlugPageProps) {
  const { slug } = await params;
  redirect(`/movies/${slug}`);
}
