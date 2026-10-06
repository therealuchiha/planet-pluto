import { Skeleton, RowSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-16 sm:px-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-20 w-full max-w-xl" />
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="hidden aspect-[2/3] w-72 rounded-3xl md:block" />
      </div>
      <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-6">
        <RowSkeleton />
        <RowSkeleton />
      </div>
    </div>
  );
}
