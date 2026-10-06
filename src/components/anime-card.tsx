import Image from "next/image";
import Link from "next/link";
import { Play, Star, Tv } from "lucide-react";
import { formatEnum, getTitle, type AnimeCardData } from "@/lib/anilist";
import type { ListStatus } from "@/lib/database.types";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

export interface AnimeCardProps {
  anime: AnimeCardData;
  rank?: number;
  listStatus?: ListStatus;
  priority?: boolean;
  className?: string;
}

/**
 * Poster card used across Discover rows, grids and recommendations.
 * Pure presentational server-compatible component (no client JS).
 */
export function AnimeCard({ anime, rank, listStatus, priority, className }: AnimeCardProps) {
  const title = getTitle(anime.title);
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : null;
  const accent = anime.coverImage.color ?? "#7c5cff";

  return (
    <Link
      href={`/anime/${anime.id}`}
      className={cn("group/card block outline-none", className)}
      style={{ ["--card-accent" as string]: accent }}
      aria-label={`${title}${score ? `, rated ${score}` : ""}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-elevated ring-1 ring-white/5 transition-all duration-300 group-hover/card:-translate-y-1 group-hover/card:shadow-[0_20px_40px_-12px_var(--card-accent)] group-hover/card:ring-white/20 group-focus-visible/card:ring-2 group-focus-visible/card:ring-accent">
        {anime.coverImage.large ? (
          <Image
            src={anime.coverImage.extraLarge ?? anime.coverImage.large}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
            className="object-cover transition-transform duration-500 group-hover/card:scale-[1.06]"
          />
        ) : (
          <div className="grid h-full place-items-center text-zinc-600">
            <Tv className="h-10 w-10" aria-hidden />
          </div>
        )}

        {/* Gradient + hover details */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover/card:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100">
          <div className="flex flex-wrap gap-1">
            {anime.genres.slice(0, 2).map((g) => (
              <span key={g} className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                {g}
              </span>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-white/15 opacity-0 backdrop-blur-md transition-all duration-300 group-hover/card:scale-100 group-hover/card:opacity-100">
          <Play className="ml-0.5 h-5 w-5 fill-white text-white" aria-hidden />
        </div>

        {rank !== undefined && (
          <span className="absolute left-2 top-2 grid h-7 min-w-7 place-items-center rounded-lg bg-black/60 px-1.5 font-display text-sm font-bold text-white backdrop-blur">
            #{rank}
          </span>
        )}

        {score && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/60 px-1.5 py-1 text-xs font-bold text-white backdrop-blur">
            <Star className="h-3 w-3 fill-st-paused text-st-paused" aria-hidden />
            {score}
          </span>
        )}

        {listStatus && (
          <div className="absolute bottom-2 left-2 group-hover/card:opacity-0">
            <StatusBadge status={listStatus} className="bg-black/70 backdrop-blur" />
          </div>
        )}
      </div>

      <div className="mt-2.5 space-y-0.5 px-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-100 transition-colors group-hover/card:text-white">
          {title}
        </h3>
        <p className="text-xs text-zinc-500">
          {[formatEnum(anime.format), anime.seasonYear, anime.episodes ? `${anime.episodes} eps` : null]
            .filter((v) => v && v !== "—")
            .join(" · ")}
        </p>
      </div>
    </Link>
  );
}
