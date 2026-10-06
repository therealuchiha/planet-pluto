"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { AlertCircle, Check, Loader2, LogIn, PartyPopper, Plus, Trash2 } from "lucide-react";
import { removeListEntry, upsertListEntry } from "@/app/actions/tracking";
import type { ListEntry, ListStatus } from "@/lib/database.types";
import { applyTrackingPatch, type TrackingState } from "@/lib/tracking";
import { EpisodeStepper } from "./episode-stepper";
import { ScoreSelector } from "./score-selector";
import { StatusSelect } from "./status-select";
import { Button, buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TrackWidgetProps {
  media: {
    id: number;
    title: string;
    coverImage: string | null;
    totalEpisodes: number | null;
  };
  initialEntry: ListEntry | null;
  isAuthed: boolean;
}

type Patch = Partial<Pick<TrackingState, "status" | "progress" | "score">>;
type OptimisticState = (TrackingState & { tracked: true }) | { tracked: false };

function toState(entry: ListEntry | null, total: number | null): OptimisticState {
  if (!entry) return { tracked: false };
  return {
    tracked: true,
    status: entry.status,
    progress: entry.progress,
    score: entry.score,
    totalEpisodes: entry.total_episodes ?? total,
  };
}

/**
 * Quick-add tracking widget for the anime details page.
 *
 * Optimistic flow:
 *  1. `addOptimistic(patch)` instantly renders the next state, computed with the
 *     same `applyTrackingPatch` rules the server uses (auto-COMPLETED, etc.).
 *  2. The Server Action persists to Supabase and returns the authoritative row.
 *  3. On success we commit it as the new base; on failure React discards the
 *     optimistic state automatically and we surface the error.
 */
export function TrackWidget({ media, initialEntry, isAuthed }: TrackWidgetProps) {
  const [entry, setEntry] = useState<ListEntry | null>(initialEntry);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimistic, addOptimistic] = useOptimistic<OptimisticState, Patch | "remove">(
    toState(entry, media.totalEpisodes),
    (current, action) => {
      if (action === "remove") return { tracked: false };
      const base: TrackingState = current.tracked
        ? current
        : { status: "PLANNING", progress: 0, score: null, totalEpisodes: media.totalEpisodes };
      return { tracked: true, ...applyTrackingPatch(base, action) };
    },
  );

  const mutate = (patch: Patch) => {
    setError(null);
    startTransition(async () => {
      addOptimistic(patch);
      const res = await upsertListEntry({
        mediaId: media.id,
        title: media.title,
        coverImage: media.coverImage,
        totalEpisodes: media.totalEpisodes,
        ...patch,
      });
      if (res.ok) {
        setEntry(res.data);
        setSavedAt(Date.now());
      } else {
        setError(res.error);
      }
    });
  };

  const remove = () => {
    setError(null);
    startTransition(async () => {
      addOptimistic("remove");
      const res = await removeListEntry(media.id);
      if (res.ok) setEntry(null);
      else setError(res.error);
    });
  };

  if (!isAuthed) {
    return (
      <div className="glass-card space-y-4 rounded-3xl p-5">
        <h2 className="font-display text-lg font-semibold text-white">Track this anime</h2>
        <p className="text-sm text-zinc-400">Sign in to log episodes, rate, and build your list.</p>
        <Link
          href={`/login?next=/anime/${media.id}`}
          className={buttonClasses("primary", "md", "w-full")}
          id="track-login"
        >
          <LogIn className="h-4 w-4" /> Sign in to track
        </Link>
      </div>
    );
  }

  const total = media.totalEpisodes;
  const progress = optimistic.tracked ? optimistic.progress : 0;
  const pct = total ? Math.round((progress / total) * 100) : 0;
  const justCompleted = optimistic.tracked && optimistic.status === "COMPLETED";

  return (
    <section aria-labelledby="track-heading" className="glass-card space-y-5 rounded-3xl p-5">
      <div className="flex items-center justify-between">
        <h2 id="track-heading" className="font-display text-lg font-semibold text-white">
          {optimistic.tracked ? "Your progress" : "Track this anime"}
        </h2>
        <SaveIndicator pending={isPending} error={!!error} savedAt={savedAt} />
      </div>

      {!optimistic.tracked ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="primary" id="track-add-watching" onClick={() => mutate({ status: "CURRENT" })}>
            <Plus className="h-4 w-4" /> Watching
          </Button>
          <Button variant="outline" id="track-add-planning" onClick={() => mutate({ status: "PLANNING" })}>
            Plan to watch
          </Button>
        </div>
      ) : (
        <>
          <Field label="Status">
            <StatusSelect
              id="track-status"
              value={optimistic.status}
              onChange={(s: ListStatus) => mutate({ status: s })}
            />
          </Field>

          <Field label="Episodes">
            <EpisodeStepper
              id="track-episodes"
              value={progress}
              max={total}
              onChange={(p) => mutate({ progress: p })}
            />
            {total && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    justCompleted ? "bg-st-completed" : "bg-white",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
            {justCompleted && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-st-completed animate-fade-up">
                <PartyPopper className="h-3.5 w-3.5" /> Completed — nice!
              </p>
            )}
          </Field>

          <Field label="Score">
            <ScoreSelector
              id="track-score"
              value={optimistic.score}
              onChange={(s) => mutate({ score: s })}
            />
          </Field>

          <Button variant="danger" size="sm" className="w-full" onClick={remove} id="track-remove">
            <Trash2 className="h-3.5 w-3.5" /> Remove from list
          </Button>
        </>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-st-dropped/10 p-3 text-xs text-st-dropped">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      {children}
    </div>
  );
}

function SaveIndicator({ pending, error, savedAt }: { pending: boolean; error: boolean; savedAt: number | null }) {
  if (pending)
    return (
      <span className="flex items-center gap-1.5 text-xs text-zinc-400" aria-live="polite">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving
      </span>
    );
  if (error) return null;
  if (savedAt)
    return (
      <span key={savedAt} className="flex animate-fade-up items-center gap-1.5 text-xs text-st-completed" aria-live="polite">
        <Check className="h-3.5 w-3.5" /> Saved
      </span>
    );
  return null;
}
