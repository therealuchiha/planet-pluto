"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Horizontally scrolling, snap-aligned carousel with arrow controls. */
export function AnimeRow({
  title,
  icon,
  subtitle,
  children,
  id,
}: {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  id: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section aria-labelledby={`${id}-heading`} className="animate-fade-up">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 id={`${id}-heading`} className="flex items-center gap-2.5 font-display text-xl font-bold text-white sm:text-2xl">
            {icon && (
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent">
                {icon}
              </span>
            )}
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
        </div>
        <div className="hidden gap-2 sm:flex">
          {([-1, 1] as const).map((dir) => {
            const enabled = dir === -1 ? canPrev : canNext;
            const Chevron = dir === -1 ? ChevronLeft : ChevronRight;
            return (
              <button
                key={dir}
                type="button"
                id={`${id}-${dir === -1 ? "prev" : "next"}`}
                aria-label={dir === -1 ? `Scroll ${title} left` : `Scroll ${title} right`}
                disabled={!enabled}
                onClick={() => scroll(dir)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:border-accent/50 hover:text-white disabled:opacity-30"
              >
                <Chevron className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 pt-1 sm:-mx-6 sm:px-6"
        >
          {children}
        </div>
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 -left-4 w-12 bg-gradient-to-r from-base to-transparent transition-opacity sm:-left-6",
            canPrev ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 -right-4 w-12 bg-gradient-to-l from-base to-transparent transition-opacity sm:-right-6",
            canNext ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </section>
  );
}

export function RowItem({ children }: { children: React.ReactNode }) {
  return <div className="w-36 shrink-0 snap-start sm:w-44">{children}</div>;
}
