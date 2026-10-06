import { LIST_STATUSES, type ListStatus } from "@/lib/database.types";

/**
 * Pure tracking rules shared by the client (optimistic updates) and the
 * server (authoritative validation in Server Actions). Keeping them in one
 * place guarantees the optimistic UI matches what gets persisted.
 */

export interface TrackingState {
  status: ListStatus;
  progress: number;
  score: number | null;
  totalEpisodes: number | null;
}

export function isListStatus(v: unknown): v is ListStatus {
  return typeof v === "string" && (LIST_STATUSES as readonly string[]).includes(v);
}

export function clampProgress(progress: number, total: number | null) {
  const p = Math.max(0, Math.floor(Number.isFinite(progress) ? progress : 0));
  return total && total > 0 ? Math.min(p, total) : p;
}

export function normalizeScore(score: number | null | undefined) {
  if (score === null || score === undefined || !Number.isFinite(score) || score <= 0) return null;
  return Math.round(Math.min(10, score) * 10) / 10;
}

/**
 * Apply a patch and derive implicit status transitions:
 * - progress reaches total        → COMPLETED
 * - status set to COMPLETED       → progress jumps to total
 * - progress > 0 while PLANNING   → CURRENT
 * - progress drops below total while COMPLETED → CURRENT
 */
export function applyTrackingPatch(
  prev: TrackingState,
  patch: Partial<Pick<TrackingState, "status" | "progress" | "score">>,
): TrackingState {
  const total = prev.totalEpisodes;
  let status = patch.status ?? prev.status;
  let progress = clampProgress(patch.progress ?? prev.progress, total);
  const score = patch.score !== undefined ? normalizeScore(patch.score) : prev.score;

  const statusChanged = patch.status !== undefined && patch.status !== prev.status;
  const progressChanged = patch.progress !== undefined && progress !== prev.progress;

  if (statusChanged && status === "COMPLETED" && total) {
    progress = total;
  } else if (progressChanged) {
    if (total && progress === total && progress > 0) status = "COMPLETED";
    else if (status === "PLANNING" && progress > 0) status = "CURRENT";
    else if (status === "COMPLETED" && total && progress < total) status = "CURRENT";
  }

  return { status, progress, score, totalEpisodes: total };
}
