import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/server";
import { SearchBar } from "@/components/search-bar";
import { NavLinks } from "@/components/nav-links";
import { UserMenu } from "@/components/user-menu";
import { buttonClasses } from "@/components/ui/button";

export async function Navbar() {
  const { user, profile } = await getCurrentProfile();

  return (
    <header className="glass sticky top-0 z-50 border-b">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="PLANET PLUTO home">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-zinc-950 font-black text-sm tracking-tighter border border-white transition-transform group-hover:scale-105">
            P
          </span>
          <span className="font-display text-lg font-black tracking-wider uppercase text-white">
            PLANET <span className="font-semibold text-zinc-400">PLUTO</span>
          </span>
        </Link>

        <NavLinks isAuthed={Boolean(user)} />

        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          <SearchBar className="hidden max-w-md flex-1 md:block" />
          {user ? (
            <UserMenu
              username={profile?.username ?? user.email?.split("@")[0] ?? "you"}
              email={user.email ?? ""}
              avatarUrl={profile?.avatar_url ?? null}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className={buttonClasses("ghost", "sm")}>
                Log in
              </Link>
              <Link href="/signup" className={buttonClasses("primary", "sm")}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </nav>
      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
