import { requireAdminAuth } from "@/features/auth/lib/auth-helpers";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldCheck, UploadCloud } from "lucide-react";

export default async function AdminMediaDemoPage() {
  await requireAdminAuth("/admin/media/demo");

  // Demo UUID for verification
  const demoMovieId = "55555555-0000-0000-0000-000000000001";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Media Storage Pipeline Demo
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Admin Gated
          </span>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Verify server-side admin upload pipeline to Supabase private storage buckets
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-surface-base border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-red-500" />
              <span>Poster Upload (2:3 Aspect)</span>
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Uploads to <code className="text-red-400">flex-posters</code> private bucket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader
              bucket="flex-posters"
              mediaType="poster"
              contentKind="movie"
              contentId={demoMovieId}
              aspectRatio="poster"
            />
          </CardContent>
        </Card>

        <Card className="bg-surface-base border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-rose-500" />
              <span>Backdrop Upload (16:9 Aspect)</span>
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">
              Uploads to <code className="text-red-400">flex-backdrops</code> private bucket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader
              bucket="flex-backdrops"
              mediaType="backdrop"
              contentKind="movie"
              contentId={demoMovieId}
              aspectRatio="backdrop"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
