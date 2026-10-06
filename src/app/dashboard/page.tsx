import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { ListEntry } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "My List · AniTrack",
  description: "View and manage your anime watchlist and episode progress.",
};

// Sample mock entries displayed when Supabase credentials haven't been provided yet,
// so the UI can be experienced immediately out-of-the-box in local dev mode.
const DEMO_ENTRIES: ListEntry[] = [
  {
    id: "demo-1",
    user_id: "demo-user",
    media_id: 16498,
    title: "Attack on Titan",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-m5ZMNScFlPpW.png",
    total_episodes: 25,
    status: "COMPLETED",
    progress: 25,
    score: 9.5,
    notes: "Masterpiece pacing and world-building.",
    updated_at: new Date(Date.now() - 3600_000 * 4).toISOString(),
  },
  {
    id: "demo-2",
    user_id: "demo-user",
    media_id: 153518,
    title: "JUJUTSU KAISEN Season 2",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx153518-e48f74a81ba0.jpg",
    total_episodes: 23,
    status: "CURRENT",
    progress: 18,
    score: 9.0,
    notes: "Shibuya Incident arc is intense.",
    updated_at: new Date(Date.now() - 3600_000 * 12).toISOString(),
  },
  {
    id: "demo-3",
    user_id: "demo-user",
    media_id: 154587,
    title: "Frieren: Beyond Journey's End",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n1HJZ2s4j5Pz.jpg",
    total_episodes: 28,
    status: "COMPLETED",
    progress: 28,
    score: 10.0,
    notes: "Peak fantasy storytelling and music.",
    updated_at: new Date(Date.now() - 3600_000 * 24 * 2).toISOString(),
  },
  {
    id: "demo-4",
    user_id: "demo-user",
    media_id: 171018,
    title: "Solo Leveling",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171018-8m5p3W4s4j5P.jpg",
    total_episodes: 12,
    status: "PLANNING",
    progress: 0,
    score: null,
    notes: null,
    updated_at: new Date(Date.now() - 3600_000 * 24 * 5).toISOString(),
  },
  {
    id: "demo-5",
    user_id: "demo-user",
    media_id: 21,
    title: "ONE PIECE",
    cover_image: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-Y3N1s4j5Pz.jpg",
    total_episodes: null,
    status: "CURRENT",
    progress: 1105,
    score: 9.8,
    notes: "Egghead Island arc is fire.",
    updated_at: new Date(Date.now() - 3600_000 * 2).toISOString(),
  },
];

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <p className="font-semibold text-amber-100">Local Preview Mode Active</p>
          <p className="mt-1 text-xs text-amber-300/80">
            Supabase environment variables (<code className="rounded bg-black/30 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> &{" "}
            <code className="rounded bg-black/30 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) are not configured yet. Showing interactive demo entries below.
          </p>
        </div>
        <DashboardView
          initialEntries={DEMO_ENTRIES}
          user={{ id: "demo-user", email: "guest@anitrack.local" }}
          username="Guest Otaku"
          isAuthed={true}
        />
      </div>
    );
  }

  const { user, profile } = await getCurrentProfile();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const supabase = await createClient();
  const { data: entries, error } = await supabase
    .from("user_anime_list")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to load user anime list:", error);
  }

  const username = profile?.username ?? user.email?.split("@")[0] ?? "User";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <DashboardView
        initialEntries={entries ?? []}
        user={user}
        username={username}
        isAuthed={true}
      />
    </div>
  );
}
