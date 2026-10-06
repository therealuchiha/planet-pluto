import Image from "next/image";
import Link from "next/link";
import { Play, Sword, Star, Tv, Film, Info } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import type { AnimeCardData } from "@/lib/anilist";

export interface HeroBannerProps {
  anime?: AnimeCardData | null;
}

export function HeroBanner({ anime }: HeroBannerProps) {
  return (
    <section aria-label="Bleach featured banner" className="relative isolate overflow-hidden border-b border-white/10">
      {/* Background Banner with Bleach Artwork */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/bleach-banner.jpg"
          alt="Bleach by Tite Kubo"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45 transition-transform duration-700 hover:scale-105"
        />
        {/* Monochromatic high-contrast gradients - no purple/indigo lights */}
        <div className="absolute inset-0 bg-gradient-to-r from-base via-base/90 to-base/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-base/60" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pb-24 md:pt-20">
        {/* Left Column: Stark Kubo Typography & Bleach Info */}
        <div className="animate-fade-up space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded bg-white px-2.5 py-0.5 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-zinc-950">
              PLANET PLUTO
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              SOUL REAPER ARCHIVE // TITE KUBO
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="font-display text-5xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
              BLEACH
            </h1>
            <p className="font-display text-xl font-light tracking-[0.35em] text-zinc-400 sm:text-2xl">
              ブリーチ · THE SUBSTITUTE CHRONICLES
            </p>
          </div>

          {/* Kubo Quote */}
          <div className="max-w-xl border-l-2 border-white pl-4 text-sm italic leading-relaxed text-zinc-300">
            &ldquo;Even if no one believes in you, stick out your chest and scream your defiance.&rdquo;
            <span className="mt-1 block font-mono text-xs not-italic text-zinc-500">— Ichigo Kurosaki</span>
          </div>

          {/* Key Series Meta Chips */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            <span className="flex items-center gap-1.5 text-white">
              <Star className="h-3.5 w-3.5 fill-white text-white" aria-hidden /> 8.2 Community Score
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Tv className="h-3.5 w-3.5 text-zinc-500" aria-hidden /> 366 Classic Episodes
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Sword className="h-3.5 w-3.5 text-zinc-500" aria-hidden /> TYBW Sagas
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <Film className="h-3.5 w-3.5 text-zinc-500" aria-hidden /> 4 Theatrical Movies
            </span>
          </div>

          {/* Genres Chips */}
          <div className="flex flex-wrap gap-1.5">
            {["Action", "Supernatural", "Shounen", "Soul Society", "Kubo Fashion"].map((tag) => (
              <span
                key={tag}
                className="rounded border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/anime/269"
              className={buttonClasses("primary", "lg")}
              id="hero-track-bleach-classic"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden /> Track Bleach (Classic)
            </Link>
            <Link
              href="/anime/116674"
              className={buttonClasses("outline", "lg")}
              id="hero-track-tybw"
            >
              <Sword className="h-4 w-4" aria-hidden /> Track TYBW Saga
            </Link>
            <a
              href="#bleach-sagas"
              className={buttonClasses("ghost", "lg")}
            >
              <Info className="h-4 w-4" aria-hidden /> Franchise Arcs
            </a>
          </div>
        </div>

        {/* Right Column: Featured Banner Art Card */}
        <div className="animate-fade-up">
          <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-surface/90 shadow-2xl transition-all duration-300 hover:border-white/50">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
              <Image
                src="/images/bleach-banner.jpg"
                alt="Bleach Streetwear Art by Tite Kubo"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute left-3 top-3 rounded border border-white/20 bg-black/80 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                ORIGINAL MANGA SPREAD
              </div>
            </div>

            <div className="space-y-3 border-t border-white/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
                    Karakura Urban High-Fashion
                  </h2>
                  <p className="font-mono text-[11px] text-zinc-400">Tite Kubo · All Colour But The Black</p>
                </div>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Ch. 190
                </span>
              </div>

              <p className="text-xs leading-relaxed text-zinc-400">
                Ichigo Kurosaki, Renji Abarai, Yasutora Sado, and Uryū Ishida rendered in Kubo&apos;s trademark streetwear illustration.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/anime/269"
                  className="rounded-lg border border-white bg-white py-2 text-center text-xs font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-zinc-200"
                >
                  Bleach (366 eps)
                </Link>
                <Link
                  href="/anime/116674"
                  className="rounded-lg border border-white/20 py-2 text-center text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  TYBW (Arc)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
