import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { User, BookOpen, CheckCircle2, PlayCircle, Star, Tv, Calendar } from "lucide-react";
import { createClient, getCurrentProfile } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const metadata: Metadata = {
  title: "Profile · AniTrack",
  description: "View your user profile and anime tracking stats.",
};

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8 animate-fade-up">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <p className="font-semibold text-amber-100">Local Preview Mode Active</p>
          <p className="mt-1 text-xs text-amber-300/80">
            Supabase is not configured yet. Profile changes cannot be persisted until Supabase is connected.
          </p>
        </div>

        <ProfileEditor
          initialUsername="guest_otaku"
          initialAvatarUrl={null}
          email="guest@anitrack.local"
        />
      </div>
    );
  }

  const { user, profile } = await getCurrentProfile();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("user_anime_list")
    .select("status, progress, score")
    .eq("user_id", user.id);

  const list = entries ?? [];
  const total = list.length;
  const current = list.filter((e) => e.status === "CURRENT").length;
  const completed = list.filter((e) => e.status === "COMPLETED").length;
  const planning = list.filter((e) => e.status === "PLANNING").length;
  const paused = list.filter((e) => e.status === "PAUSED").length;
  const dropped = list.filter((e) => e.status === "DROPPED").length;
  const episodes = list.reduce((sum, e) => sum + (e.progress || 0), 0);
  const scored = list.filter((e) => e.score !== null && e.score > 0);
  const meanScore = scored.length > 0 ? (scored.reduce((sum, e) => sum + (e.score || 0), 0) / scored.length).toFixed(1) : "—";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8 animate-fade-up">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">Account & Profile</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your public username, avatar, and review your anime statistics.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Editor */}
        <ProfileEditor
          initialUsername={profile?.username ?? user.email?.split("@")[0] ?? "user"}
          initialAvatarUrl={profile?.avatar_url ?? null}
          email={user.email ?? ""}
        />

        {/* Anime Stats Summary */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-accent" /> Tracking Statistics
            </h2>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <Calendar className="h-3 w-3" /> Member since {memberSince}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <BookOpen className="h-3.5 w-3.5 text-accent" /> Total Anime
              </span>
              <p className="mt-1 font-display text-xl font-bold text-white">{total}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Tv className="h-3.5 w-3.5 text-accent-2" /> Episodes
              </span>
              <p className="mt-1 font-display text-xl font-bold text-white">{episodes}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-st-completed" /> Completed
              </span>
              <p className="mt-1 font-display text-xl font-bold text-st-completed">{completed}</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Star className="h-3.5 w-3.5 text-st-paused" /> Mean Score
              </span>
              <p className="mt-1 font-display text-xl font-bold text-st-paused">{meanScore}</p>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">List Distribution</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <PlayCircle className="h-3.5 w-3.5 text-st-current" /> Watching
                </span>
                <span className="font-medium text-white">{current}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-st-completed" /> Completed
                </span>
                <span className="font-medium text-white">{completed}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="text-st-planning">● Planning</span>
                <span className="font-medium text-white">{planning}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="text-st-paused">● Paused</span>
                <span className="font-medium text-white">{paused}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="text-st-dropped">● Dropped</span>
                <span className="font-medium text-white">{dropped}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
