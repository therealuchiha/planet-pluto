import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("skeleton rounded-xl", className)} {...props} />;
}

export function AnimeCardSkeleton() {
  return (
    <div className="space-y-2.5">
      <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function RowSkeleton({ title = true }: { title?: boolean }) {
  return (
    <section className="space-y-4">
      {title && <Skeleton className="h-7 w-52" />}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-36 shrink-0 sm:w-44">
            <AnimeCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}
