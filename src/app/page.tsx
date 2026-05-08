"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tree } from "@/lib/types";
import { TreeCard } from "@/components/TreeCard";
import { config, getBaseUrl } from "@/lib/config";

export default function HomePage() {
  const [trees, setTrees] = useState<(Tree & { nodeCount?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrees() {
      const { data: treesData, error } = await supabase
        .from("trees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trees:", error);
        setLoading(false);
        return;
      }

      const treesWithCounts = await Promise.all(
        (treesData || []).map(async (tree) => {
          const { count } = await supabase
            .from("nodes")
            .select("*", { count: "exact", head: true })
            .eq("tree_id", tree.id);

          return { ...tree, nodeCount: count || 0 };
        })
      );

      setTrees(treesWithCounts);
      setLoading(false);
    }

    fetchTrees();
  }, []);

  const activeTrees = trees.filter((t) => t.status === "open");
  const pastTrees = trees.filter((t) => t.status === "closed");

  const scrollToTrees = () => {
    document.getElementById("trees-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen vine-pattern">
      <div className="relative bg-gradient-to-b from-bg-deep via-bg-deep to-bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center animate-fade-up">
            <div className="inline-flex items-center justify-center gap-2 mb-6">
              <svg
                className="w-8 h-8 text-gold"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L9 9l-7 1 5 5-1 7 6-3 6 3-1-7 5-5-7-1z" />
              </svg>
              <span className="text-gold-light font-ui text-sm uppercase tracking-widest">
                {config.appName}
              </span>
            </div>

            <h1 className="font-scripture text-4xl md:text-5xl lg:text-6xl text-cream mb-6">
              Pass forward the Word
            </h1>

            <p className="text-cream-muted text-lg font-ui max-w-xl mx-auto mb-10">
              Join a chain of scriptures shared in faith. Each verse connects to the
              next, building a journey of hope and truth.
            </p>

            <button
              onClick={scrollToTrees}
              className="px-8 py-3 bg-gold text-bg-deep font-ui font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              Join a Tree
            </button>
          </div>
        </div>
      </div>

      <div id="trees-section" className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="font-scripture text-2xl text-cream mb-2">Active Trees</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto" />
        </div>

        {loading ? (
          <div className="text-center text-cream-muted py-10">Loading...</div>
        ) : activeTrees.length === 0 ? (
          <div className="text-center text-cream-muted py-10">
            <p>No active trees right now.</p>
            <p className="text-sm mt-2">
              Check back soon or contact an admin to start one.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeTrees.map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        )}

        {pastTrees.length > 0 && (
          <>
            <div className="text-center mt-16 mb-10">
              <h2 className="font-scripture text-2xl text-cream mb-2">Past Trees</h2>
              <div className="w-16 h-0.5 bg-gold/50 mx-auto" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {pastTrees.map((tree) => (
                <TreeCard key={tree.id} tree={tree} />
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="text-center py-8 text-cream-muted text-sm font-ui">
        <p>{config.appName} &middot; {config.appTagline}</p>
      </footer>
    </div>
  );
}