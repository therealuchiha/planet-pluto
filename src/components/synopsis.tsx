"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Synopsis({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 450;

  return (
    <div>
      <p
        className={cn(
          "whitespace-pre-line leading-relaxed text-zinc-300",
          long && !expanded && "line-clamp-5",
        )}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          id="synopsis-toggle"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
        </button>
      )}
    </div>
  );
}
