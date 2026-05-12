"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Topic } from "@/lib/types";
import { config } from "@/lib/config";

export default function SeedPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const [csvData, setCsvData] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token === config.adminPassword) {
      setIsAuthenticated(true);
      fetchTopics();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTopics = async () => {
    const { data } = await supabase
      .from("topics")
      .select("id, name, created_at")
      .order("name", { ascending: true });
    if (data) setTopics(data);
    setLoading(false);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const fetchAndDownload = async () => {
    if (selectedTopics.length === 0) return;
    
    setFetching(true);
    setStatus("Starting...");
    
    const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
    if (!rapidApiKey) {
      setStatus("Error: RapidAPI key not configured in .env");
      setFetching(false);
      return;
    }

    const allVerses: string[] = [];
    // CSV header - citation only, no text
    allVerses.push("topic,citation");

    for (let i = 0; i < selectedTopics.length; i++) {
      const topic = selectedTopics[i];
      setStatus(`Fetching "${topic}"... (${i + 1}/${selectedTopics.length})`);
      
      try {
        const res = await fetch(
          `https://iq-bible.p.rapidapi.com/GetTopic?topic=${encodeURIComponent(topic)}`,
          {
            method: "GET",
            headers: {
              "x-rapidapi-key": rapidApiKey,
              "x-rapidapi-host": "iq-bible.p.rapidapi.com",
            },
          }
        );

        console.log("Response status for", topic, ":", res.status);

        if (!res.ok) {
          console.error(`API error for ${topic}: ${res.status}`);
          continue;
        }

        const data = await res.json();
        console.log("Data for", topic, ":", JSON.stringify(data).slice(0, 200));
        
        // API returns array directly, not {verses: [...]}
        const verses = Array.isArray(data) ? data : (data.verses || []);
        console.log("Verses count for", topic, ":", verses.length);
        
        for (const verse of verses) {
          const citation = verse.citation;
          if (!citation) continue;

          // Add to CSV - citation only
          allVerses.push(
            `"${topic}","${citation}"`
          );
        }
      } catch (err) {
        console.error(`Error fetching ${topic}:`, err);
      }

      // Rate limit delay
      await new Promise(r => setTimeout(r, 500));
    }

    setCsvData(allVerses.join("\n"));
    setStatus(`Done! ${allVerses.length - 1} citations ready for download.`);
    setFetching(false);
  };

  const downloadCsv = () => {
    if (!csvData) return;
    
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scriptures.csv";
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="text-center">
          <h1 className="font-scripture text-2xl text-cream mb-4">Admin Only</h1>
          <Link href="/admin" className="text-gold hover:text-gold-light">
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const availableTopics = topics;

  return (
    <div className="min-h-screen bg-bg-deep">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gold hover:text-gold-light">
            ← Back
          </Link>
          <h1 className="font-scripture text-2xl text-cream">Export Verses</h1>
        </div>

        <div className="bg-bg-surface rounded-lg p-6 border border-gold/20 space-y-6">
          <div>
            <h2 className="font-scripture text-xl text-cream mb-2">Select Topics to Export</h2>
            <p className="text-cream-muted text-sm font-ui mb-4">
              Select topics and click "Fetch & Download" to get a CSV file. 
              Then upload it to Supabase using Table Editor → Insert → Upload CSV.
            </p>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedTopics(topics.map(t => t.name))}
                className="text-xs text-gold hover:text-gold-light font-ui"
              >
                Select All
              </button>
              <span className="text-cream-muted text-xs">|</span>
              <button
                onClick={() => setSelectedTopics([])}
                className="text-xs text-gold hover:text-gold-light font-ui"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-6">
              {topics.map(topic => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggleTopic(topic.name)}
                  className={`px-3 py-2 rounded-lg text-sm font-ui transition-colors ${
                    selectedTopics.includes(topic.name)
                      ? "bg-gold text-bg-deep"
                      : "bg-bg-elevated text-cream-muted hover:text-cream"
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchAndDownload}
            disabled={fetching || selectedTopics.length === 0}
            className="w-full py-3 bg-gold text-bg-deep font-ui font-medium rounded-lg hover:bg-gold-light disabled:opacity-50"
          >
            {fetching ? "Fetching..." : `Fetch & Download CSV (${selectedTopics.length} topics)`}
          </button>

          {status && (
            <div className="p-4 bg-bg-elevated rounded-lg">
              <p className="text-cream font-ui">{status}</p>
            </div>
          )}

          {csvData && (
            <button
              onClick={downloadCsv}
              className="w-full py-3 border border-gold text-gold font-ui font-medium rounded-lg hover:bg-gold/10"
            >
              Download CSV
            </button>
          )}
        </div>

        <div className="mt-8 p-4 bg-bg-surface rounded-lg border border-gold/20">
          <h3 className="text-cream font-ui font-medium mb-2">How to upload to Supabase:</h3>
          <ol className="text-cream-muted text-sm font-ui space-y-2">
            <li>1. Download the CSV file</li>
            <li>2. Go to Supabase → Table Editor → scripture_topics</li>
            <li>3. Click "Insert" → "Upload CSV"</li>
            <li>4. Enable "Upsert" and set conflict keys to: topic, citation</li>
            <li>5. This will skip duplicates automatically</li>
          </ol>
        </div>
      </div>
    </div>
  );
}