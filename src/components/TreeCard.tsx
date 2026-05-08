"use client";

import Link from "next/link";
import { Tree } from "@/lib/types";
import { formatClosingTime, cn } from "@/lib/utils";

interface TreeCardProps {
  tree: Tree & { nodeCount?: number };
}

export function TreeCard({ tree }: TreeCardProps) {
  const isClosed = tree.status === "closed";
  const closingInfo = formatClosingTime(tree.closes_at);
  const hasNodes = (tree.nodeCount || 0) > 0;

  return (
    <Link
      href={hasNodes ? `/tree/${tree.id}` : `/tree/${tree.id}?start=1`}
      className={cn(
        "block relative bg-bg-surface rounded-lg p-6 border transition-all",
        isClosed
          ? "border-gold/10 opacity-70"
          : "border-gold/20 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5"
      )}
    >
      {!isClosed && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-gold border-l-[40px] border-l-transparent" />
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-scripture text-xl text-cream">{tree.topic}</h3>
          {isClosed && (
            <span className="px-2 py-1 bg-ember/20 text-ember text-xs font-ui rounded">
              Closed
            </span>
          )}
        </div>

        {tree.description && (
          <p className="text-cream-muted text-sm font-ui">{tree.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {tree.scripture_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-vine/20 text-vine text-xs font-ui rounded"
            >
              {tag}
            </span>
          ))}
          {tree.scripture_tags.length > 3 && (
            <span className="px-2 py-1 text-cream-muted text-xs font-ui">
              +{tree.scripture_tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gold/10">
          <div className="text-sm text-cream-muted font-ui">
            {(tree as any).nodeCount || 0} verses shared
          </div>
          {!isClosed && closingInfo && (
            <div className="text-sm text-gold font-ui">{closingInfo}</div>
          )}
          {isClosed && tree.closes_at && (
            <div className="text-sm text-cream-muted font-ui">
              Closed {new Date(tree.closes_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}