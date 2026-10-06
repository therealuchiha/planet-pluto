"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavLinks({ isAuthed }: { isAuthed: boolean }) {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Discover", icon: Compass, show: true },
    { href: "/dashboard", label: "My List", icon: LayoutList, show: isAuthed },
  ];

  return (
    <ul className="ml-2 hidden items-center gap-1 sm:flex">
      {links
        .filter((l) => l.show)
        .map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "text-white" : "text-zinc-400 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
                {active && (
                  <span className="bg-white absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full" />
                )}
              </Link>
            </li>
          );
        })}
    </ul>
  );
}
