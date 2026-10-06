import { Flame, Sparkles, Trophy, Sword } from "lucide-react";
import {
  formatEnum,
  getCurrentSeason,
  getSeasonalAnime,
  getTopRatedAnime,
  getTrendingAnime,
  getBleachCollection,
} from "@/lib/anilist";
import { HeroBanner } from "@/components/hero-banner";
import { AnimeRow, RowItem } from "@/components/anime-row";
import { AnimeCard } from "@/components/anime-card";

// AniList responses are cached for an hour via fetch's `next.revalidate`.
export const revalidate = 3600;

export default async function DiscoverPage() {
  const { season, year } = getCurrentSeason();

  const [bleachMedia, trending, seasonal, topRated] = await Promise.all([
    getBleachCollection(),
    getTrendingAnime(1, 20),
    getSeasonalAnime(1, 20, { season, year }),
    getTopRatedAnime(1, 12),
  ]);

  return (
    <>
      <HeroBanner anime={bleachMedia[0] ?? null} />

      <div className="mx-auto max-w-7xl space-y-14 px-4 sm:px-6 pt-10">
        {/* Dedicated Bleach Universe & Sagas Section */}
        {bleachMedia.length > 0 && (
          <AnimeRow
            id="bleach-sagas"
            title="BLEACH // Sagas & The Soul Society"
            icon={<Sword className="h-4 w-4 text-white" aria-hidden />}
            subtitle="The complete Tite Kubo animated universe — Soul Society, Arrancar & TYBW"
          >
            {bleachMedia.map((a, i) => (
              <RowItem key={a.id}>
                <AnimeCard anime={a} rank={i + 1} priority={i < 3} />
              </RowItem>
            ))}
          </AnimeRow>
        )}

        <AnimeRow
          id="trending"
          title="Trending in the Human World"
          icon={<Flame className="h-4 w-4" aria-hidden />}
          subtitle="What the anime community is watching this week"
        >
          {trending.media.map((a, i) => (
            <RowItem key={a.id}>
              <AnimeCard anime={a} rank={i + 1} priority={i < 4} />
            </RowItem>
          ))}
        </AnimeRow>

        <AnimeRow
          id="seasonal"
          title="Popular This Season"
          icon={<Sparkles className="h-4 w-4" aria-hidden />}
          subtitle={`${formatEnum(season)} ${year} lineup`}
        >
          {seasonal.media.map((a) => (
            <RowItem key={a.id}>
              <AnimeCard anime={a} />
            </RowItem>
          ))}
        </AnimeRow>

        <section aria-labelledby="top-heading" className="animate-fade-up">
          <div className="mb-5">
            <h2 id="top-heading" className="flex items-center gap-2.5 font-display text-xl font-black uppercase tracking-wider text-white sm:text-2xl">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-zinc-950 font-bold">
                <Trophy className="h-4 w-4" aria-hidden />
              </span>
              Top Rated of All Time
            </h2>
            <p className="mt-1 text-sm text-zinc-400">The highest-scored anime masterworks on AniList</p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {topRated.media.map((a, i) => (
              <AnimeCard key={a.id} anime={a} rank={i + 1} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
