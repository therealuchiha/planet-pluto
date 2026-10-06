import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarClock, Clock, Film, Heart, Star, TrendingUp, Tv } from "lucide-react";
import {
  formatCountdown,
  formatEnum,
  formatFuzzyDate,
  getAnimeDetails,
  getTitle,
  stripHtml,
} from "@/lib/anilist";
import { createClient, getUser } from "@/lib/supabase/server";
import type { ListEntry } from "@/lib/database.types";
import { TrackWidget } from "@/components/tracking/track-widget";
import { AnimeCard } from "@/components/anime-card";
import { Synopsis } from "@/components/synopsis";

async function loadAnime(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const anime = await getAnimeDetails(id);
  if (!anime) notFound();
  return anime;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const anime = await loadAnime(id);
  const title = getTitle(anime.title);
  return {
    title,
    description: stripHtml(anime.description).slice(0, 160) || `Track ${title} on AniTrack.`,
    openGraph: { images: anime.bannerImage ? [anime.bannerImage] : [] },
  };
}

export default async function AnimePage({ params }: PageProps) {
  const { id } = await params;
  const anime = await loadAnime(id);
  const title = getTitle(anime.title);

  const user = await getUser();
  let entry: ListEntry | null = null;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_anime_list")
      .select("*")
      .eq("user_id", user.id)
      .eq("media_id", anime.id)
      .maybeSingle();
    entry = data;
  }

  const recommendations = anime.recommendations.nodes
    .map((n) => n.mediaRecommendation)
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const stats = [
    { icon: Star, label: "Score", value: anime.averageScore ? `${(anime.averageScore / 10).toFixed(1)}` : "—", tone: "text-st-paused" },
    { icon: TrendingUp, label: "Popularity", value: anime.popularity?.toLocaleString() ?? "—", tone: "text-accent" },
    { icon: Heart, label: "Favourites", value: anime.favourites?.toLocaleString() ?? "—", tone: "text-accent-3" },
  ];

  const info: [string, React.ReactNode][] = [
    ["Format", formatEnum(anime.format)],
    ["Episodes", anime.episodes ?? "?"],
    ["Duration", anime.duration ? `${anime.duration} min` : "—"],
    ["Status", formatEnum(anime.status)],
    ["Season", anime.season ? `${formatEnum(anime.season)} ${anime.seasonYear ?? ""}` : "—"],
    ["Aired", `${formatFuzzyDate(anime.startDate)} → ${anime.endDate.year ? formatFuzzyDate(anime.endDate) : "?"}`],
    ["Studio", anime.studios.nodes.map((s) => s.name).join(", ") || "—"],
    ["Source", formatEnum(anime.source)],
  ];

  return (
    <article>
      {/* Banner */}
      <div className="relative h-56 overflow-hidden sm:h-72 lg:h-96">
        {anime.bannerImage ? (
          <Image src={anime.bannerImage} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(120deg, ${anime.coverImage.color ?? "#27272a"}40, transparent)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative -mt-32 grid gap-8 sm:-mt-40 lg:grid-cols-[260px_1fr_340px]">
          {/* Cover */}
          <div className="mx-auto w-44 sm:w-52 lg:mx-0 lg:w-full">
            <div className="relative aspect-[2/3] overflow-hidden rounded-3xl shadow-2xl shadow-black/60 ring-1 ring-white/10">
              {anime.coverImage.extraLarge && (
                <Image src={anime.coverImage.extraLarge} alt={`${title} cover`} fill priority sizes="260px" className="object-cover" />
              )}
            </div>
          </div>

          {/* Main */}
          <div className="min-w-0 space-y-6 pt-0 lg:pt-44">
            <header className="space-y-3 text-center lg:text-left">
              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              {anime.title.romaji && anime.title.romaji !== title && (
                <p className="text-zinc-400">{anime.title.romaji}</p>
              )}
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                {anime.genres.map((g) => (
                  <span key={g} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
                    {g}
                  </span>
                ))}
              </div>
            </header>

            <div className="grid grid-cols-3 gap-3">
              {stats.map(({ icon: Icon, label, value, tone }) => (
                <div key={label} className="glass-card rounded-2xl p-4">
                  <Icon className={`h-4 w-4 ${tone}`} aria-hidden />
                  <p className="mt-2 font-display text-xl font-bold text-white">{value}</p>
                  <p className="text-xs text-zinc-500">{label}</p>
                </div>
              ))}
            </div>

            {anime.nextAiringEpisode && (
              <div className="flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent/5 p-4">
                <CalendarClock className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                <p className="text-sm text-zinc-300">
                  Episode <strong className="text-white">{anime.nextAiringEpisode.episode}</strong> airs in{" "}
                  <strong className="text-accent">{formatCountdown(anime.nextAiringEpisode.timeUntilAiring)}</strong>
                </p>
              </div>
            )}

            <section aria-labelledby="synopsis-heading" className="space-y-3">
              <h2 id="synopsis-heading" className="font-display text-lg font-semibold text-white">
                Synopsis
              </h2>
              <Synopsis text={stripHtml(anime.description) || "No synopsis available."} />
            </section>

            {anime.trailer?.site === "youtube" && (
              <section aria-labelledby="trailer-heading" className="space-y-3">
                <h2 id="trailer-heading" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
                  <Film className="h-4 w-4 text-accent" aria-hidden /> Trailer
                </h2>
                <div className="relative aspect-video overflow-hidden rounded-2xl ring-1 ring-white/10">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${anime.trailer.id}`}
                    title={`${title} trailer`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:pt-44">
            <div className="lg:sticky lg:top-24 space-y-5">
              <TrackWidget
                media={{
                  id: anime.id,
                  title,
                  coverImage: anime.coverImage.large,
                  totalEpisodes: anime.episodes,
                }}
                initialEntry={entry}
                isAuthed={Boolean(user)}
              />

              <section aria-labelledby="info-heading" className="glass-card rounded-3xl p-5">
                <h2 id="info-heading" className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
                  <Tv className="h-4 w-4 text-accent" aria-hidden /> Details
                </h2>
                <dl className="space-y-2.5 text-sm">
                  {info.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-zinc-500">{k}</dt>
                      <dd className="text-right font-medium text-zinc-200">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {anime.airingSchedule.nodes.length > 0 && (
                <section aria-labelledby="schedule-heading" className="glass-card rounded-3xl p-5">
                  <h2 id="schedule-heading" className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
                    <Clock className="h-4 w-4 text-accent" aria-hidden /> Airing schedule
                  </h2>
                  <ul className="space-y-2 text-sm">
                    {anime.airingSchedule.nodes.map((n) => (
                      <li key={n.episode} className="flex justify-between">
                        <span className="text-zinc-400">Ep {n.episode}</span>
                        <time dateTime={new Date(n.airingAt * 1000).toISOString()} className="font-medium text-zinc-200">
                          {new Date(n.airingAt * 1000).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "UTC",
                          })}{" "}
                          UTC
                        </time>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </aside>
        </div>

        {recommendations.length > 0 && (
          <section aria-labelledby="recs-heading" className="mt-16">
            <h2 id="recs-heading" className="mb-5 font-display text-2xl font-bold text-white">
              You might also like
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-6">
              {recommendations.map((r) => (
                <AnimeCard key={r.id} anime={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
