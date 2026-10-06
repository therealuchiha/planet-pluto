"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EpisodeStepperProps {
  value: number;
  /** Total episodes; `null` for ongoing/unknown (no upper bound, no Max button). */
  max: number | null;
  onChange: (next: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  showMax?: boolean;
  id?: string;
  className?: string;
}

/**
 * Interactive episode stepper: [-] [ input / total ] [+] [Max]
 * The input keeps a local draft and commits on blur / Enter so typing "12"
 * doesn't fire two updates ("1" then "12").
 */
export function EpisodeStepper({
  value,
  max,
  onChange,
  disabled,
  size = "md",
  showMax = true,
  id = "episode-stepper",
  className,
}: EpisodeStepperProps) {
  const [draft, setDraft] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);
  const [bump, setBump] = useState(0);

  // Sync the draft when the controlled value changes externally
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(String(value));
  }

  const clamp = (n: number) => {
    const v = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0));
    return max ? Math.min(v, max) : v;
  };

  const commit = (n: number) => {
    const next = clamp(n);
    setDraft(String(next));
    if (next !== value) {
      setBump((b) => b + 1);
      onChange(next);
    }
  };

  const atMin = value <= 0;
  const atMax = max !== null && value >= max;
  const h = size === "sm" ? "h-8" : "h-11";
  const btn = cn(
    "grid shrink-0 place-items-center rounded-lg text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-30",
    size === "sm" ? "h-6 w-6" : "h-9 w-9",
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        role="group"
        aria-label="Episode progress"
        className={cn(
          "flex flex-1 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] px-1 transition-colors focus-within:border-accent/50",
          h,
        )}
      >
        <button
          type="button"
          id={`${id}-decrement`}
          aria-label="Decrease episode"
          className={btn}
          disabled={disabled || atMin}
          onClick={() => commit(value - 1)}
        >
          <Minus className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>

        <label className="flex flex-1 items-baseline justify-center gap-1 tabular-nums">
          <span className="sr-only">Episodes watched</span>
          <input
            id={`${id}-input`}
            type="number"
            inputMode="numeric"
            min={0}
            max={max ?? undefined}
            value={draft}
            disabled={disabled}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commit(Number(draft))}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "ArrowUp") {
                e.preventDefault();
                commit(value + 1);
              }
              if (e.key === "ArrowDown") {
                e.preventDefault();
                commit(value - 1);
              }
            }}
            style={{ width: `${Math.max(1, draft.length) + 0.5}ch` }}
            className={cn(
              "bg-transparent text-right font-display font-bold text-white outline-none",
              size === "sm" ? "text-sm" : "text-lg",
            )}
          />
          <span
            key={bump}
            className={cn("text-zinc-500", bump > 0 && "animate-pop", size === "sm" ? "text-xs" : "text-sm")}
          >
            / {max ?? "?"}
          </span>
        </label>

        <button
          type="button"
          id={`${id}-increment`}
          aria-label="Increase episode"
          className={cn(btn, !atMax && "text-accent hover:bg-accent/15 hover:text-accent")}
          disabled={disabled || atMax}
          onClick={() => commit(value + 1)}
        >
          <Plus className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </button>
      </div>

      {showMax && max !== null && (
        <button
          type="button"
          id={`${id}-max`}
          onClick={() => commit(max)}
          disabled={disabled || atMax}
          className={cn(
            "shrink-0 rounded-xl border border-white/10 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-300 transition hover:border-st-completed/50 hover:bg-st-completed/10 hover:text-st-completed disabled:opacity-30",
            h,
          )}
        >
          Max
        </button>
      )}
    </div>
  );
}
