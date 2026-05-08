const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BOOKS = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 },
  { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 },
  { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 },
  { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 },
];

const TESTAMENT_BOOKS = {
  Genesis: "old", Exodus: "old", Leviticus: "old", Numbers: "old", Deuteronomy: "old",
  Joshua: "old", Judges: "old", Ruth: "old", "1 Samuel": "old", "2 Samuel": "old",
  "1 Kings": "old", "2 Kings": "old", "1 Chronicles": "old", "2 Chronicles": "old",
  Ezra: "old", Nehemiah: "old", Esther: "old", Job: "old", Psalms: "old",
  Proverbs: "old", Ecclesiastes: "old", "Song of Solomon": "old", Isaiah: "old",
  Jeremiah: "old", Lamentations: "old", Ezekiel: "old", Daniel: "old", Hosea: "old",
  Joel: "old", Amos: "old", Obadiah: "old", Jonah: "old", Micah: "old",
  Nahum: "old", Habakkuk: "old", Zephaniah: "old", Haggai: "old", Zechariah: "old",
  Malachi: "old",
  Matthew: "new", Mark: "new", Luke: "new", John: "new", Acts: "new",
  Romans: "new", "1 Corinthians": "new", "2 Corinthians": "new", Galatians: "new",
  Ephesians: "new", Philippians: "new", Colossians: "new", "1 Thessalonians": "new",
  "2 Thessalonians": "new", "1 Timothy": "new", "2 Timothy": "new", Titus: "new",
  Philemon: "new", Hebrews: "new", James: "new", "1 Peter": "new", "2 Peter": "new",
  "1 John": "new", "2 John": "new", "3 John": "new", Jude: "new", Revelation: "new"
};

function getTags(book) {
  const tags = [];
  const gospels = ["Matthew", "Mark", "Luke", "John"];
  const epistles = ["Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", 
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", 
    "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", 
    "1 John", "2 John", "3 John", "Jude"];
  const wisdom = ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"];
  
  if (gospels.includes(book)) tags.push("gospel");
  if (epistles.includes(book)) tags.push("epistle");
  if (wisdom.includes(book)) tags.push("wisdom");
  if (book === "Genesis" || book === "Exodus") tags.push("creation");
  if (book === "Psalms") tags.push("praise", "worship");
  if (book === "Proverbs") tags.push("wisdom", "instruction");
  if (book === "John") tags.push("gospel", "love");
  if (book === "Romans") tags.push("epistle", "salvation");
  if (book === "Revelation") tags.push("prophecy", "future");
  
  return tags;
}

async function fetchChapter(book, chapter) {
  try {
    const res = await fetch(`https://bible-api.com/${book.replace(/ /g, "")}%20${chapter}`);
    const data = await res.json();
    return data.verses.map(v => ({
      verse: v.verse,
      text: v.text.trim()
    }));
  } catch (e) {
    console.log(`Failed to fetch ${book} ${chapter}: ${e.message}`);
    return [];
  }
}

async function seed() {
  console.log("Starting scripture seed...");
  
  let count = 0;
  const BATCH_SIZE = 50;
  
  for (const book of BOOKS) {
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      const verses = await fetchChapter(book.name, chapter);
      const testament = TESTAMENT_BOOKS[book.name] || "old";
      const tags = getTags(book.name);
      
      const records = verses.map(v => ({
        book: book.name,
        chapter,
        verse_start: v.verse,
        verse_end: v.verse,
        text: v.text,
        tags,
        testament
      }));
      
      const { error } = await supabase.from("scriptures").insert(records);
      if (error) {
        console.log(`Error inserting ${book.name} ${chapter}: ${error.message}`);
      } else {
        count += records.length;
        console.log(`Inserted ${book.name} ${chapter} (${count} verses total)`);
      }
      
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  console.log(`Done! Inserted ${count} verses.`);
}

seed();