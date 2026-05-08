export interface Tree {
  id: string;
  topic: string;
  description: string | null;
  status: "open" | "closed";
  scripture_tags: string[];
  created_at: string;
  closes_at: string | null;
}

export interface Scripture {
  id: string;
  book: string;
  chapter: number;
  verse_start: number;
  verse_end?: number | null;
  text: string;
  tags: string[];
  testament: "old" | "new";
}

export interface Node {
  id: string;
  slug: string;
  tree_id: string;
  parent_node_id: string | null;
  scripture_id: string;
  session_id: string;
  depth: number;
  created_at: string;
  scripture?: Scripture;
}

export interface Reaction {
  id: string;
  node_id: string;
  type: "pray" | "heart" | "cross" | "dove";
  session_id: string;
  created_at: string;
}

export interface ReactionCount {
  type: string;
  count: number;
}

export interface ChainNode {
  id: string;
  slug: string;
  scripture_id: string;
  parent_node_id: string | null;
  depth: number;
  created_at: string;
  scripture?: Scripture;
}

export interface Topic {
  id: string;
  name: string;
  created_at: string;
}

export const APP_NAME = "Scripture Chain";
export const APP_TAGLINE = "Pass forward the Word";