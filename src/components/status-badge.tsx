import { STATUS_LABELS, type ListStatus } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export const STATUS_STYLES: Record<ListStatus, { dot: string; badge: string; bar: string }> = {
  CURRENT: {
    dot: "bg-st-current",
    badge: "bg-st-current/15 text-st-current border-st-current/30",
    bar: "bg-st-current",
  },
  COMPLETED: {
    dot: "bg-st-completed",
    badge: "bg-st-completed/15 text-st-completed border-st-completed/30",
    bar: "bg-st-completed",
  },
  PAUSED: {
    dot: "bg-st-paused",
    badge: "bg-st-paused/15 text-st-paused border-st-paused/30",
    bar: "bg-st-paused",
  },
  DROPPED: {
    dot: "bg-st-dropped",
    badge: "bg-st-dropped/15 text-st-dropped border-st-dropped/30",
    bar: "bg-st-dropped",
  },
  PLANNING: {
    dot: "bg-st-planning",
    badge: "bg-st-planning/15 text-st-planning border-st-planning/30",
    bar: "bg-st-planning",
  },
};

export function StatusBadge({ status, className }: { status: ListStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        STATUS_STYLES[status].badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_STYLES[status].dot)} />
      {STATUS_LABELS[status]}
    </span>
  );
}
