"use client";

import { useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Score input: a 0–10 slider (0.5 steps) plus quick 1–10 pills.
 * Fires `onChange` only on commit (pointer up / pill click) to limit writes.
 */
export function ScoreSelector({
  value,
  onChange,
  disabled,
  id = "score",
}: {
  value: number | null;
  onChange: (next: number | null) => void;
  disabled?: boolean;
  id?: string;
}) {
  const [live, setLive] = useState<number | null>(null);
  const display = live ?? value ?? 0;

  const tone =
    display >= 8 ? "text-st-completed" : display >= 6 ? "text-st-paused" : display > 0 ? "text-st-dropped" : "text-zinc-500";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={cn("flex items-baseline gap-1 font-display text-2xl font-bold tabular-nums", tone)}>
          <Star className="h-5 w-5 self-center fill-current" aria-hidden />
          {display > 0 ? display.toFixed(1) : "—"}
          <span className="text-sm font-medium text-zinc-500">/ 10</span>
        </span>
        {value !== null && (
          <button
            type="button"
            id={`${id}-clear`}
            onClick={() => onChange(null)}
            disabled={disabled}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <Slider.Root
        id={`${id}-slider`}
        className="relative flex h-5 touch-none select-none items-center"
        min={0}
        max={10}
        step={0.5}
        value={[display]}
        disabled={disabled}
        onValueChange={([v]) => setLive(v)}
        onValueCommit={([v]) => {
          setLive(null);
          onChange(v > 0 ? v : null);
        }}
        aria-label="Score"
      >
        <Slider.Track className="relative h-2 grow overflow-hidden rounded-full bg-white/10">
          <Slider.Range className="bg-white absolute h-full rounded-full" />
        </Slider.Track>
        <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-white bg-white shadow-md outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-white/50" />
      </Slider.Root>

      <div className="grid grid-cols-10 gap-1" role="radiogroup" aria-label="Quick score">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const selected = Math.round(value ?? 0) === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              id={`${id}-pill-${n}`}
              disabled={disabled}
              onClick={() => onChange(n)}
              className={cn(
                "h-7 rounded-md text-xs font-bold tabular-nums transition-all",
                selected
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
