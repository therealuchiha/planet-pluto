"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ListEntry, ListStatus } from "@/lib/database.types";
import { applyTrackingPatch, clampProgress, isListStatus, normalizeScore } from "@/lib/tracking";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

export interface UpsertEntryInput {
  mediaId: number;
  title: string;
  coverImage: string | null;
  totalEpisodes: number | null;
  status?: ListStatus;
  progress?: number;
  score?: number | null;
  notes?: string | null;
}

async function requireUser() {
  // createClient() awaits cookies() internally (async in Next 15+/16).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function revalidateTracking(mediaId: number) {
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath(`/anime/${mediaId}`);
}

/**
 * Create or update a list entry for the current user.
 * The existing row (if any) is read first so implicit transitions
 * (auto-COMPLETED etc.) are computed against authoritative state.
 */
export async function upsertListEntry(input: UpsertEntryInput): Promise<ActionResult<ListEntry>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "You must be signed in to track anime." };

  if (!Number.isInteger(input.mediaId) || input.mediaId <= 0) {
    return { ok: false, error: "Invalid media id." };
  }
  if (input.status !== undefined && !isListStatus(input.status)) {
    return { ok: false, error: "Invalid status." };
  }

  const total =
    input.totalEpisodes && input.totalEpisodes > 0 ? Math.floor(input.totalEpisodes) : null;

  const { data: existing, error: readError } = await supabase
    .from("user_anime_list")
    .select("*")
    .eq("user_id", user.id)
    .eq("media_id", input.mediaId)
    .maybeSingle();

  if (readError) return { ok: false, error: readError.message };

  const next = applyTrackingPatch(
    {
      status: existing?.status ?? "PLANNING",
      progress: existing?.progress ?? 0,
      score: existing?.score ?? null,
      totalEpisodes: total ?? existing?.total_episodes ?? null,
    },
    {
      status: input.status,
      progress: input.progress !== undefined ? clampProgress(input.progress, total) : undefined,
      score: input.score !== undefined ? normalizeScore(input.score) : undefined,
    },
  );

  const { data, error } = await supabase
    .from("user_anime_list")
    .upsert(
      {
        user_id: user.id,
        media_id: input.mediaId,
        title: input.title.slice(0, 500),
        cover_image: input.coverImage,
        total_episodes: next.totalEpisodes,
        status: next.status,
        progress: next.progress,
        score: next.score,
        notes: input.notes !== undefined ? input.notes?.slice(0, 2000) || null : existing?.notes ?? null,
      },
      { onConflict: "user_id,media_id" },
    )
    .select()
    .single();

  if (error) return { ok: false, error: error.message };

  revalidateTracking(input.mediaId);
  return { ok: true, data };
}

/** Inline "+1" (or any delta) from the dashboard. */
export async function incrementProgress(
  entryId: string,
  delta = 1,
): Promise<ActionResult<ListEntry>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { data: entry, error: readError } = await supabase
    .from("user_anime_list")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .single();

  if (readError || !entry) return { ok: false, error: readError?.message ?? "Entry not found." };

  const next = applyTrackingPatch(
    {
      status: entry.status,
      progress: entry.progress,
      score: entry.score,
      totalEpisodes: entry.total_episodes,
    },
    { progress: entry.progress + delta },
  );

  const { data, error } = await supabase
    .from("user_anime_list")
    .update({ progress: next.progress, status: next.status })
    .eq("id", entryId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { ok: false, error: error.message };

  revalidateTracking(entry.media_id);
  return { ok: true, data };
}

/** Patch status / score / progress on an existing entry by id. */
export async function updateListEntry(
  entryId: string,
  patch: { status?: ListStatus; progress?: number; score?: number | null },
): Promise<ActionResult<ListEntry>> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };
  if (patch.status !== undefined && !isListStatus(patch.status)) {
    return { ok: false, error: "Invalid status." };
  }

  const { data: entry, error: readError } = await supabase
    .from("user_anime_list")
    .select("*")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .single();
  if (readError || !entry) return { ok: false, error: readError?.message ?? "Entry not found." };

  const next = applyTrackingPatch(
    {
      status: entry.status,
      progress: entry.progress,
      score: entry.score,
      totalEpisodes: entry.total_episodes,
    },
    patch,
  );

  const { data, error } = await supabase
    .from("user_anime_list")
    .update({ status: next.status, progress: next.progress, score: next.score })
    .eq("id", entryId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  revalidateTracking(entry.media_id);
  return { ok: true, data };
}

export async function removeListEntry(mediaId: number): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const { error } = await supabase
    .from("user_anime_list")
    .delete()
    .eq("user_id", user.id)
    .eq("media_id", mediaId);

  if (error) return { ok: false, error: error.message };
  revalidateTracking(mediaId);
  return { ok: true, data: null };
}
