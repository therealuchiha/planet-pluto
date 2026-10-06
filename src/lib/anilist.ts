/**
 * AniList GraphQL client — https://graphql.anilist.co
 *
 * - Typed helpers for search, trending, seasonal, top-rated and details.
 * - Server-side: responses are cached by Next.js' Data Cache (`revalidate: 3600`),
 *   keyed on the POST body, so identical queries across users hit AniList once/hour.
 * - Rate limits (90 req/min): honours `Retry-After` on HTTP 429 and retries once.
 */

const ANILIST_ENDPOINT = "https://graphql.anilist.co";
export const ANILIST_REVALIDATE = 3600;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MediaStatus = "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";
export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";
export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC";

export interface MediaTitle {
  romaji: string | null;
  english: string | null;
  native?: string | null;
}

export interface AnimeCardData {
  id: number;
  title: MediaTitle;
  coverImage: { extraLarge?: string | null; large: string | null; medium: string | null; color?: string | null };
  bannerImage?: string | null;
  episodes: number | null;
  genres: string[];
  averageScore: number | null;
  seasonYear: number | null;
  season?: MediaSeason | null;
  status: MediaStatus | null;
  format?: MediaFormat | null;
  description?: string | null;
  nextAiringEpisode?: { episode: number; airingAt: number; timeUntilAiring: number } | null;
}

export interface FuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface AnimeDetails extends AnimeCardData {
  description: string | null;
  bannerImage: string | null;
  duration: number | null;
  source: string | null;
  popularity: number | null;
  favourites: number | null;
  meanScore: number | null;
  startDate: FuzzyDate;
  endDate: FuzzyDate;
  studios: { nodes: { id: number; name: string }[] };
  trailer: { id: string; site: "youtube" | "dailymotion"; thumbnail: string | null } | null;
  airingSchedule: { nodes: { episode: number; airingAt: number }[] };
  recommendations: { nodes: { mediaRecommendation: AnimeCardData | null }[] };
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface PagedMedia {
  pageInfo: PageInfo;
  media: AnimeCardData[];
}

export class AniListError extends Error {
  constructor(
    message: string,
    public status?: number,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = "AniListError";
  }
}

// ---------------------------------------------------------------------------
// GraphQL documents
// ---------------------------------------------------------------------------

const MEDIA_CARD_FRAGMENT = /* GraphQL */ `
  fragment MediaCard on Media {
    id
    title { romaji english native }
    coverImage { extraLarge large medium color }
    bannerImage
    episodes
    genres
    averageScore
    seasonYear
    season
    status
    format
    nextAiringEpisode { episode airingAt timeUntilAiring }
  }
`;

const SEARCH_QUERY = /* GraphQL */ `
  query SearchAnime($query: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage perPage }
      media(search: $query, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        id
        title { romaji english }
        coverImage { large medium }
        episodes
        genres
        averageScore
        seasonYear
        status
        format
      }
    }
  }
`;

const LIST_QUERY = /* GraphQL */ `
  query ListAnime(
    $page: Int
    $perPage: Int
    $sort: [MediaSort]
    $season: MediaSeason
    $seasonYear: Int
    $status: MediaStatus
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage perPage }
      media(
        type: ANIME
        sort: $sort
        season: $season
        seasonYear: $seasonYear
        status: $status
        isAdult: false
      ) {
        ...MediaCard
        description(asHtml: false)
      }
    }
  }
  ${MEDIA_CARD_FRAGMENT}
`;

const BLEACH_COLLECTION_QUERY = /* GraphQL */ `
  query BleachCollection($ids: [Int]) {
    Page(page: 1, perPage: 10) {
      media(id_in: $ids, type: ANIME) {
        ...MediaCard
        description(asHtml: false)
      }
    }
  }
  ${MEDIA_CARD_FRAGMENT}
`;

const DETAILS_QUERY = /* GraphQL */ `
  query AnimeDetails($id: Int) {
    Media(id: $id, type: ANIME) {
      ...MediaCard
      description(asHtml: false)
      duration
      source
      popularity
      favourites
      meanScore
      startDate { year month day }
      endDate { year month day }
      studios(isMain: true) { nodes { id name } }
      trailer { id site thumbnail }
      airingSchedule(notYetAired: true, perPage: 5) { nodes { episode airingAt } }
      recommendations(perPage: 6, sort: RATING_DESC) {
        nodes { mediaRecommendation { ...MediaCard } }
      }
    }
  }
  ${MEDIA_CARD_FRAGMENT}
`;

// ---------------------------------------------------------------------------
// Core request
// ---------------------------------------------------------------------------

interface RequestOptions {
  revalidate?: number | false;
  tags?: string[];
  signal?: AbortSignal;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function anilistRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
  { revalidate = ANILIST_REVALIDATE, tags = ["anilist"], signal }: RequestOptions = {},
  attempt = 0,
): Promise<T> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal,
    // Ignored in the browser; drives the Data Cache on the server.
    next: { revalidate, tags },
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "60");
    // Retry once if the wait is short; otherwise surface a typed error.
    if (attempt === 0 && retryAfter <= 5) {
      await sleep(retryAfter * 1000);
      return anilistRequest<T>(query, variables, { revalidate, tags, signal }, attempt + 1);
    }
    throw new AniListError("AniList rate limit reached. Please try again shortly.", 429, retryAfter);
  }

  const json = (await res.json().catch(() => null)) as
    | { data?: T; errors?: { message: string; status?: number }[] }
    | null;

  if (!res.ok || !json || json.errors?.length) {
    const msg = json?.errors?.[0]?.message ?? `AniList request failed (${res.status})`;
    throw new AniListError(msg, json?.errors?.[0]?.status ?? res.status);
  }

  return json.data as T;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getCurrentSeason(date = new Date()): { season: MediaSeason; year: number } {
  const m = date.getMonth();
  const season: MediaSeason = m < 3 ? "WINTER" : m < 6 ? "SPRING" : m < 9 ? "SUMMER" : "FALL";
  return { season, year: date.getFullYear() };
}

export async function searchAnime(
  query: string,
  page = 1,
  perPage = 10,
  opts?: RequestOptions,
): Promise<PagedMedia> {
  const data = await anilistRequest<{ Page: PagedMedia }>(
    SEARCH_QUERY,
    { query: query.trim() || undefined, page, perPage },
    opts,
  );
  return data.Page;
}

export async function getTrendingAnime(page = 1, perPage = 20): Promise<PagedMedia> {
  const data = await anilistRequest<{ Page: PagedMedia }>(LIST_QUERY, {
    page,
    perPage,
    sort: ["TRENDING_DESC", "POPULARITY_DESC"],
  });
  return data.Page;
}

export async function getSeasonalAnime(
  page = 1,
  perPage = 20,
  { season, year } = getCurrentSeason(),
): Promise<PagedMedia> {
  const data = await anilistRequest<{ Page: PagedMedia }>(LIST_QUERY, {
    page,
    perPage,
    season,
    seasonYear: year,
    sort: ["POPULARITY_DESC"],
  });
  return data.Page;
}

export async function getTopRatedAnime(page = 1, perPage = 20): Promise<PagedMedia> {
  const data = await anilistRequest<{ Page: PagedMedia }>(LIST_QUERY, {
    page,
    perPage,
    sort: ["SCORE_DESC"],
  });
  return data.Page;
}

export const BLEACH_FRANCHISE_IDS = [269, 116674, 159322, 169755, 8247, 1686];

export async function getBleachCollection(): Promise<AnimeCardData[]> {
  const data = await anilistRequest<{ Page: { media: AnimeCardData[] } }>(BLEACH_COLLECTION_QUERY, {
    ids: BLEACH_FRANCHISE_IDS,
  });
  return data.Page.media.sort((a, b) => BLEACH_FRANCHISE_IDS.indexOf(a.id) - BLEACH_FRANCHISE_IDS.indexOf(b.id));
}

export async function getAnimeDetails(id: number): Promise<AnimeDetails | null> {
  try {
    const data = await anilistRequest<{ Media: AnimeDetails | null }>(
      DETAILS_QUERY,
      { id },
      { tags: ["anilist", `anime-${id}`] },
    );
    return data.Media;
  } catch (err) {
    if (err instanceof AniListError && err.status === 404) return null;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Formatting utilities
// ---------------------------------------------------------------------------

export function getTitle(title: MediaTitle) {
  return title.english || title.romaji || title.native || "Untitled";
}

export function stripHtml(html: string | null | undefined) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function formatFuzzyDate(d: FuzzyDate | null | undefined) {
  if (!d?.year) return "TBA";
  if (!d.month) return String(d.year);
  return new Date(d.year, d.month - 1, d.day ?? 1).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    ...(d.day ? { day: "numeric" } : {}),
  });
}

export function formatEnum(v: string | null | undefined) {
  if (!v) return "—";
  if (v === "TV" || v === "OVA" || v === "ONA") return v;
  return v
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatCountdown(seconds: number) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
