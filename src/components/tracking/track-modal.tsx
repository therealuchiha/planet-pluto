"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, SlidersHorizontal, Edit3 } from "lucide-react";
import type { ListEntry } from "@/lib/database.types";
import { TrackWidget } from "./track-widget";
import { Button } from "@/components/ui/button";

export interface TrackModalProps {
  media: {
    id: number;
    title: string;
    coverImage: string | null;
    totalEpisodes: number | null;
  };
  entry: ListEntry | null;
  isAuthed: boolean;
  trigger?: React.ReactNode;
}

export function TrackModal({ media, entry, isAuthed, trigger }: TrackModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
            {entry ? <Edit3 className="h-3.5 w-3.5" /> : <SlidersHorizontal className="h-3.5 w-3.5" />}
            {entry ? "Edit Tracking" : "Track"}
          </Button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm animate-fade-up" />
        <Dialog.Content className="glass-card fixed left-1/2 top-1/2 z-[90] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6 shadow-2xl shadow-black/80 animate-fade-up outline-none focus:outline-none">
          <div className="flex items-center justify-between pb-3">
            <Dialog.Title className="truncate font-display text-lg font-bold text-white pr-4">
              {media.title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close dialog"
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-2">
            <TrackWidget
              media={media}
              initialEntry={entry}
              isAuthed={isAuthed}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
