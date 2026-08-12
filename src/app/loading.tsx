import { LoadingState } from "@/components/common/loading-state";

export default function RootLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <LoadingState variant="hero-skeleton" className="mb-12" />
      <LoadingState variant="skeleton-grid" />
    </div>
  );
}
