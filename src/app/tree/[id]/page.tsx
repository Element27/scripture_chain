"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Tree, Node, Scripture } from "@/lib/types";
import { config, getSessionId } from "@/lib/config";
import { ScriptureCard } from "@/components/ScriptureCard";

interface TreeData extends Tree {
  firstNode?: Node & { scripture?: Scripture };
  lastNode?: Node & { scripture?: Scripture };
  totalNodes?: number;
}

export default function TreePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const treeId = params.id as string;

  const [tree, setTree] = useState<TreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = typeof window !== "undefined" ? getSessionId() : "";

  useEffect(() => {
    async function fetchTree() {
      const { data: treeData, error: treeError } = await supabase
        .from("trees")
        .select("*")
        .eq("id", treeId)
        .single();

      if (treeError || !treeData) {
        setError("Tree not found");
        setLoading(false);
        return;
      }

      // Get first node
      const { data: firstNode } = await supabase
        .from("nodes")
        .select("*, scripture:scriptures(*)")
        .eq("tree_id", treeId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      // Get last node (most recent)
      const { data: lastNode } = await supabase
        .from("nodes")
        .select("*, scripture:scriptures(*)")
        .eq("tree_id", treeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get total count
      const { count } = await supabase
        .from("nodes")
        .select("*", { count: "exact", head: true })
        .eq("tree_id", treeId);

      setTree({ 
        ...treeData, 
        firstNode: firstNode || undefined, 
        lastNode: lastNode || undefined,
        totalNodes: count || 0
      });
      setLoading(false);
    }

    fetchTree();
  }, [treeId]);

  const handleStartTree = async () => {
    if (!sessionId) return;

    setStarting(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-scripture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            tree_id: treeId,
            parent_node_id: null,
            session_id: sessionId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to start tree");
        setStarting(false);
        return;
      }

      if (result.slug) {
        router.push(`/node/${result.slug}`);
      }
    } catch (err) {
      setError("Failed to start tree. Please try again.");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="text-cream-muted font-ui">Loading...</div>
      </div>
    );
  }

  if (error && !tree) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="font-scripture text-2xl text-cream mb-4">Error</h1>
          <p className="text-cream-muted font-ui">{error}</p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-2 bg-gold text-bg-deep font-ui rounded-lg hover:bg-gold-light"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = tree?.status === "closed";
  const hasNodes = (tree?.totalNodes || 0) > 0;

  return (
    <div className="min-h-screen bg-bg-deep vine-pattern">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-8 font-ui text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {config.appName}
        </Link>

        <div className="bg-bg-surface rounded-lg p-6 border border-gold/20">
          <h1 className="font-scripture text-3xl text-cream mb-2">{tree?.topic}</h1>
          {tree?.description && (
            <p className="text-cream-muted font-ui mb-4">{tree.description}</p>
          )}

          {tree && tree.scripture_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tree.scripture_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-vine/20 text-vine text-xs font-ui rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {isClosed && (
            <div className="mb-4 px-3 py-2 bg-ember/20 text-ember text-sm font-ui rounded">
              This tree has closed
            </div>
          )}

          {!hasNodes && !isClosed && (
            <div className="mt-6">
              <p className="text-cream-muted font-ui mb-4">
                This tree is waiting for its first verse. Be the first to share scripture!
              </p>
              <button
                onClick={handleStartTree}
                disabled={starting}
                className="w-full py-3 bg-gold text-bg-deep font-ui font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
              >
                {starting ? "Starting..." : "Plant the First Seed"}
              </button>
              {error && <p className="text-ember text-sm font-ui mt-3">{error}</p>}
            </div>
          )}

          {hasNodes && (
            <div className="mt-6 space-y-4">
              {/* First verse */}
              {tree?.firstNode?.scripture && (
                <div>
                  <p className="text-cream-muted text-xs font-ui mb-2">First Verse</p>
                  <ScriptureCard
                    book={tree.firstNode.scripture.book}
                    chapter={tree.firstNode.scripture.chapter}
                    verseStart={tree.firstNode.scripture.verse_start}
                    verseEnd={tree.firstNode.scripture.verse_end}
                    text={tree.firstNode.scripture.text}
                    size="sm"
                  />
                </div>
              )}

              {/* Verse count */}
              <div className="text-center py-2">
                <span className="text-gold font-ui text-sm">
                  {tree?.totalNodes} verse{tree?.totalNodes !== 1 ? "s" : ""} shared
                </span>
                {tree?.totalNodes && tree.totalNodes > 2 && (
                  <p className="text-cream-muted text-xs font-ui mt-1">
                    + {tree.totalNodes - 2} more in between
                  </p>
                )}
              </div>

              {/* Most recent verse */}
              {tree?.lastNode?.scripture && tree.lastNode.id !== tree.firstNode?.id && (
                <div>
                  <p className="text-cream-muted text-xs font-ui mb-2">Most Recent</p>
                  <ScriptureCard
                    book={tree.lastNode.scripture.book}
                    chapter={tree.lastNode.scripture.chapter}
                    verseStart={tree.lastNode.scripture.verse_start}
                    verseEnd={tree.lastNode.scripture.verse_end}
                    text={tree.lastNode.scripture.text}
                    size="sm"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 space-y-3">
                <Link
                  href={`/chain/${tree?.firstNode?.slug}`}
                  className="block w-full py-3 bg-gold text-bg-deep font-ui font-medium rounded-lg hover:bg-gold-light transition-colors text-center"
                >
                  View Full Chain
                </Link>
                {!isClosed && (
                  <p className="text-cream-muted text-sm font-ui text-center">
                    Share this link to add more verses
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}