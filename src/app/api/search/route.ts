import { NextResponse, type NextRequest } from "next/server";
import { AniListError, searchAnime } from "@/lib/anilist";

/**
 * GET /api/search?q=naruto&page=1&perPage=8
 *
 * Server-side proxy for AniList search. Results are stored in the Next.js Data
 * Cache (revalidate 3600) so popular queries across all users only cost one
 * AniList request per hour — protecting the 90 req/min budget.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const perPage = Math.min(25, Math.max(1, Number(sp.get("perPage")) || 8));

  if (q.length < 2) {
    return NextResponse.json({ media: [], pageInfo: null });
  }

  try {
    const data = await searchAnime(q.toLowerCase(), page, perPage);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (err) {
    if (err instanceof AniListError && err.status === 429) {
      return NextResponse.json(
        { error: err.message },
        { status: 429, headers: { "Retry-After": String(err.retryAfter ?? 60) } },
      );
    }
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
