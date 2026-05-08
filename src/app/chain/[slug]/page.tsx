"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChainNode, Scripture, Tree, Node } from "@/lib/types";
import { ChainView } from "@/components/ChainView";
import { config, getSessionId, getNodeUrl } from "@/lib/config";

interface ChainData {
  nodes: (ChainNode & { scripture: Scripture })[];
  currentNode: Node;
  tree: Tree;
}

export default function ChainPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const sessionId = typeof window !== "undefined" ? getSessionId() : "";

  const [chainData, setChainData] = useState<ChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChain() {
      const { data: currentNode, error: nodeError } = await supabase
        .from("nodes")
        .select(
          `
          *,
          tree:trees(*)
        `
        )
        .eq("slug", slug)
        .single();

      if (nodeError || !currentNode) {
        setError("This link doesn't seem to work.");
        setLoading(false);
        return;
      }

      // Get ALL nodes in the tree (not just one path)
      const { data: allNodes, error: nodesError } = await supabase
        .from("nodes")
        .select(
          `
          *,
          scripture:scriptures(*)
        `
        )
        .eq("tree_id", currentNode.tree_id)
        .order("created_at", { ascending: true });

      if (nodesError || !allNodes) {
        setError("Failed to load the chain.");
        setLoading(false);
        return;
      }

      setChainData({
        nodes: allNodes as (ChainNode & { scripture: Scripture })[],
        currentNode: currentNode as Node,
        tree: (currentNode as any).tree as Tree,
      });
      setLoading(false);
    }

    if (slug) {
      fetchChain();
    }
  }, [slug]);

  const handleGenerate = async () => {
    if (!chainData?.currentNode || !sessionId) return;

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
            tree_id: chainData.currentNode.tree_id,
            parent_node_id: chainData.currentNode.id,
            session_id: sessionId,
          }),
        }
      );

      const result = await response.json();

      if (result.slug) {
        router.push(`/node/${result.slug}`);
      }
    } catch (err) {
      console.error("Failed to generate:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="text-cream-muted font-ui">Loading the journey...</div>
      </div>
    );
  }

  if (error || !chainData) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="font-scripture text-2xl text-cream mb-4">
            Chain not found
          </h1>
          <p className="text-cream-muted font-ui">{error || "Something went wrong."}</p>
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

  const isOwnNode = chainData.currentNode.session_id === sessionId;
  const canGenerate = !isOwnNode && chainData.tree.status === "open";

  return (
    <div className="min-h-screen bg-bg-deep vine-pattern">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <a
          href={`/node/${slug}`}
          className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-8 font-ui text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to your verse
        </a>

        <div className="text-center mb-8">
          <h1 className="font-scripture text-3xl text-cream mb-2">The Journey</h1>
          <p className="text-cream-muted font-ui">
            From the beginning to now
          </p>
        </div>

        <div className="bg-bg-surface/50 rounded-lg p-6 mb-6 border border-gold/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gold-light font-ui text-sm uppercase tracking-wider">
                Tree
              </div>
              <div className="font-scripture text-xl text-cream">
                {chainData.tree.topic}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gold-light font-ui text-sm uppercase tracking-wider">
                Verses
              </div>
              <div className="font-ui text-2xl text-gold">
                {chainData.nodes.length}
              </div>
            </div>
          </div>
        </div>

        <ChainView nodes={chainData.nodes} currentSlug={slug} />

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {canGenerate && (
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-gold text-bg-deep font-ui font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              Add Your Verse
            </button>
          )}

          {!isOwnNode && (
            <a
              href={getNodeUrl(slug)}
              className="px-6 py-3 border border-gold text-gold font-ui font-medium rounded-lg hover:bg-gold/10 transition-colors text-center"
            >
              Return to Your Verse
            </a>
          )}
        </div>

        {chainData.tree.status === "closed" && (
          <div className="text-center text-cream-muted text-sm font-ui mt-6">
            This tree has closed
          </div>
        )}
      </div>
    </div>
  );
}