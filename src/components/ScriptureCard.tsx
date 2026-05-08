"use client";

import { getFullReference } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ScriptureCardProps {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number | null;
  text: string;
  size?: "sm" | "lg";
  className?: string;
}

export function ScriptureCard({
  book,
  chapter,
  verseStart,
  verseEnd,
  text,
  size = "lg",
  className,
}: ScriptureCardProps) {
  const reference = getFullReference(book, chapter, verseStart, verseEnd);

  return (
    <div
      className={cn(
        "relative bg-bg-surface rounded-lg p-6",
        "border border-gold/20",
        "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
        size === "lg" ? "p-8" : "p-4",
        className
      )}
    >
      {size === "lg" && (
        <span className="absolute top-4 left-4 text-6xl font-scripture text-gold/50">
          "
        </span>
      )}
      <p
        className={cn(
          "font-scripture text-cream leading-relaxed",
          size === "lg" ? "text-xl md:text-2xl" : "text-base"
        )}
      >
        {text}
      </p>
      <div
        className={cn(
          "mt-4 font-ui text-sm uppercase tracking-wider",
          size === "lg" ? "text-gold-light" : "text-cream-muted"
        )}
      >
        {reference}
      </div>
    </div>
  );
}