import Image from "next/image";
import Link from "next/link";
import { Info, Star } from "lucide-react";
import { formatEnum, getTitle, stripHtml, type AnimeCardData } from "@/lib/anilist";
import { buttonClasses } from "@/components/ui/button";

export function HeroBanner({ anime }: { anime: AnimeCardData | null }) {
  return (
    <section aria-label="Featured" className="relative isolate overflow-hidden border-b border-white/10">
      <Image src="/images/bleach-banner.jpg" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-base via-base/85 to-base/30" />

      <div className="mx-auto max-w-7xl space-y-5 px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-20">
        <h1 className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-7xl">
          {anime ? getTitle(anime.title) : "Bleach"}
        </h1>
        {anime && (
          <>
            <p className="flex flex-wrap gap-x-4 text-sm font-semibold uppercase tracking-wider text-zinc-300">
              {anime.averageScore && (
                <span className="flex items-center gap-1.5 text-white">
                  <Star className="h-4 w-4 fill-current" aria-hidden /> {(anime.averageScore / 10).toFixed(1)}
                </span>
              )}
              <span>{formatEnum(anime.format)}</span>
              {anime.episodes && <span>{anime.episodes} episodes</span>}
            </p>
            <p className="line-clamp-3 max-w-xl text-zinc-400">{stripHtml(anime.description)}</p>
            <Link href={`/anime/${anime.id}`} className={buttonClasses("primary", "lg")} id="hero-view-details">
              <Info className="h-4 w-4" aria-hidden /> View details &amp; track
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
