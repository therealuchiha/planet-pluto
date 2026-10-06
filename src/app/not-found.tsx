import Link from "next/link";
import { Ghost } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
      <Ghost className="h-14 w-14 text-zinc-400" aria-hidden />
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wider text-white">
        404 — Lost in the Dangai
      </h1>
      <p className="text-sm text-zinc-400">The boundary between worlds collapsed. This page does not exist.</p>
      <Link href="/" className={buttonClasses("primary")} id="notfound-home">
        Back to Planet Pluto
      </Link>
    </div>
  );
}
