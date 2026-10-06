import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "glass-card flex flex-col items-center justify-center gap-4 rounded-3xl px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative">
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-elevated">
          <Icon className="h-7 w-7 text-white" aria-hidden />
        </div>
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-zinc-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
