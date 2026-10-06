"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { LIST_STATUSES, STATUS_LABELS, type ListStatus } from "@/lib/database.types";
import { STATUS_STYLES } from "@/components/status-badge";
import { cn } from "@/lib/utils";

export function StatusSelect({
  value,
  onChange,
  disabled,
  placeholder = "Add to list",
  size = "md",
  id = "status-select",
}: {
  value: ListStatus | null;
  onChange: (s: ListStatus) => void;
  disabled?: boolean;
  placeholder?: string;
  size?: "sm" | "md";
  id?: string;
}) {
  return (
    <Select.Root value={value ?? undefined} onValueChange={(v) => onChange(v as ListStatus)} disabled={disabled}>
      <Select.Trigger
        id={id}
        aria-label="List status"
        className={cn(
          "group flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-left font-medium text-white outline-none transition hover:border-white/20 focus-visible:border-accent/60 data-[placeholder]:text-zinc-400",
          size === "sm" ? "h-8 text-xs" : "h-11 text-sm",
        )}
      >
        <span className="flex items-center gap-2">
          {value && <span className={cn("h-2 w-2 rounded-full", STATUS_STYLES[value].dot)} />}
          <Select.Value placeholder={placeholder} />
        </span>
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform group-data-[state=open]:rotate-180" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="glass-card z-[70] min-w-[var(--radix-select-trigger-width)] animate-fade-up overflow-hidden rounded-xl p-1 shadow-2xl shadow-black/60"
        >
          <Select.Viewport>
            {LIST_STATUSES.map((s) => (
              <Select.Item
                key={s}
                value={s}
                className="relative flex cursor-pointer select-none items-center gap-2.5 rounded-lg py-2 pl-3 pr-8 text-sm text-zinc-300 outline-none data-[highlighted]:bg-white/[0.07] data-[highlighted]:text-white data-[state=checked]:text-white"
              >
                <span className={cn("h-2 w-2 rounded-full", STATUS_STYLES[s].dot)} />
                <Select.ItemText>{STATUS_LABELS[s]}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-2.5">
                  <Check className="h-4 w-4 text-accent" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
