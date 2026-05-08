"use client";

import { ChainNode, Scripture } from "@/lib/types";
import { getFullReference } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChainViewProps {
  nodes: (ChainNode & { scripture?: Scripture })[];
  currentSlug: string;
}

export function ChainView({ nodes, currentSlug }: ChainViewProps) {
  const reversedNodes = [...nodes].reverse();

  return (
    <div className="space-y-0">
      {reversedNodes.map((node, index) => {
        const isCurrent = node.slug === currentSlug;
        const isRoot = index === 0;
        const scripture = node.scripture;

        if (!scripture) return null;

        const reference = getFullReference(
          scripture.book,
          scripture.chapter,
          scripture.verse_start,
          scripture.verse_end
        );

        return (
          <div key={node.id} className="relative">
            {index > 0 && (
              <div className="absolute left-1/2 -top-3 w-0.5 h-6 bg-gradient-to-b from-gold to-gold-light transform -translate-x-1/2 z-10" />
            )}
            <div
              className={cn(
                "relative bg-bg-surface rounded-lg p-5 border",
                isCurrent
                  ? "border-gold animate-pulse-glow"
                  : "border-gold/20"
              )}
            >
              {isRoot && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-vine" />
              )}
              {isCurrent && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gold text-bg-deep text-xs font-ui rounded-full">
                  You are here
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-gold-light text-sm font-ui">
                  {node.depth}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-scripture text-cream text-base leading-relaxed line-clamp-3">
                    {scripture.text}
                  </p>
                  <div className="mt-2 text-xs uppercase tracking-wider text-gold-light font-ui">
                    {reference}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}