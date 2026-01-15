import { useEffect, useMemo, useState } from "react";
import { BookOpen, Sparkles, Trash2 } from "lucide-react";
import verses from "../t_kjv.json";

const BOOKS = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
];

const STORAGE_KEY = "bible-gacha-album";

const getReference = (verse) => {
  const bookIndex = Number(verse.b) - 1;
  const bookName = BOOKS[bookIndex] ?? "Unknown";
  return `${bookName} ${verse.c}:${verse.v}`;
};

const getRandomVerse = () => {
  const index = Math.floor(Math.random() * verses.length);
  const verse = verses[index];
  return {
    id: verse.id,
    text: verse.t,
    reference: getReference(verse),
  };
};

const loadAlbum = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function App() {
  const [currentVerse, setCurrentVerse] = useState(() => getRandomVerse());
  const [album, setAlbum] = useState([]);
  const [revealKey, setRevealKey] = useState(0);

  useEffect(() => {
    setAlbum(loadAlbum());
  }, []);

  const hasInAlbum = useMemo(() => {
    return album.some((entry) => entry.id === currentVerse.id);
  }, [album, currentVerse]);

  const drawVerse = () => {
    setCurrentVerse(getRandomVerse());
    setRevealKey((prev) => prev + 1);
  };

  const addToAlbum = () => {
    if (hasInAlbum) {
      return;
    }
    const updated = [currentVerse, ...album];
    setAlbum(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeFromAlbum = (id) => {
    const updated = album.filter((entry) => entry.id !== id);
    setAlbum(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-5 py-10">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200/80">
            Bible Gacha
          </p>
          <h1 className="mt-2 font-title text-4xl text-amber-100 drop-shadow">
            聖書ガチャ
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            夜の修道院で授かる一節を開いてください。
          </p>
        </header>

        <section className="parchment parchment-border rounded-3xl px-6 py-8 text-slate-900">
          <div className="flex items-center gap-3 text-amber-800/80">
            <BookOpen className="h-5 w-5" />
            <span className="text-xs uppercase tracking-[0.3em]">Sacred Draw</span>
          </div>

          <div key={revealKey} className="mt-6 animate-fadeIn space-y-4">
            <p className="text-lg font-medium leading-relaxed text-slate-800">
              “{currentVerse.text}”
            </p>
            <p className="text-sm font-semibold tracking-wide text-amber-800">
              {currentVerse.reference}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={drawVerse}
              className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-amber-100 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Sparkles className="h-4 w-4" />
              Draw
            </button>
            <button
              type="button"
              onClick={addToAlbum}
              disabled={hasInAlbum}
              className="rounded-full border border-amber-800/40 px-5 py-3 text-sm font-semibold text-amber-900 transition hover:border-amber-900 hover:text-amber-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add to Album
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-title text-2xl text-amber-100">Collection</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
              {album.length} Verse{album.length === 1 ? "" : "s"}
            </span>
          </div>

          {album.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200/30 px-4 py-6 text-center text-sm text-slate-400">
              まだコレクションがありません。お気に入りの聖句を保存しましょう。
            </div>
          ) : (
            <ul className="space-y-4">
              {album.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-amber-200/20 bg-slate-900/60 px-4 py-4 shadow"
                >
                  <p className="text-sm leading-relaxed text-slate-200">
                    “{entry.text}”
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-amber-200/80">
                    <span>{entry.reference}</span>
                    <button
                      type="button"
                      onClick={() => removeFromAlbum(entry.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-amber-200 transition hover:border-amber-200/60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
