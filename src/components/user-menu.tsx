"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LayoutList, LogOut, User } from "lucide-react";
import { signOut } from "@/app/actions/auth";

export function UserMenu({
  username,
  email,
  avatarUrl,
}: {
  username: string;
  email: string;
  avatarUrl: string | null;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        id="user-menu-trigger"
        aria-label="Open user menu"
        className="group relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full ring-2 ring-white/10 transition hover:ring-accent/60"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-provided host
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="bg-white grid h-full w-full place-items-center text-sm font-bold uppercase text-zinc-950">
            {username[0]}
          </span>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="glass-card z-[60] w-60 animate-fade-up rounded-2xl p-1.5 shadow-2xl shadow-black/50"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-white">@{username}</p>
            <p className="truncate text-xs text-zinc-400">{email}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-white/5" />
          <MenuLink href="/dashboard" icon={<LayoutList className="h-4 w-4" />}>
            My List
          </MenuLink>
          <MenuLink href="/profile" icon={<User className="h-4 w-4" />}>
            Profile
          </MenuLink>
          <DropdownMenu.Separator className="my-1 h-px bg-white/5" />
          <form action={signOut}>
            <DropdownMenu.Item asChild>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-300 outline-none data-[highlighted]:bg-st-dropped/10 data-[highlighted]:text-st-dropped"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function MenuLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        href={href}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-300 outline-none data-[highlighted]:bg-white/5 data-[highlighted]:text-white"
      >
        {icon}
        {children}
      </Link>
    </DropdownMenu.Item>
  );
}
