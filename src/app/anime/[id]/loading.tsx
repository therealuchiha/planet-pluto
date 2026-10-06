import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading anime">
      <Skeleton className="h-56 w-full rounded-none sm:h-72 lg:h-96" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative -mt-32 grid gap-8 sm:-mt-40 lg:grid-cols-[260px_1fr_340px]">
          <Skeleton className="mx-auto aspect-[2/3] w-44 rounded-3xl sm:w-52 lg:w-full" />
          <div className="space-y-4 lg:pt-44">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-5 lg:pt-44">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
