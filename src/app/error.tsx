"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const rateLimited = /rate limit|429/i.test(error.message);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-st-dropped/30 bg-st-dropped/10">
        <AlertTriangle className="h-7 w-7 text-st-dropped" aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-white">
          {rateLimited ? "Slow down a little" : "Something went wrong"}
        </h1>
        <p className="text-sm text-zinc-400">
          {rateLimited
            ? "AniList's rate limit was reached. Give it a few seconds and try again."
            : "We couldn't load this page. It may be a temporary network issue."}
        </p>
      </div>
      <Button variant="primary" onClick={reset} id="error-retry">
        <RotateCcw className="h-4 w-4" /> Try again
      </Button>
    </div>
  );
}
