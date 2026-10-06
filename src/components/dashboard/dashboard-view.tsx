"use client";

import { useMemo, useState, useTransition, useOptimistic } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  Plus,
  Minus,
  Star,
  Tv,
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { ListEntry, ListStatus } from "@/lib/database.types";
import { STATUS_LABELS } from "@/lib/database.types";
import { StatusBadge } from "@/components/status-badge";
import { TrackModal } from "@/components/tracking/track-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { incrementProgress } from "@/app/actions/tracking";
import { timeAgo, cn } from "@/lib/utils";

interface DashboardViewProps {
  initialEntries: ListEntry[];
  user: { id: string; email?: string } | null;
  username: string;
}

type TabKey = "ALL" | ListStatus;
type SortKey = "updated" | "score" | "title" | "progress";

export function DashboardView({ initialEntries, isAuthed = true, username }: DashboardViewProps & { isAuthed?: boolean }) {
  const [entries, setEntries] = useState<ListEntry[]>(initialEntries);
  const [activeTab, setActiveTab] = useState<TabKey>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("updated");
  const [, startTransition] = useTransition();

  // Optimistic list updates for rapid +1 actions
  const [optimisticEntries, setOptimisticEntries] = useOptimistic(
    entries,
    (state, { entryId, delta }: { entryId: string; delta: number }) => {
      return state.map((item) => {
        if (item.id !== entryId) return item;
        const total = item.total_episodes;
        const newProgress = Math.max(0, item.progress + delta);
        const clamped = total ? Math.min(newProgress, total) : newProgress;
        let newStatus = item.status;
        if (total && clamped === total && clamped > 0) {
          newStatus = "COMPLETED";
        } else if (item.status === "PLANNING" && clamped > 0) {
          newStatus = "CURRENT";
        }
        return {
          ...item,
          progress: clamped,
          status: newStatus,
          updated_at: new Date().toISOString(),
        };
      });
    },
  );

  const handleIncrement = (entry: ListEntry, delta: number) => {
    const total = entry.total_episodes;
    if (delta > 0 && total && entry.progress >= total) return;
    if (delta < 0 && entry.progress <= 0) return;

    startTransition(async () => {
      setOptimisticEntries({ entryId: entry.id, delta });
      const res = await incrementProgress(entry.id, delta);
      if (res.ok) {
        setEntries((prev) => prev.map((e) => (e.id === entry.id ? res.data : e)));
      }
    });
  };

  // Stats
  const stats = useMemo(() => {
    const total = optimisticEntries.length;
    const current = optimisticEntries.filter((e) => e.status === "CURRENT").length;
    const completed = optimisticEntries.filter((e) => e.status === "COMPLETED").length;
    const episodes = optimisticEntries.reduce((sum, e) => sum + (e.progress || 0), 0);
    const scored = optimisticEntries.filter((e) => e.score !== null && e.score > 0);
    const meanScore =
      scored.length > 0
        ? (scored.reduce((sum, e) => sum + (e.score || 0), 0) / scored.length).toFixed(1)
        : "—";

    return { total, current, completed, episodes, meanScore };
  }, [optimisticEntries]);

  // Filter & Sort
  const filteredEntries = useMemo(() => {
    let list = optimisticEntries;

    if (activeTab !== "ALL") {
      list = list.filter((e) => e.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      if (sortBy === "updated") {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (sortBy === "score") {
        return (b.score ?? 0) - (a.score ?? 0);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "progress") {
        return b.progress - a.progress;
      }
      return 0;
    });
  }, [optimisticEntries, activeTab, searchQuery, sortBy]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "ALL", label: "All Anime", count: optimisticEntries.length },
    { key: "CURRENT", label: STATUS_LABELS.CURRENT, count: optimisticEntries.filter((e) => e.status === "CURRENT").length },
    { key: "COMPLETED", label: STATUS_LABELS.COMPLETED, count: optimisticEntries.filter((e) => e.status === "COMPLETED").length },
    { key: "PLANNING", label: STATUS_LABELS.PLANNING, count: optimisticEntries.filter((e) => e.status === "PLANNING").length },
    { key: "PAUSED", label: STATUS_LABELS.PAUSED, count: optimisticEntries.filter((e) => e.status === "PAUSED").length },
    { key: "DROPPED", label: STATUS_LABELS.DROPPED, count: optimisticEntries.filter((e) => e.status === "DROPPED").length },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header & Stats Banner */}
      <div className="relative isolate overflow-hidden rounded-3xl glass-card p-6 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5" /> Anime Library
            </span>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
              {username}&apos;s List
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage your personal watchlist, track episode progress, and record your scores.
            </p>
          </div>

          <Link href="/" className="inline-flex shrink-0">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" /> Discover New Anime
            </Button>
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500 font-medium">
              <BookOpen className="h-3.5 w-3.5 text-accent" /> Total Entries
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500 font-medium">
              <PlayCircle className="h-3.5 w-3.5 text-st-current" /> Watching
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-st-current">{stats.current}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-st-completed" /> Completed
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-st-completed">{stats.completed}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500 font-medium">
              <Tv className="h-3.5 w-3.5 text-accent-2" /> Episodes Logged
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-white">{stats.episodes}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-zinc-500 font-medium">
              <Star className="h-3.5 w-3.5 text-st-paused" /> Mean Score
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-st-paused">{stats.meanScore}</p>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="space-y-4">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto pb-1 scrollbar-none gap-1.5 border-b border-white/5">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.03]",
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                    active ? "bg-accent/20 text-accent" : "bg-white/5 text-zinc-500",
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter bar: Search, Sort, View Toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter list by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent/50"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
              <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
              <label htmlFor="dashboard-sort" className="sr-only">Sort anime list</label>
              <select
                id="dashboard-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="bg-transparent text-sm text-zinc-200 outline-none cursor-pointer"
              >
                <option value="updated" className="bg-surface text-zinc-200">Recently Updated</option>
                <option value="score" className="bg-surface text-zinc-200">Highest Score</option>
                <option value="progress" className="bg-surface text-zinc-200">Most Watched</option>
                <option value="title" className="bg-surface text-zinc-200">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] p-0.5">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg transition",
                  viewMode === "grid" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white",
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Table view"
                onClick={() => setViewMode("table")}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg transition",
                  viewMode === "table" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white",
                )}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Entries Content */}
      {filteredEntries.length === 0 ? (
        <EmptyState
          icon={Tv}
          title={searchQuery ? "No matches found" : "Your list is empty"}
          description={
            searchQuery
              ? `No anime matching "${searchQuery}" in ${activeTab === "ALL" ? "your list" : STATUS_LABELS[activeTab as ListStatus]}.`
              : "Start discovering anime and add titles to track your watching progress!"
          }
          action={
            <Link href="/">
              <Button variant="primary" size="md">
                Browse Discover
              </Button>
            </Link>
          }
        />
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredEntries.map((entry) => {
            const total = entry.total_episodes;
            const pct = total ? Math.min(100, Math.round((entry.progress / total) * 100)) : 0;

            return (
              <div
                key={entry.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-2/10 hover:border-white/20"
              >
                {/* Poster Image */}
                <Link href={`/anime/${entry.media_id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-elevated block">
                  {entry.cover_image ? (
                    <Image
                      src={entry.cover_image}
                      alt={entry.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-zinc-600">
                      <Tv className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent opacity-80" />

                  <div className="absolute top-2 left-2">
                    <StatusBadge status={entry.status} className="bg-black/70 backdrop-blur shadow-md" />
                  </div>

                  {entry.score !== null && entry.score > 0 && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 backdrop-blur px-1.5 py-0.5 text-xs font-bold text-st-paused">
                      <Star className="h-3 w-3 fill-current" />
                      {entry.score.toFixed(1)}
                    </span>
                  )}

                  {/* Progress bar overlay on bottom of poster */}
                  {total && (
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/60">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          entry.status === "COMPLETED" ? "bg-st-completed" : "bg-white",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </Link>

                {/* Content details */}
                <div className="flex flex-1 flex-col justify-between p-3.5 space-y-3">
                  <div>
                    <Link
                      href={`/anime/${entry.media_id}`}
                      className="line-clamp-2 text-sm font-semibold text-white hover:text-accent transition leading-snug"
                    >
                      {entry.title}
                    </Link>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {timeAgo(entry.updated_at)}
                    </p>
                  </div>

                  {/* Inline Stepper Actions */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-1">
                      <button
                        type="button"
                        aria-label={`Decrease watched episode for ${entry.title}`}
                        disabled={entry.progress <= 0}
                        onClick={() => handleIncrement(entry, -1)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30 active:scale-95 transition"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <div className="text-center font-display text-xs font-bold text-white tabular-nums">
                        <span>{entry.progress}</span>
                        <span className="text-zinc-500 font-normal"> / {total ?? "?"}</span>
                      </div>

                      <button
                        type="button"
                        aria-label={`Increment watched episode for ${entry.title}`}
                        disabled={Boolean(total && entry.progress >= total)}
                        onClick={() => handleIncrement(entry, 1)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-accent hover:bg-accent/15 active:scale-95 transition disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-1">
                      <TrackModal
                        media={{
                          id: entry.media_id,
                          title: entry.title,
                          coverImage: entry.cover_image,
                          totalEpisodes: entry.total_episodes,
                        }}
                        entry={entry}
                        isAuthed={isAuthed}
                      />
                      <Link
                        href={`/anime/${entry.media_id}`}
                        className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                        title="View Full Page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-x-auto rounded-2xl glass-card">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Anime</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold">Progress</th>
                <th scope="col" className="px-4 py-3 font-semibold">Score</th>
                <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEntries.map((entry) => {
                const total = entry.total_episodes;
                return (
                  <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Title + Cover */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-elevated">
                          {entry.cover_image && (
                            <Image src={entry.cover_image} alt="" fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/anime/${entry.media_id}`}
                            className="font-medium text-white hover:text-accent transition line-clamp-1"
                          >
                            {entry.title}
                          </Link>
                          <span className="text-xs text-zinc-500">ID: {entry.media_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={entry.status} />
                    </td>

                    {/* Progress with inline +/- */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={`Decrease episode for ${entry.title}`}
                          disabled={entry.progress <= 0}
                          onClick={() => handleIncrement(entry, -1)}
                          className="grid h-6 w-6 place-items-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-30 active:scale-95"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-display font-semibold text-white tabular-nums">
                          {entry.progress}
                        </span>
                        <span className="text-xs text-zinc-500">/ {total ?? "?"}</span>
                        <button
                          type="button"
                          aria-label={`Increase episode for ${entry.title}`}
                          disabled={Boolean(total && entry.progress >= total)}
                          onClick={() => handleIncrement(entry, 1)}
                          className="grid h-6 w-6 place-items-center rounded-md text-accent hover:bg-accent/15 disabled:opacity-30 active:scale-95"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="px-4 py-3">
                      {entry.score !== null && entry.score > 0 ? (
                        <span className="flex items-center gap-1 font-semibold text-st-paused">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {entry.score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>

                    {/* Updated */}
                    <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {timeAgo(entry.updated_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <TrackModal
                          media={{
                            id: entry.media_id,
                            title: entry.title,
                            coverImage: entry.cover_image,
                            totalEpisodes: entry.total_episodes,
                          }}
                          entry={entry}
                          isAuthed={isAuthed}
                        />
                        <Link
                          href={`/anime/${entry.media_id}`}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                          title="View Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
