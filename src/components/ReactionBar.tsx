"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getSessionId } from "@/lib/config";
import { cn } from "@/lib/utils";

interface ReactionBarProps {
  nodeId: string;
}

type ReactionType = "pray" | "heart" | "cross" | "dove";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "pray", emoji: "🙏", label: "Pray" },
  { type: "heart", emoji: "❤️", label: "Love" },
  { type: "cross", emoji: "✝️", label: "Faith" },
  { type: "dove", emoji: "🕊️", label: "Peace" },
];

interface ReactionCount {
  type: ReactionType;
  count: number;
}

export function ReactionBar({ nodeId }: ReactionBarProps) {
  const [counts, setCounts] = useState<ReactionCount[]>([]);
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReactions() {
      const sessionId = getSessionId();

      const [countResult, userResult] = await Promise.all([
        supabase
          .from("reactions")
          .select("type")
          .eq("node_id", nodeId),
        supabase
          .from("reactions")
          .select("type")
          .eq("node_id", nodeId)
          .eq("session_id", sessionId),
      ]);

      if (countResult.data) {
        const countsMap = countResult.data.reduce(
          (acc, r) => {
            acc[r.type as ReactionType] = (acc[r.type as ReactionType] || 0) + 1;
            return acc;
          },
          {} as Record<ReactionType, number>
        );

        setCounts(
          REACTIONS.map((r) => ({
            type: r.type,
            count: countsMap[r.type] || 0,
          }))
        );
      }

      if (userResult.data) {
        setUserReactions(
          new Set(userResult.data.map((r) => r.type as ReactionType))
        );
      }

      setLoading(false);
    }

    fetchReactions();
  }, [nodeId]);

  const handleReaction = async (type: ReactionType) => {
    const sessionId = getSessionId();
    const alreadyReacted = userReactions.has(type);

    if (alreadyReacted) {
      setCounts((prev) =>
        prev.map((c) =>
          c.type === type ? { ...c, count: Math.max(0, c.count - 1) } : c
        )
      );
      setUserReactions((prev) => {
        const next = new Set(prev);
        next.delete(type);
        return next;
      });

      await supabase
        .from("reactions")
        .delete()
        .eq("node_id", nodeId)
        .eq("session_id", sessionId)
        .eq("type", type);
    } else {
      setCounts((prev) =>
        prev.map((c) => (c.type === type ? { ...c, count: c.count + 1 } : c))
      );
      setUserReactions((prev) => new Set(prev).add(type));

      await supabase.from("reactions").insert({
        node_id: nodeId,
        type,
        session_id: sessionId,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center gap-6 py-4">
        {REACTIONS.map((r) => (
          <div
            key={r.type}
            className="flex items-center gap-2 text-cream-muted"
          >
            <span className="text-xl">{r.emoji}</span>
            <span className="text-sm">-</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-4 py-4">
      {REACTIONS.map((reaction) => {
        const count = counts.find((c) => c.type === reaction.type)?.count || 0;
        const isActive = userReactions.has(reaction.type);

        return (
          <button
            key={reaction.type}
            onClick={() => handleReaction(reaction.type)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full transition-all",
              "hover:scale-110 active:scale-95",
              isActive
                ? "bg-gold/20 text-gold"
                : "bg-bg-surface text-cream-muted hover:bg-bg-elevated"
            )}
          >
            <span className={cn("text-xl", isActive && "animate-bounce-in")}>
              {reaction.emoji}
            </span>
            <span className="text-sm font-ui">{count}</span>
          </button>
        );
      })}
    </div>
  );
}