"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Tree, Topic } from "@/lib/types";
import { config } from "@/lib/config";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trees, setTrees] = useState<(Tree & { nodeCount?: number })[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newTree, setNewTree] = useState({
    topic: "",
    description: "",
    scripture_tags: [] as string[],
    closes_at: "",
  });
  const [editingTreeId, setEditingTreeId] = useState<string | null>(null);
  const [editedTree, setEditedTree] = useState({
    topic: "",
    description: "",
    closes_at: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token === config.adminPassword) {
      setIsAuthenticated(true);
      fetchTrees();
      fetchTopics();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTopics = async () => {
    const { data } = await supabase
      .from("topics")
      .select("id, name")
      .order("name", { ascending: true });
    if (data) setTopics(data);
  };

  const fetchTrees = async () => {
    const { data } = await supabase
      .from("trees")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const treesWithCounts = await Promise.all(
        data.map(async (tree) => {
          const { count } = await supabase
            .from("nodes")
            .select("*", { count: "exact", head: true })
            .eq("tree_id", tree.id);
          return { ...tree, nodeCount: count || 0 };
        })
      );
      setTrees(treesWithCounts);
    }
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === config.adminPassword) {
      localStorage.setItem("admin_token", password);
      setIsAuthenticated(true);
      fetchTrees();
    } else {
      setLoginError("Incorrect password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setLoading(true);
    setPassword("");
  };

  const handleCreateTree = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("trees").insert({
      topic: newTree.topic,
      description: newTree.description || null,
      scripture_tags: newTree.scripture_tags,
      closes_at: newTree.closes_at || null,
    });

    if (!error) {
      setShowCreateForm(false);
      setNewTree({ topic: "", description: "", scripture_tags: [], closes_at: "" });
      fetchTrees();
    }
  };

  const handleCloseTree = async (treeId: string) => {
    await supabase
      .from("trees")
      .update({ status: "closed" })
      .eq("id", treeId);
    fetchTrees();
  };

  const handleReopenTree = async (treeId: string) => {
    await supabase
      .from("trees")
      .update({ status: "open" })
      .eq("id", treeId);
    fetchTrees();
  };

  const isTreeOlderThan3Days = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 3;
  };

  const startEditTree = (tree: Tree) => {
    setEditingTreeId(tree.id);
    setEditedTree({
      topic: tree.topic,
      description: tree.description || "",
      closes_at: tree.closes_at ? tree.closes_at.slice(0, 16) : "",
    });
  };

  const saveTreeEdit = async (treeId: string) => {
    const { error } = await supabase
      .from("trees")
      .update({
        topic: editedTree.topic,
        description: editedTree.description || null,
        closes_at: editedTree.closes_at || null,
      })
      .eq("id", treeId);

    if (!error) {
      setEditingTreeId(null);
      setEditedTree({ topic: "", description: "", closes_at: "" });
      fetchTrees();
    }
  };

  const cancelEdit = () => {
    setEditingTreeId(null);
    setEditedTree({ topic: "", description: "", closes_at: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="text-cream-muted font-ui">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-scripture text-3xl text-cream mb-2">Admin</h1>
            <p className="text-cream-muted font-ui">Enter your password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-bg-surface border border-gold/20 rounded-lg text-cream placeholder:text-cream-muted font-ui"
            />
            {loginError && (
              <p className="text-ember text-sm font-ui">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gold text-bg-deep font-ui font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              Enter
            </button>
          </form>

          <a href="/" className="block text-center mt-6 text-gold hover:text-gold-light font-ui text-sm">
            ← Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-deep">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-scripture text-3xl text-cream">Admin</h1>
          <div className="flex gap-4">
            <a
              href="/admin/seed"
              className="text-gold hover:text-gold-light font-ui text-sm"
            >
              Seed Verses
            </a>
            <button
              onClick={handleLogout}
              className="text-cream-muted hover:text-cream font-ui text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-6 px-6 py-3 bg-gold text-bg-deep font-ui font-medium rounded-lg hover:bg-gold-light transition-colors"
        >
          {showCreateForm ? "Cancel" : "Create New Tree"}
        </button>

        {showCreateForm && (
          <form onSubmit={handleCreateTree} className="mb-8 p-6 bg-bg-surface rounded-lg border border-gold/20">
            <div className="space-y-4">
              <div>
                <label className="block text-cream-muted text-sm font-ui mb-2">
                  Topic Name
                </label>
                <input
                  type="text"
                  value={newTree.topic}
                  onChange={(e) => setNewTree((prev) => ({ ...prev, topic: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-bg-elevated border border-gold/20 rounded-lg text-cream font-ui"
                  placeholder="e.g., Faith, Prayer, Advent"
                />
              </div>

              <div>
                <label className="block text-cream-muted text-sm font-ui mb-2">
                  Description
                </label>
                <textarea
                  value={newTree.description}
                  onChange={(e) => setNewTree((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-elevated border border-gold/20 rounded-lg text-cream font-ui"
                  rows={2}
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-cream-muted text-sm font-ui mb-2">
                  Topic
                </label>
                <select
                  value={newTree.scripture_tags[0] || ""}
                  onChange={(e) => setNewTree((prev) => ({ ...prev, scripture_tags: e.target.value ? [e.target.value] : [] }))}
                  className="w-full px-4 py-2 bg-bg-elevated border border-gold/20 rounded-lg text-cream font-ui"
                >
                  <option value="">Select a topic...</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.name}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-cream-muted text-sm font-ui mb-2">
                  Closes At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={newTree.closes_at}
                  onChange={(e) => setNewTree((prev) => ({ ...prev, closes_at: e.target.value }))}
                  className="w-full px-4 py-2 bg-bg-elevated border border-gold/20 rounded-lg text-cream font-ui"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold text-bg-deep font-ui font-medium rounded-lg hover:bg-gold-light transition-colors"
              >
                Create Tree
              </button>
            </div>
          </form>
        )}

        <div>
          <h2 className="font-scripture text-xl text-cream mb-4">All Trees</h2>
          <div className="space-y-4">
            {trees.map((tree) => {
              const isOld = isTreeOlderThan3Days(tree.created_at);
              const isEditing = editingTreeId === tree.id;

              return (
                <div
                  key={tree.id}
                  className="p-4 bg-bg-surface rounded-lg border border-gold/20"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-cream-muted text-xs font-ui mb-1">Topic (locked after 3 days)</label>
                        <input
                          type="text"
                          value={editedTree.topic}
                          onChange={(e) => setEditedTree((prev) => ({ ...prev, topic: e.target.value }))}
                          disabled={isOld}
                          className="w-full px-3 py-2 bg-bg-elevated border border-gold/20 rounded-lg text-cream font-ui disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-cream-muted text-xs font-ui mb-1">Description</label>
                        <textarea
                          value={editedTree.description}
                          onChange={(e) => setEditedTree((prev) => ({ ...prev, description: e.target.value }))}
                          disabled={isOld}
                          className="w-full px-3 py-2 bg-bg-elevated border border-gold/20 rounded-lg text-cream font-ui disabled:opacity-50"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-cream-muted text-xs font-ui mb-1">Close Date (editable)</label>
                        <input
                          type="datetime-local"
                          value={editedTree.closes_at}
                          onChange={(e) => setEditedTree((prev) => ({ ...prev, closes_at: e.target.value }))}
                          className="w-full px-3 py-2 bg-bg-elevated border border-gold/20 rounded-lg text-cream font-ui"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveTreeEdit(tree.id)}
                          className="px-3 py-1 bg-gold text-bg-deep font-ui text-sm rounded-lg hover:bg-gold-light"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 border border-gold/20 text-cream-muted font-ui text-sm rounded-lg hover:text-cream"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-scripture text-lg text-cream">
                          {tree.topic}
                        </div>
                        <div className="text-cream-muted text-sm font-ui">
                          {tree.nodeCount} nodes · {tree.status}
                        </div>
                        {tree.scripture_tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {tree.scripture_tags.map((tag) => (
                              <span key={tag} className="px-2 py-0.5 bg-vine/20 text-vine text-xs font-ui rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditTree(tree)}
                          className="px-3 py-1 border border-gold text-gold font-ui text-sm rounded-lg hover:bg-gold/10 transition-colors"
                        >
                          Edit
                        </button>
                        {tree.status === "open" ? (
                          <button
                            onClick={() => handleCloseTree(tree.id)}
                            className="px-3 py-1 border border-ember text-ember font-ui text-sm rounded-lg hover:bg-ember/10 transition-colors"
                          >
                            Close
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReopenTree(tree.id)}
                            className="px-3 py-1 border border-gold text-gold font-ui text-sm rounded-lg hover:bg-gold/10 transition-colors"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <a href="/" className="block text-center mt-8 text-gold hover:text-gold-light font-ui text-sm">
          ← Return Home
        </a>
      </div>
    </div>
  );
}