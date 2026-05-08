import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const { tree_id, parent_node_id, session_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Validate tree is open
    const { data: tree, error: treeError } = await supabase
      .from("trees")
      .select("*")
      .eq("id", tree_id)
      .eq("status", "open")
      .single();

    if (treeError || !tree) {
      return new Response(JSON.stringify({ error: "Tree is not open" }), {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // 2. Check session hasn't already generated in this tree
    const { data: existing } = await supabase
      .from("nodes")
      .select("slug")
      .eq("tree_id", tree_id)
      .eq("session_id", session_id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ slug: existing.slug }), {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // 3. Get parent depth
    let depth = 0;
    if (parent_node_id) {
      const { data: parent } = await supabase
        .from("nodes")
        .select("depth")
        .eq("id", parent_node_id)
        .maybeSingle();
      if (parent) depth = parent.depth + 1;
    }

    // 4. Get verse from scripture_topics table
    const tags = tree.scripture_tags || [];
    let topic = "";
    let citation = "";
    let verseText = "";

    if (tags.length > 0) {
      // Pick a random tag from the tree
      topic = tags[Math.floor(Math.random() * tags.length)];
      
      // Get all verses for this topic from DB
      const { data: dbVerses } = await supabase
        .from("scripture_topics")
        .select("*")
        .eq("topic", topic);

      if (dbVerses && dbVerses.length > 0) {
        // Pick random verse from DB
        const dbVerse = dbVerses[Math.floor(Math.random() * dbVerses.length)];
        citation = dbVerse.citation;
        verseText = dbVerse.text;

        // If text is missing, fetch from API and save
        if (!verseText && citation) {
          try {
            const bibleRes = await fetch(`https://bible-api.com/${encodeURIComponent(citation)}`);
            const bibleData = await bibleRes.json();
            verseText = bibleData.text || "";

            // Save to DB for future
            if (verseText) {
              await supabase
                .from("scripture_topics")
                .update({ text: verseText })
                .eq("topic", topic)
                .eq("citation", citation);
            }
          } catch (e) {
            console.log("Bible API error:", e.message);
          }
        }
      } else {
        // No verses in DB for this topic - fetch from API
        const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
        
        if (rapidApiKey) {
          try {
            const iqRes = await fetch(
              `https://iq-bible.p.rapidapi.com/GetTopic?topic=${encodeURIComponent(topic)}`,
              {
                method: "GET",
                headers: {
                  "x-rapidapi-key": rapidApiKey,
                  "x-rapidapi-host": Deno.env.get("RAPIDAPI_HOST") || "iq-bible.p.rapidapi.com",
                },
              }
            );
            
            const iqData = await iqRes.json();
            const verses = iqData.verses || [];
            
            if (verses.length > 0) {
              const randomVerse = verses[Math.floor(Math.random() * verses.length)];
              citation = randomVerse.citation;

              // Fetch verse text
              if (citation) {
                const bibleRes = await fetch(`https://bible-api.com/${encodeURIComponent(citation)}`);
                const bibleData = await bibleRes.json();
                verseText = bibleData.text || "";

                // Save to DB for future use
                if (verseText) {
                  await supabase.from("scripture_topics").insert({
                    topic,
                    citation,
                    text: verseText
                  });
                }
              }
            }
          } catch (e) {
            console.log("iq-bible API error:", e.message);
          }
        }
      }
    }

    // Fallback if still no verse
    if (!verseText) {
      const bookNames = ["Genesis", "Psalms", "Proverbs", "John", "Romans"];
      const randomBook = bookNames[Math.floor(Math.random() * bookNames.length)];
      const randomChapter = Math.floor(Math.random() * 50) + 1;
      const randomVerse = Math.floor(Math.random() * 30) + 1;
      citation = `${randomBook} ${randomChapter}:${randomVerse}`;
      
      const bibleRes = await fetch(`https://bible-api.com/${encodeURIComponent(citation)}`);
      const bibleData = await bibleRes.json();
      verseText = bibleData.text || "";
    }

    if (!verseText) {
      return new Response(JSON.stringify({ error: "No verse found" }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // 5. Parse citation for the scriptures table
    const match = citation.match(/^(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
    const book = match ? match[1].trim() : citation.split(" ")[0];
    const chapter = match ? parseInt(match[2]) : 1;
    const verseStart = match ? parseInt(match[3]) : 1;
    const verseEnd = match && match[4] ? parseInt(match[4]) : verseStart;

    const OLD_TESTAMENT_BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
      "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
      "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms",
      "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
      "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah",
      "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"];
    const testament = OLD_TESTAMENT_BOOKS.includes(book) ? "old" : "new";

    // 6. Insert into scriptures table
    const { data: existingScripture } = await supabase
      .from("scriptures")
      .select("id")
      .eq("book", book)
      .eq("chapter", chapter)
      .eq("verse_start", verseStart)
      .limit(1)
      .maybeSingle();

    let scriptureId;
    if (existingScripture) {
      scriptureId = existingScripture.id;
    } else {
      const { data: newScripture, error: scriptureInsertError } = await supabase
        .from("scriptures")
        .insert({
          book,
          chapter,
          verse_start: verseStart,
          verse_end: verseEnd,
          text: verseText,
          testament,
          tags: topic ? [topic] : []
        })
        .select("id")
        .single();
      
      if (scriptureInsertError || !newScripture) {
        return new Response(JSON.stringify({ error: "Failed to insert scripture" }), {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
      scriptureId = newScripture.id;
    }

    // 7. Generate slug
    const slug = crypto.randomUUID().split("-")[0] + crypto.randomUUID().split("-")[0];

    // 8. Insert node
    const { data: node, error: insertError } = await supabase
      .from("nodes")
      .insert({
        slug,
        tree_id,
        parent_node_id: parent_node_id || null,
        scripture_id: scriptureId,
        session_id,
        depth
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: "Insert error: " + insertError.message }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    // Return the new node with scripture details
    const { data: scriptureData } = await supabase
      .from("scriptures")
      .select("*")
      .eq("id", scriptureId)
      .single();

    return new Response(JSON.stringify({ 
      slug: node.slug, 
      scripture: scriptureData
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error: " + e.message }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
});