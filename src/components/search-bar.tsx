"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Loader2, Search, Star, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { formatEnum, getTitle, type PagedMedia } from "@/lib/anilist";
import { cn } from "@/lib/utils";

async function fetchSearch(q: string, signal: AbortSignal): Promise<PagedMedia> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&perPage=8`, { signal });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Search failed (${res.status})`);
  }
  return res.json();
}

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const uid = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  // 300ms debounce keeps us well under AniList's 90 req/min limit
  const debounced = useDebounce(value.trim(), 300);

  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["anilist-search", debounced.toLowerCase()],
    queryFn: ({ signal }) => fetchSearch(debounced, signal),
    enabled: debounced.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });

  const results = debounced.length >= 2 ? (data?.media ?? []) : [];
  const listId = `${uid}-results`;

  // Close on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // "/" focuses the visible search input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key !== "/" || /input|textarea|select/i.test(target.tagName)) return;
      if (inputRef.current?.offsetParent === null) return; // hidden instance
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (id: number) => {
    setOpen(false);
    setValue("");
    inputRef.current?.blur();
    router.push(`/anime/${id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      go(results[active].id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showPanel = open && debounced.length >= 2;

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <div className="group relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-accent"
          aria-hidden
        />
        <input
          ref={inputRef}
          id={`${uid}-search-input`}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${uid}-opt-${active}` : undefined}
          aria-label="Search anime"
          placeholder="Search anime…"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-10 w-full rounded-xl border border-white/8 bg-white/[0.04] pl-10 pr-16 text-sm text-white placeholder:text-zinc-500 outline-none transition-all focus:border-accent/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-accent/10 [&::-webkit-search-cancel-button]:hidden"
        />
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-accent" aria-label="Loading" />}
          {value ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              className="rounded-md p-1 text-zinc-500 hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 lg:block">
              /
            </kbd>
          )}
        </div>
      </div>

      {showPanel && (
        <div className="glass-card absolute inset-x-0 top-full z-[60] mt-2 max-h-[70vh] animate-fade-up overflow-y-auto rounded-2xl p-1.5 shadow-2xl shadow-black/60">
          {isError ? (
            <p className="px-3 py-6 text-center text-sm text-st-dropped">{(error as Error).message}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-zinc-400">
              {isFetching ? "Searching…" : `No results for “${debounced}”`}
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Search suggestions">
              {results.map((a, i) => (
                <li key={a.id} id={`${uid}-opt-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={`/anime/${a.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(a.id);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl p-2 transition-colors",
                      i === active ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-elevated">
                      {a.coverImage.medium && (
                        <Image src={a.coverImage.medium} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{getTitle(a.title)}</p>
                      <p className="truncate text-xs text-zinc-400">
                        {[formatEnum(a.format), a.seasonYear, a.episodes && `${a.episodes} eps`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {a.averageScore && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-st-paused">
                        <Star className="h-3 w-3 fill-current" aria-hidden />
                        {(a.averageScore / 10).toFixed(1)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
