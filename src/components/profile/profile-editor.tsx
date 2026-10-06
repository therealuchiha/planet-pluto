"use client";

import { useActionState } from "react";
import Image from "next/image";
import { User, Link as LinkIcon, Loader2, AlertCircle, CheckCircle2, Save } from "lucide-react";
import { updateProfile, type AuthState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

interface ProfileEditorProps {
  initialUsername: string;
  initialAvatarUrl: string | null;
  email: string;
}

export function ProfileEditor({ initialUsername, initialAvatarUrl, email }: ProfileEditorProps) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-4 pb-4 border-b border-white/5">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-elevated ring-2 ring-white/10">
          {initialAvatarUrl ? (
            <Image
              src={initialAvatarUrl}
              alt={initialUsername}
              fill
              className="object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-white text-xl font-black uppercase text-zinc-950">
              {initialUsername[0] ?? "U"}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">@{initialUsername}</h2>
          <p className="text-xs text-zinc-400">{email}</p>
        </div>
      </div>

      {state?.error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-2xl bg-st-dropped/10 border border-st-dropped/20 p-3.5 text-xs text-st-dropped">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.message && (
        <div role="status" className="flex items-start gap-2.5 rounded-2xl bg-st-completed/10 border border-st-completed/20 p-3.5 text-xs text-st-completed">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="profile-username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Username
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="profile-username"
              name="username"
              type="text"
              defaultValue={initialUsername}
              required
              minLength={3}
              maxLength={24}
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent/50 focus:bg-white/[0.06] transition"
            />
          </div>
          <p className="text-[11px] text-zinc-500">3–24 characters: letters, numbers, and underscores.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="profile-avatar" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Avatar URL
          </label>
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              id="profile-avatar"
              name="avatar_url"
              type="url"
              defaultValue={initialAvatarUrl ?? ""}
              placeholder="https://images.example.com/avatar.jpg"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent/50 focus:bg-white/[0.06] transition"
            />
          </div>
          <p className="text-[11px] text-zinc-500">Direct HTTPS URL to an avatar image.</p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isPending}
          className="mt-2"
          id="profile-save-btn"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" /> Save Profile Changes
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
