"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Node, Scripture, Tree } from "@/lib/types";
import { ScriptureCard } from "@/components/ScriptureCard";
import { QRShare } from "@/components/QRShare";
import { ReactionBar } from "@/components/ReactionBar";
import { config, getSessionId, getChainUrl } from "@/lib/config";

interface NodeWithScripture extends Node {
  scripture: Scripture;
  tree: Tree;
}

export default function NodePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [nodeData, setNodeData] = useState<NodeWithScripture | null>(null);
  const [userNode, setUserNode] = useState<NodeWithScripture | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainLength, setChainLength] = useState(0);

  const sessionId = typeof window !== "undefined" ? getSessionId() : "";

  useEffect(() => {
    async function fetchNode() {
      const { data: node, error } = await supabase
        .from("nodes")
        .select(
          `
          *,
          scripture:scriptures(*),
          tree:trees(*)
        `
        )
        .eq("slug", slug)
        .single();

      if (error || !node) {
        setError("This link doesn't seem to work. The verse may have moved on.");
        setLoading(false);
        return;
      }

      setNodeData(node as NodeWithScripture);

      const { count } = await supabase
        .from("nodes")
        .select("*", { count: "exact", head: true })
        .eq("tree_id", node.tree_id);

      setChainLength((count || 0) - 1);

      if (node.session_id === sessionId) {
        setUserNode(node as NodeWithScripture);
      }

      setLoading(false);
    }

    if (slug && sessionId) {
      fetchNode();
    }
  }, [slug, sessionId]);

  const handleGenerate = async () => {
    if (!nodeData || !sessionId) return;

    setGenerating(true);
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
            tree_id: nodeData.tree_id,
            parent_node_id: nodeData.id,
            session_id: sessionId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong");
        setGenerating(false);
        return;
      }

      if (result.slug) {
        window.location.href = `/node/${result.slug}`;
      }
    } catch (err) {
      setError("Failed to generate. Please try again.");
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="text-cream-muted font-ui">Loading...</div>
      </div>
    );
  }

  if (error || !nodeData) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">📜</div>
          <h1 className="font-scripture text-2xl text-cream mb-4">
            Verse not found
          </h1>
          <p className="text-cream-muted font-ui">
            {error || "This link doesn't seem to work."}
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-2 bg-gold text-bg-deep font-ui rounded-lg hover:bg-gold-light transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const displayNode = userNode || nodeData;
  const isOwnNode = !!userNode;

  return (
    <div className="min-h-screen bg-bg-deep vine-pattern">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-8 font-ui text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {config.appName}
        </a>

        {!isOwnNode && chainLength > 0 && (
          <div className="text-center text-cream-muted text-sm font-ui mb-6 animate-fade-up">
            You are receiving this from a chain of {chainLength} people
          </div>
        )}

        <div className="space-y-6">
          <div className={userNode ? "animate-bloom" : "animate-fade-up"}>
            <ScriptureCard
              book={displayNode.scripture.book}
              chapter={displayNode.scripture.chapter}
              verseStart={displayNode.scripture.verse_start}
              verseEnd={displayNode.scripture.verse_end}
              text={displayNode.scripture.text}
              size="lg"
            />
          </div>

          {isOwnNode && (
            <div className="animate-bloom delay-200">
              <QRShare slug={slug} />
            </div>
          )}

          <div className="animate-fade-up delay-300">
            <ReactionBar nodeId={displayNode.id} />
          </div>

          <div className="animate-fade-up delay-400 flex flex-col sm:flex-row gap-3 justify-center">
            {!isOwnNode && nodeData.tree.status === "open" && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-6 py-3 bg-gold text-bg-deep font-ui font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? "Finding your verse..." : "Generate My Scripture"}
              </button>
            )}

            <a
              href={getChainUrl(slug)}
              className="px-6 py-3 border border-gold text-gold font-ui font-medium rounded-lg hover:bg-gold/10 transition-colors text-center"
            >
              See the Chain
            </a>
          </div>

          {nodeData.tree.status === "closed" && !isOwnNode && (
            <div className="text-center text-cream-muted text-sm font-ui mt-4">
              This tree has closed, but you can still view the chain.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}